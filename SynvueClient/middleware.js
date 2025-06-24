import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware();

export const config = {
  matcher: [
    // Run Clerk on everything except this specific route:
    '/((?!api/ai_modal|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
