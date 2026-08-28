/**
 * @deprecated — No longer used.
 * Storefront shell logic has been moved to the root app/layout.tsx
 * which uses Next.js middleware (src/middleware.ts) to read the x-pathname
 * header server-side and conditionally renders Header/Footer only for
 * non-admin routes.
 */
export function StorefrontShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
