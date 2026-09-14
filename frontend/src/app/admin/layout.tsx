import type { Metadata } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';

export const metadata: Metadata = {
  title: 'Michu Admin – Pharmacy Operations Dashboard',
  description: 'Internal admin portal for Michu Pharmacy management.',
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: '/admin-favicon.svg', type: 'image/svg+xml' },
      { url: '/admin-icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/admin-icon.png', type: 'image/png' },
    ],
    shortcut: '/admin-favicon.svg',
  },
};

/**
 * Dedicated layout for all /admin/** routes.
 *
 * In Next.js App Router, this is a nested segment layout. It does NOT
 * repeat <html>/<body> (those belong only to the root layout).
 * What this file DOES control is what wraps all /admin page content —
 * specifically, it renders ONLY the AdminLayout component (sidebar +
 * topbar + footer) and intentionally skips the storefront Header,
 * Footer, CartProvider, and WishlistProvider that live in the root layout.
 *
 * The root layout (app/layout.tsx) still renders <html> and <body>, but
 * its <Header>, <Footer> and providers are only shown for non-admin routes.
 */
export default function AdminSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
