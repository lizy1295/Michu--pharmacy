'use client';

import React, { useState } from 'react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose?: () => void;
  isMandatoryGate?: boolean;
}

export function DisclaimerModal({
  isOpen,
  onAccept,
  onClose,
  isMandatoryGate = true
}: DisclaimerModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onAccept();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-moss-900 via-herb-700 to-moss-900 p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🛡️
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-gleam-200 bg-moss-950/60 px-2.5 py-0.5 rounded-full border border-herb-400/30">
                Mandatory Health Gate
              </span>
              <h2 id="disclaimer-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Medical Information & Safety Disclaimer
              </h2>
            </div>
          </div>
          {!isMandatoryGate && onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-4 text-slate-700 text-sm leading-relaxed">
          {/* Highlighted Warning Box */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">⚠️</span>
            <div className="text-amber-900 text-xs sm:text-sm font-medium">
              <strong className="font-bold">Not for Medical Emergencies:</strong> If you are experiencing acute chest pain, severe difficulty breathing, sudden slurred speech, or uncontrollable bleeding, immediately call <strong>907 / 911</strong> or visit the nearest emergency department.
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-slate-900 text-base">
              Please read and acknowledge before accessing symptom information:
            </h3>

            <div className="space-y-2.5 text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-herb-100 text-herb-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <p>
                  <strong className="text-slate-800">Educational Guidance Only:</strong> All content, symptoms, and condition overviews provided on this platform are for general informational purposes and do <em>not</em> constitute clinical medical advice, professional diagnosis, or personalized treatment regimens.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-herb-100 text-herb-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <p>
                  <strong className="text-slate-800">No Doctor-Patient Relationship:</strong> Using this search tool does not establish a formal clinician-patient relationship. You should always consult with a licensed physician, clinical pharmacist, or qualified healthcare professional regarding any health symptoms or medications.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-herb-100 text-herb-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <p>
                  <strong className="text-slate-800">Medication Safety:</strong> Prescription medications listed as reference classes require a valid medical prescription from a registered practitioner and clinical consultation by our licensed pharmacists prior to dispensing.
                </p>
              </div>
            </div>
          </div>

          {/* User Confirmation Checkbox */}
          <div className="pt-3 border-t border-slate-200">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition select-none">
              <input
                id="disclaimer-ack-checkbox"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded-lg text-herb-600 border-herb-300 focus:ring-herb-500 cursor-pointer shrink-0 accent-herb-600"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                I understand and agree that this symptom tool is for informational guidance only and is not a substitute for professional clinical medical evaluation or emergency care.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 text-center sm:text-left flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-herb-500"></span>
            Stored in your browser session for Michu Health Safety
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="disclaimer-accept-button"
              type="button"
              disabled={!agreed}
              onClick={handleConfirm}
              className={`w-full sm:w-auto px-7 py-3 rounded-2xl text-sm font-extrabold shadow-lg transition flex items-center justify-center gap-2 ${
                agreed
                  ? 'bg-gradient-to-r from-herb-600 to-moss-800 text-white hover:from-herb-700 hover:to-moss-900 shadow-herb-700/20 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>I Understand & Unlock Search</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
