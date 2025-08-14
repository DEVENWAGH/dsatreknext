import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth(req => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  // Protected routes that require verification
  const protectedRoutes = [
    '/problems',
    '/profile',
    '/workspace',
    '/interview',
    '/admin',
  ];
  const isProtectedRoute = protectedRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthPage = nextUrl.pathname.startsWith('/auth');

  // If user is logged in but not verified and trying to access protected routes
  if (
    isLoggedIn &&
    user?.needsVerification &&
    isProtectedRoute &&
    !isAuthPage
  ) {
    return NextResponse.redirect(
      new URL('/auth/login?verification=required', nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.svg|.*\\..*).*)'],
};
