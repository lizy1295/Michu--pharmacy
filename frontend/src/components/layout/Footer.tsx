'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Shop Products', href: '/products' },
    { label: 'Health Services', href: '/health' },
    { label: 'Health Blog', href: '/blogs' },
    { label: 'Our Branches', href: '/branches' },
    { label: 'Track Order', href: '/track' },
    { label: 'FAQ', href: '/faq' },
    { label: 'About Us', href: '/about' },
    { label: 'Upload Prescription', href: '/health?action=upload' },
    { label: 'Tele-health Booking', href: '/health?action=consult' },
  ];

  const branchLocations = [
    'Adama Branch', 'Ayat Branch', 'Bethel Branch', 
    'Dire Dawa Branch', 'Figa Branch', 'Hawassa Branch', 'Jemo Branch'
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-auto border-t-4 border-brand-600">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          
          {/* Company Bio */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-md">
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Michu Pharmacy</span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed mt-2">
              Michu Pharmacy is Ethiopia&apos;s premier online pharmacy platform. We look after your health by delivering premium medications, supplements, cosmetics, and professional healthcare consultations.
            </p>
            <div className="flex items-center gap-3 mt-4 text-neutral-400">
              {/* Simple inline social SVGs */}
              <a href="#" className="hover:text-brand-500 transition" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a href="#" className="hover:text-brand-500 transition" aria-label="Telegram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.58.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.89 1.2-5.34 3.53-.51.35-.97.52-1.37.51-.45-.01-1.31-.25-1.95-.46-.78-.26-1.4-.4-1.35-.85.03-.24.36-.48.99-.74 3.86-1.68 6.43-2.78 7.72-3.3 3.67-1.48 4.43-1.74 4.93-1.75.11 0 .36.03.52.16.14.11.18.26.2.37.02.09.02.26 0 .4z"/></svg>
              </a>
              <a href="#" className="hover:text-brand-500 transition" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {footerLinks.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="hover:text-brand-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/login" className="hover:text-brand-500 transition-colors">
                  Sign In / Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Branch Locations */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Our Branches</h3>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm text-neutral-400">
              {branchLocations.map((branch, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-brand-500 shrink-0"></span>
                  <span className="truncate hover:text-neutral-200 transition">{branch}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter and support */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Newsletter</h3>
            <p className="text-xs text-neutral-400 leading-normal">
              Subscribe to get alerts on promotional health checks and discounts!
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex mt-2">
              <input
                type="email"
                placeholder="Your email address"
                required
                className="w-full bg-neutral-800 text-white rounded-l-lg border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-brand-500 transition"
              />
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-white rounded-r-lg px-4 text-sm font-semibold transition"
              >
                Join
              </button>
            </form>
            <div className="mt-4 pt-2 border-t border-neutral-800 text-xs">
              <p className="text-neutral-400">Customer Support 24/7:</p>
              <p className="text-white font-bold text-sm mt-0.5">+251 911 965 779</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>&copy; {currentYear} Michu Pharmacy. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-300">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-300">Terms of Service</a>
            <a href="#" className="hover:text-neutral-300">Prescription Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
