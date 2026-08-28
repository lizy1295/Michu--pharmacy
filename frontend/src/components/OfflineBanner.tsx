'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Register Service Worker for PWA & Offline Support
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  if (!isOffline) return null;

  return (
    <aside
      role="status"
      aria-label="Offline Mode Notification"
      className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-xl sticky top-0 z-50 border-b border-amber-500/50 animate-in slide-in-from-top duration-300"
    >
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Status Label */}
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <span className="flex h-2.5 w-2.5 shrink-0 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-200"></span>
            </span>
            <div>
              <span className="font-extrabold tracking-wide uppercase text-amber-200 mr-1.5">
                ⚡ {t('offline.title')}
              </span>
              <span className="text-amber-100 font-medium hidden md:inline">
                — {t('offline.subtitle')}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/symptoms"
              className="px-3 py-1 rounded-lg bg-white text-amber-950 font-extrabold hover:bg-amber-100 transition shadow-sm"
            >
              Browse Symptom Guide &rarr;
            </Link>

            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="px-2.5 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-900 text-amber-200 border border-amber-500/40 font-bold transition flex items-center gap-1"
              aria-expanded={isDetailsOpen}
            >
              <span>{isDetailsOpen ? t('ui.close') : t('offline.reconnect_btn')}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expandable Feature Availability Matrix */}
        {isDetailsOpen && (
          <div className="mt-3 pt-3 border-t border-amber-600/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-in fade-in duration-200">
            {/* Unavailable Features */}
            <div className="bg-amber-950/70 rounded-xl p-3 border border-red-400/30 space-y-1.5">
              <div className="font-extrabold text-red-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <span>🚫</span>
                <span>Unavailable Without Connection:</span>
              </div>
              <ul className="text-slate-300 space-y-1 text-[11px] list-disc list-inside">
                <li><strong>Cart Checkout & Digital Payment:</strong> Telebirr & CBE Birr verification requires live network.</li>
                <li><strong>Tele-Health Booking:</strong> Booking new pharmacist appointments requires live scheduling.</li>
                <li><strong>Prescription Upload:</strong> Photo/file transmission to pharmacist queue requires internet.</li>
                <li><strong>Live Pharmacist Chat:</strong> Real-time AI consultation requires online connectivity.</li>
              </ul>
            </div>

            {/* Available Offline Features */}
            <div className="bg-amber-950/70 rounded-xl p-3 border border-emerald-400/30 space-y-1.5">
              <div className="font-extrabold text-emerald-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <span>✅</span>
                <span>Available Offline in PWA:</span>
              </div>
              <ul className="text-slate-300 space-y-1 text-[11px] list-disc list-inside">
                <li><strong>Full Symptom Guide:</strong> All 10 chronic condition overviews, symptoms & doctor escalation tips.</li>
                <li><strong>Red-Flag Emergency Protocols:</strong> Immediate emergency first-response guides.</li>
                <li><strong>Branch Directory & Phones:</strong> Direct dial numbers (`907`, `911`, `+251 911 965 779`).</li>
                <li><strong>Cached Catalog Browsing:</strong> Previously viewed medicine guidelines.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
