'use client';

import React from 'react';

interface MedicalDisclaimerFooterProps {
  onOpenModal?: () => void;
}

export function MedicalDisclaimerFooter({ onOpenModal }: MedicalDisclaimerFooterProps) {
  return (
    <footer className="w-full rounded-2xl bg-slate-100 border border-slate-200/80 p-4 sm:p-5 text-slate-600 text-xs space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <span className="text-base">🛡️</span>
          <span>Official Health & Medical Disclaimer</span>
        </div>
        {onOpenModal && (
          <button
            onClick={onOpenModal}
            className="text-emerald-700 hover:text-emerald-800 font-bold underline transition self-start sm:self-auto text-[11px]"
          >
            Review Full Safety Terms & Gate Agreement &rarr;
          </button>
        )}
      </div>

      <p className="leading-relaxed text-slate-500">
        <strong className="text-slate-700">Educational Use Only:</strong> The clinical information, symptoms, medication classes, and doctor-visit recommendations presented here are compiled from accredited international guidelines (WHO, ADA, GINA, KDIGO, ACC/AHA) and the Ethiopian Food and Drug Authority (EFDA) for public educational reference. This tool does not provide medical diagnoses, clinical prognoses, or prescribed therapy. Always consult with a licensed physician or registered pharmacist before beginning, changing, or discontinuing any medical treatment.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
        <span>Michu Pharmacy Clinical Informatics Department</span>
        <span>Emergency Dispatch: 907 / 911 • Rapid Support: 0904040364 / 0931325959</span>
      </div>
    </footer>
  );
}
