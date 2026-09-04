'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export function EmergencyStrip() {
  const { t, language } = useLanguage();
  const [emergencyPhone, setEmergencyPhone] = useState<string>('456');

  useEffect(() => {
    let isMounted = true;
    async function fetchEmergencySettings() {
      try {
        const res = await fetch(`${API_URL}/settings/emergency-phone`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.emergencyPhone) {
            setEmergencyPhone(data.emergencyPhone);
          }
        }
      } catch (err) {
        console.error('Failed to fetch emergency phone setting:', err);
      }
    }

    fetchEmergencySettings();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-700 to-red-800 text-white py-3 px-4 shadow-md border-b border-red-500/40">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left Info Badge */}
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-red-600 font-extrabold text-sm shadow animate-bounce shrink-0">
            🚨
          </span>
          <div className="text-center sm:text-left">
            <span className="inline-block px-2 py-0.5 rounded bg-red-950/70 text-red-200 text-[10px] font-black uppercase tracking-wider border border-red-400/30 mr-2">
              24/7 Emergency Hotline
            </span>
            <span className="text-xs font-bold text-white leading-tight">
              {language === 'am'
                ? 'ለአስቸኳይ እና ድንገተኛ የጤና ጉዳዮች አገልግሎት የተዘጋጀ'
                : 'Immediate Clinical Emergency Hotline'}
            </span>
          </div>
        </div>

        {/* Action Call Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={`tel:${emergencyPhone}`}
            id="emergency-strip-call-btn"
            className="px-4 py-1.5 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-xs sm:text-sm shadow-sm transition flex items-center gap-2 active:scale-95"
          >
            <span>📞</span>
            <span>
              {language === 'am' ? 'ድንገተኛ ስልክ:' : 'Emergency Call:'} <strong>{emergencyPhone}</strong>
            </span>
          </a>

          <Link
            href="/symptoms#emergency"
            className="px-3.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-black text-red-100 font-bold text-xs border border-red-400/40 transition flex items-center gap-1.5"
          >
            <span>⚠️</span>
            <span>{t('home.emergency_btn') || 'Symptom Red-Flags'}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
