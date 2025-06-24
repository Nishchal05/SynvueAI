import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware();

export const config = {
  matcher: [
    // Only protect frontend routes (not /api)
    '/((?!api|_next|.*\\..*).*)',
  ],
};
