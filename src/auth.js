import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { User } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        firstName: { label: 'First Name', type: 'text' },
        lastName: { label: 'Last Name', type: 'text' },
        username: { label: 'Username', type: 'text' },
        isSignup: { label: 'Is Signup', type: 'hidden' },
      },
      async authorize(credentials) {
        console.log('Auth function called with:', {
          email: credentials.email,
          isSignup: credentials.isSignup,
        });
        try {
          const { email, password, firstName, lastName, username, isSignup } =
            credentials;

          if (isSignup === 'true') {
            // Handle signup
            if (!email || !password || !firstName || !lastName) {
              throw new Error('Please fill in all required fields');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              throw new Error('Please enter a valid email address');
            }

            // Validate password strength
            if (password.length < 6) {
              throw new Error('Password must be at least 6 characters long');
            }

            // Check if user already exists
            const existingUser = await db
              .select()
              .from(User)
              .where(eq(User.email, email))
              .limit(1);

            if (existingUser.length > 0) {
              throw new Error(
                'An account with this email already exists. Please login instead.'
              );
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create new user
            const newUser = await db
              .insert(User)
              .values({
                firstName,
                lastName,
                username: username || email.split('@')[0],
                email,
                password: hashedPassword,
                role: 'user',
              })
              .returning({
                id: User.id,
                firstName: User.firstName,
                lastName: User.lastName,
                username: User.username,
                email: User.email,
                role: User.role,
                createdAt: User.createdAt,
              });

            const user = newUser[0];
            return {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              role: user.role,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
            };
          } else {
            // Handle login
            if (!email || !password) {
              throw new Error('Please enter both email and password');
            }

            // Find user by email
            const userResult = await db
              .select()
              .from(User)
              .where(eq(User.email, email))
              .limit(1);

            if (!userResult.length) {
              throw new Error('No account found with this email address');
            }

            const existingUser = userResult[0];
            console.log('User data:', {
              email: existingUser.email,
              isVerified: existingUser.isVerified,
              isVerifiedType: typeof existingUser.isVerified,
            });

            // Check password
            const isPasswordValid = await bcrypt.compare(
              password,
              existingUser.password
            );

            if (!isPasswordValid) {
              throw new Error('Incorrect password');
            }

            // Check if user is verified - return user data with verification status
            if (existingUser.isVerified !== true) {
              console.log('User needs verification, returning unverified user');
              return {
                id: existingUser.id,
                name: `${existingUser.firstName} ${existingUser.lastName}`,
                email: existingUser.email,
                role: existingUser.role,
                username: existingUser.username,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                isVerified: false,
                needsVerification: true,
              };
            }

            console.log('User is verified, proceeding with normal login');

            return {
              id: existingUser.id,
              name: `${existingUser.firstName} ${existingUser.lastName}`,
              email: existingUser.email,
              role: existingUser.role,
              username: existingUser.username,
              firstName: existingUser.firstName,
              lastName: existingUser.lastName,
              isVerified: true,
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const existingUser = await db
            .select()
            .from(User)
            .where(eq(User.email, user.email))
            .limit(1);

          if (!existingUser.length) {
            const name = user.name?.split(' ') || ['', ''];
            await db
              .insert(User)
              .values({
                firstName:
                  name[0] || profile?.given_name || user.name || 'User',
                lastName: name[1] || profile?.family_name || '',
                username: profile?.login || user.email?.split('@')[0] || 'user',
                email: user.email,
                password: '',
                profilePicture: user.image,
                role: 'user',
                isVerified: true, // OAuth users are automatically verified
              })
              .returning();
          }
        } catch (error) {
          console.error('OAuth user creation error:', error);
          return false;
        }
      }

      // Allow all credential logins to proceed
      if (account?.provider === 'credentials') {
        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isVerified = user.isVerified;
        token.needsVerification = user.needsVerification;
      }

      if (token.email && !token.role) {
        const dbUser = await db
          .select()
          .from(User)
          .where(eq(User.email, token.email))
          .limit(1);
        if (dbUser.length > 0) {
          const userData = dbUser[0];
          token.sub = userData.id;
          token.role = userData.role;
          token.username = userData.username;
          token.firstName = userData.firstName;
          token.lastName = userData.lastName;
          token.profilePicture = userData.profilePicture;
          token.isVerified = userData.isVerified === true;
          token.needsVerification = userData.isVerified !== true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.profilePicture =
          token.profilePicture || session.user.image;
        session.user.isVerified = token.isVerified;
        session.user.needsVerification = token.needsVerification;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects properly
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  basePath: '/api/auth',
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
