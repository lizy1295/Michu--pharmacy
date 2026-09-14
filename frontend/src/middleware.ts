import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware that exposes the current pathname as a request header.
 * This allows server-side layouts to conditionally render components
 * based on the route (e.g., hide the storefront Header/Footer in /admin).
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?)$).*)',
  ],
};
