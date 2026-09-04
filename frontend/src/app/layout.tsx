import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { OfflineBanner } from '@/components/OfflineBanner';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AiAssistant } from '@/components/ai/AiAssistant';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Michu Pharmacy - Digital Healthcare & Medicine Delivery',
  description: 'Your trusted online pharmacy for medicine, supplements, and health services in Ethiopia.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Michu Pharmacy',
  },
};

export const viewport: Viewport = {
  themeColor: '#31410D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

/**
 * Root layout — uses the x-pathname header set by middleware.ts to
 * server-side detect admin routes and skip the storefront shell entirely.
 * Admin pages get only the bare body + AdminLayout (from admin/layout.tsx).
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const isAdmin = pathname.startsWith('/admin');

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen flex flex-col selection:bg-autumn selection:text-white bg-beige-200 text-almostblack">
        <OfflineBanner />
        {isAdmin ? (
          // Admin: render children bare — AdminLayout wraps them via app/admin/layout.tsx
          <>{children}</>
        ) : (
          // Storefront: full shell with LanguageProvider, CartProvider, WishlistProvider, Header, AiAssistant, Footer
          <LanguageProvider>
            <CartProvider>
              <WishlistProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <AiAssistant />
              </WishlistProvider>
            </CartProvider>
          </LanguageProvider>
        )}
      </body>
    </html>
  );
}
