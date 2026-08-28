'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-emerald-800/40 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-600/20">
              MP
            </div>
            <div>
              <p className="font-bold text-white text-sm tracking-tight">Michu Pharmacy</p>
              <p className="text-[11px] text-slate-400">{t('footer.slogan')}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-400">
            <Link href="/products" className="hover:text-emerald-400 transition">{t('footer.catalog')}</Link>
            <Link href="/symptoms" className="hover:text-emerald-400 transition text-emerald-400/90 font-semibold">Symptom Guide</Link>
            <Link href="/health?action=upload" className="hover:text-emerald-400 transition">{t('footer.upload_rx')}</Link>
            <Link href="/branches" className="hover:text-emerald-400 transition">{t('footer.branches')}</Link>
            <Link href="/track" className="hover:text-emerald-400 transition">{t('footer.track')}</Link>
            <Link href="/faq" className="hover:text-emerald-400 transition">{t('footer.faq')}</Link>
            <Link href="/admin" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">{t('footer.portal')}</Link>
          </div>

          {/* Quick Support Badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">{t('footer.helpline')}</span>
            <a href="tel:0904040364" className="text-white font-bold hover:text-emerald-400 transition font-mono">0904040364 / 0931325959</a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <p>&copy; {currentYear} {t('footer.rights')}</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{t('footer.regulated')}</span>
            <span className="text-slate-600">•</span>
            <Link href="/admin/login" className="hover:text-slate-300 transition">{t('footer.admin')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
