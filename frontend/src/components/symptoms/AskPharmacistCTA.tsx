'use client';

import React from 'react';
import Link from 'next/link';

interface AskPharmacistCTAProps {
  conditionName?: string;
  variant?: 'banner' | 'card' | 'inline';
}

export function AskPharmacistCTA({ conditionName, variant = 'banner' }: AskPharmacistCTAProps) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-herb-50 border border-herb-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-herb-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-herb-600/20 shrink-0">
            👨‍⚕️
          </div>
          <div>
            <h4 className="text-sm font-bold text-moss-950">Have questions about {conditionName || 'your symptoms'}?</h4>
            <p className="text-xs text-herb-700">Chat with a licensed Michu clinical pharmacist right now.</p>
          </div>
        </div>
        <Link
          href="/health?action=consult"
          className="px-4 py-2 rounded-xl bg-herb-600 hover:bg-herb-700 text-white text-xs font-bold transition shadow-sm shrink-0 whitespace-nowrap"
        >
          Ask Pharmacist &rarr;
        </Link>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-moss-950 via-moss-900 to-moss-950 text-white p-6 shadow-xl border border-herb-600/40 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gleam-400 animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gleam-300">
              Pharmacist On Duty
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black tracking-tight text-white">
              Need Personalized Guidance?
            </h3>
            <p className="text-xs text-pearl-200/80 mt-1 leading-relaxed">
              Our clinical pharmacists can review your symptoms, explain medication interactions, and help coordinate doctor visits.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <Link
              href="/health?action=consult"
              className="w-full py-2.5 px-4 rounded-xl bg-gleam hover:bg-gleam-400 text-moss-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-gleam/20"
            >
              <span>💬</span>
              <span>Start Free Online Consultation</span>
            </Link>

            <a
              href="tel:0904040364"
              className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-pearl-100 font-bold text-xs border border-white/10 transition flex items-center justify-center gap-2"
            >
              <span>📞</span>
              <span>Call Helpline: 0904040364 / 0931325959</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Default Banner Variant
  return (
    <section className="w-full rounded-3xl bg-gradient-to-r from-moss-950 via-moss-900 to-moss-950 text-white p-6 sm:p-7 shadow-xl border border-herb-600/40 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-herb-500/10 to-transparent pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-herb-500 to-moss-800 flex items-center justify-center text-3xl shadow-lg shadow-herb-900/40 shrink-0 border border-herb-400/30">
            👨‍⚕️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-herb-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-pearl-200 border border-herb-400/30">
                Licensed Healthcare Support
              </span>
              <span className="text-[11px] text-gleam-300 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gleam-400 animate-pulse"></span>
                Active 7 Days a Week
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
              Still Unsure? Talk Directly to a Michu Pharmacist
            </h3>
            <p className="text-xs sm:text-sm text-pearl-200/80 mt-0.5 max-w-2xl">
              {conditionName
                ? `Get confidential clinical guidance on managing ${conditionName}, prescription checks, and side effect advice.`
                : 'Have questions about your condition, prescription dosages, or potential drug interactions? We are here to support your health journey.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <Link
            href="/health?action=consult"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gleam hover:bg-gleam-400 text-moss-950 font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-gleam/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>💬</span>
            <span>Book Consultation</span>
          </Link>

          <a
            href="tel:0904040364"
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-pearl-100 font-bold text-xs sm:text-sm border border-white/20 transition flex items-center justify-center gap-2"
          >
            <span>📞</span>
            <span>0904040364 / 0931325959</span>
          </a>

          <Link
            href="/health?action=upload"
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-herb-800/90 hover:bg-herb-700 text-pearl-100 font-bold text-xs sm:text-sm border border-herb-600/40 transition flex items-center justify-center gap-2"
          >
            <span>📄</span>
            <span>Upload Rx</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
