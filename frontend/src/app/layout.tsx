import type { Metadata, Viewport } from 'next';
import { StorefrontShell } from '@/components/layout/StorefrontShell';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ThemeProvider } from '@/context/ThemeContext';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Michu Pharmacy - Digital Healthcare & Medicine Delivery',
  description: 'Your trusted online pharmacy for medicine, supplements, and health services in Ethiopia.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/pharmacy-icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/pharmacy-icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Michu Pharmacy',
  },
};

export const viewport: Viewport = {
  themeColor: '#474C80',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="theme-1" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Anti-flash inline script for theme loading + Chrome Extension error handler */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mph_theme')||'theme-1';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
            if (typeof window !== 'undefined') {
              window.addEventListener('error', function(e) {
                if (e.filename && e.filename.includes('chrome-extension')) {
                  e.stopImmediatePropagation();
                }
              }, true);
              window.addEventListener('unhandledrejection', function(e) {
                const reason = e.reason ? (e.reason.message || e.reason.stack || String(e.reason)) : '';
                if (reason.includes('MetaMask') || reason.includes('chrome-extension')) {
                  e.preventDefault();
                }
              });
            }`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col selection:bg-brand-600 selection:text-white bg-rumswizzle text-almostblack">
        <ThemeProvider>
          <OfflineBanner />
          <StorefrontShell>{children}</StorefrontShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
