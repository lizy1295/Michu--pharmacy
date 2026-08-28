'use client';

import React from 'react';
import Link from 'next/link';
import { RedFlagAlert } from '@/lib/data/symptomData';

interface EmergencyBannerProps {
  alert: RedFlagAlert;
  onClearSearch: () => void;
}

export function EmergencyBanner({ alert, onClearSearch }: EmergencyBannerProps) {
  return (
    <div
      role="alert"
      className="w-full rounded-3xl bg-gradient-to-br from-red-600 via-rose-700 to-red-900 text-white shadow-2xl p-6 sm:p-8 border-2 border-red-400/50 animate-in zoom-in-95 duration-300 relative overflow-hidden"
    >
      {/* Background Warning Watermark */}
      <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-9xl font-black select-none">
        🚨
      </div>

      <div className="relative z-10 space-y-6">
        {/* Urgent Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-400/40 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-600 text-2xl shadow-lg animate-bounce">
              ⚠️
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-red-950/80 px-3 py-0.5 text-[11px] font-black uppercase tracking-widest text-red-200 border border-red-400/30">
                  Critical Red-Flag Warning
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {alert.matchedCategory}
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white mt-1">
                {alert.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClearSearch}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 transition flex items-center gap-1.5 self-start"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Search
          </button>
        </div>

        {/* Warning Explanation */}
        <div className="bg-red-950/50 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-red-400/30">
          <p className="text-sm sm:text-base text-red-100 leading-relaxed font-medium">
            {alert.description}
          </p>
          <div className="mt-3 p-3 bg-red-900/60 rounded-xl border border-red-500/40 text-xs sm:text-sm font-bold text-yellow-200 flex items-center gap-2">
            <span>🚨</span>
            <span>
              Normal informational search results are withheld to prevent dangerous delays in receiving life-saving emergency medical care.
            </span>
          </div>
        </div>

        {/* Immediate Life-Saving Action Steps */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-200 flex items-center gap-2">
            <span>⚡</span> Immediate Life-Saving Protocol:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {alert.immediateActions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10 text-xs sm:text-sm text-white font-semibold leading-snug"
              >
                <div className="w-6 h-6 rounded-full bg-white text-red-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {idx + 1}
                </div>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons: 1-Tap Emergency Call & Branch Tele-Triage */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <a
            href={`tel:${alert.secondaryPhone || '907'}`}
            className="w-full sm:w-auto flex-1 px-6 py-4 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-black text-sm sm:text-base shadow-xl transition flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-xl">📞</span>
            <span>Call National Emergency ({alert.secondaryPhone || '907 / 911'})</span>
          </a>

          <a
            href={`tel:${alert.emergencyPhone}`}
            className="w-full sm:w-auto flex-1 px-6 py-4 rounded-2xl bg-red-950 hover:bg-black text-white font-bold text-sm sm:text-base border border-red-400/40 shadow-xl transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>🏥</span>
            <span>Michu 24/7 Rapid Clinical Hotline</span>
          </a>

          <Link
            href="/branches"
            className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition flex items-center justify-center gap-2"
          >
            <span>📍</span>
            <span>Find Open Branch</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
