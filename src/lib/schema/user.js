import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';

export const User = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    username: text('username').notNull().unique(),
    password: text('password').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    role: text('role').default('user'),
    isVerified: text('is_verified').default('false'),
    profilePicture: text('profile_picture'),
    isSubscribed: text('is_subscribed').default('false'),
    subscriptionPlan: text('subscription_plan'),
    subscriptionExpiresAt: timestamp('subscription_expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  t => [
    index('user_email_idx').on(t.email),
    index('user_username_idx').on(t.username),
  ]
);
