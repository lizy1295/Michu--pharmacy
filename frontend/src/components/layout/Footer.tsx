'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-moss-900 text-pearl-300 mt-auto border-t border-herb-700/40 text-xs">
      {/* Top Banner: Emergency & 24/7 Hotline Strip */}
      <div className="bg-moss-950/80 border-b border-herb-700/40 py-3 px-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gleam opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gleam-300"></span>
            </span>
            <span className="font-semibold text-gleam-300">24/7 Pharmacist &amp; Emergency Prescription Service:</span>
            <span className="text-pearl-200/70 hidden md:inline">Ayat Roundabout Branch is open 24 hours every day.</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <a
              href="tel:+251904040364"
              className="text-gleam hover:text-pearl transition flex items-center gap-1.5"
            >
              <span>📞</span> +251 90 404 0364
            </a>
            <span className="text-herb-700">|</span>
            <a
              href="tel:+251931325959"
              className="text-gleam hover:text-pearl transition flex items-center gap-1.5"
            >
              <span>📞</span> +251 93 132 5959
            </a>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Brand, Mission & Regulation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-herb-500 via-herb-600 to-moss-900 flex items-center justify-center text-pearl font-black text-base shadow-lg shadow-moss-950/50">
                MP
              </div>
              <div>
                <p className="font-extrabold text-pearl text-base tracking-tight">Michu Pharmacy</p>
                <p className="text-[11px] text-gleam-300 font-medium">ሚቹ ፋርማሲ — ጥራት ለጤናዎ</p>
              </div>
            </div>
            
            <p className="text-pearl-200/60 text-xs leading-relaxed">
              Ethiopia&apos;s modern community pharmacy and digital health platform. Providing authentic EFDA-registered medications, licensed pharmacist consultations, and reliable health solutions across Addis Ababa and regional centers.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-moss-950/60 border border-herb-600/40 text-[11px] text-gleam-300 font-medium">
                <span className="text-sm">🛡️</span>
                <span>EFDA Certified &amp; Licensed Pharmacy</span>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-pearl-200/50">
              <p>Managing Director: <strong className="text-pearl-200/80">Dr. Million Negasa</strong></p>
              <p className="mt-0.5">Registration: EFDA/PH/AA/2024/0891</p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-pearl text-xs font-black uppercase tracking-wider border-l-2 border-gleam pl-2.5">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs font-medium text-pearl-200/60">
              <li>
                <Link href="/" className="hover:text-gleam transition flex items-center gap-1.5">
                  <span className="text-herb-400">›</span> Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gleam transition flex items-center gap-1.5 text-gleam-300/80 font-semibold">
                  <span className="text-herb-400">›</span> About Us (Founder Story &amp; Vision)
                </Link>
              </li>
              <li>
                <Link href="/health?action=consult" className="hover:text-gleam transition flex items-center gap-1.5">
                  <span className="text-herb-400">›</span> Certified Doctors &amp; Pharmacists
                </Link>
              </li>
              <li>
                <Link href="/health?action=upload" className="hover:text-gleam transition flex items-center gap-1.5">
                  <span className="text-herb-400">›</span> Upload Prescription (Rx)
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-gleam transition flex items-center gap-1.5">
                  <span className="text-herb-400">›</span> Health News &amp; Disease Solutions
                </Link>
              </li>
              <li>
                <Link href="/branches" className="hover:text-gleam transition flex items-center gap-1.5">
                  <span className="text-herb-400">›</span> All 7 Physical Branches
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gleam/70 hover:text-gleam transition flex items-center gap-1.5 font-bold">
                  <span className="text-herb-400">›</span> Admin &amp; Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Site Links & Services */}
          <div className="space-y-3">
            <h3 className="text-pearl text-xs font-black uppercase tracking-wider border-l-2 border-gleam pl-2.5">
              Site Links &amp; Care
            </h3>
            <ul className="space-y-2 text-xs font-medium text-pearl-200/60">
              <li>
                <Link href="/products" className="hover:text-gleam transition flex items-center gap-1.5">
                  <span className="text-herb-400">›</span> All Products &amp; Catalog
                </Link>
              </li>
              <li>
                <Link href="/products?category=Medicine" className="hover:text-gleam transition flex items-center gap-1.5">
                  <span className="text-herb-400">›</span> Essential Medicines
                </Link>
              </li>
              <li>
                <Link href="/products?category=Supplement" className="hover:text-gleam transition flex items-center gap-1.5">
                  <span className="text-herb-400">›</span> Vitamins &amp; Supplements
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-gleam transition flex items-center gap-1.5">
                  <span className="text-herb-400">›</span> Certified Pharma Brands
                </Link>
              </li>
              <li>
                <Link href="/symptoms" className="hover:text-gleam transition flex items-center gap-1.5">
                  <span className="text-herb-400">›</span> Symptom Guide &amp; Triage
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-gleam transition flex items-center gap-1.5">
                  <span className="text-herb-400">›</span> Order &amp; Delivery Tracking
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gleam transition flex items-center gap-1.5">
                  <span className="text-herb-400">›</span> Frequently Asked Questions (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us, Address & Social Media */}
          <div className="space-y-4">
            <h3 className="text-pearl text-xs font-black uppercase tracking-wider border-l-2 border-gleam pl-2.5">
              Contact Us &amp; Address
            </h3>

            <div className="space-y-2.5 text-xs text-pearl-200/70">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <span className="text-radiate text-sm mt-0.5">📍</span>
                <div>
                  <p className="font-bold text-pearl">Main Branch / Head Office:</p>
                  <p className="text-pearl-200/50 text-[11px] leading-relaxed">
                    Ayat Roundabout Commercial Center, Ground Floor, Bole Sub-City, Addis Ababa, Ethiopia
                  </p>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="flex items-start gap-2.5">
                <span className="text-radiate text-sm mt-0.5">📞</span>
                <div>
                  <p className="font-bold text-pearl">Customer Support &amp; Orders:</p>
                  <p className="text-pearl-200/70 text-xs font-mono">
                    <a href="tel:+251904040364" className="hover:text-gleam transition">+251 90 404 0364</a> /{' '}
                    <a href="tel:+251931325959" className="hover:text-gleam transition">+251 93 132 5959</a>
                  </p>
                  <p className="text-[11px] text-pearl-200/50 mt-0.5">Ayat 24/7 Line: +251 11 667 8900</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5">
                <span className="text-radiate text-sm mt-0.5">✉️</span>
                <div>
                  <p className="font-bold text-pearl">Email Inquiries:</p>
                  <a href="mailto:support@michupharmacy.com" className="text-pearl-200/60 hover:text-gleam transition text-[11px]">
                    support@michupharmacy.com
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media Channels */}
            <div className="pt-2">
              <p className="text-pearl text-[11px] font-bold uppercase tracking-wider mb-2.5">
                Follow &amp; Connect With Us
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {/* Telegram */}
                <a
                  href="https://t.me/michupharmacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-moss-950/60 border border-herb-700/50 hover:border-gleam hover:bg-gleam/10 hover:text-gleam flex items-center justify-center text-pearl-200/60 transition"
                  aria-label="Telegram"
                  title="Michu Pharmacy on Telegram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com/michupharmacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-moss-950/60 border border-herb-700/50 hover:border-gleam hover:bg-gleam/10 hover:text-gleam flex items-center justify-center text-pearl-200/60 transition"
                  aria-label="Facebook"
                  title="Michu Pharmacy on Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com/michupharmacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-moss-950/60 border border-herb-700/50 hover:border-radiate hover:bg-radiate/10 hover:text-radiate flex items-center justify-center text-pearl-200/60 transition"
                  aria-label="Instagram"
                  title="Michu Pharmacy on Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/company/michupharmacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-moss-950/60 border border-herb-700/50 hover:border-gleam hover:bg-gleam/10 hover:text-gleam flex items-center justify-center text-pearl-200/60 transition"
                  aria-label="LinkedIn"
                  title="Michu Pharmacy on LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com/@michupharmacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-moss-950/60 border border-herb-700/50 hover:border-radiate hover:bg-radiate/10 hover:text-radiate flex items-center justify-center text-pearl-200/60 transition"
                  aria-label="TikTok"
                  title="Michu Pharmacy on TikTok"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/251904040364"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-moss-950/60 border border-herb-700/50 hover:border-herb-400 hover:bg-herb-500/10 hover:text-herb-300 flex items-center justify-center text-pearl-200/60 transition"
                  aria-label="WhatsApp"
                  title="Michu Pharmacy on WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Regulated Badge & Admin Login */}
        <div className="mt-12 pt-6 border-t border-moss-950/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-pearl-200/40">
          <p>&copy; {currentYear} Michu Pharmacy S.C. {t('footer.rights') || 'All rights reserved.'}</p>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-pearl-200/50">Regulated by Ethiopian Food and Drug Authority (EFDA)</span>
            <span className="text-herb-800 hidden sm:inline">•</span>
            <Link href="/about" className="hover:text-gleam transition">About Founder &amp; Leadership</Link>
            <span className="text-herb-800 hidden sm:inline">•</span>
            <Link href="/admin/login" className="text-gleam/70 hover:text-gleam font-semibold transition">
              Pharmacist Portal Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
