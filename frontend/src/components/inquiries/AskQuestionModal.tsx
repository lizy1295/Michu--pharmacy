'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { submitInquiry } from '@/lib/api/inquiries';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AskQuestionModal({ isOpen, onClose }: AskQuestionModalProps) {
  const { t } = useLanguage();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerEmail.trim() || !message.trim()) {
      setError(t('inquiry.required_fields') || 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitInquiry({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
        message: message.trim(),
      });
      setSuccess(true);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setMessage('');
    } catch (err: any) {
      setError(err?.message || t('ui.error') || 'Failed to send question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-floating relative overflow-hidden space-y-5 animate-fade-in-scale">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center text-xl shadow-soft-sm">
              💬
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {t('inquiry.modal_title') || 'Ask a Question'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {t('inquiry.modal_subtitle') || 'Our clinical team and pharmacists will respond promptly.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition active:scale-95"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-brand-50 text-brand-600 border border-brand-200/80 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-soft">
              ✓
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {t('inquiry.success_title') || 'Question Submitted!'}
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              {t('inquiry.success_desc') || 'Thank you for reaching out. Our pharmacist team has received your inquiry and will reply shortly.'}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition active:scale-95 shadow-soft"
            >
              {t('ui.close') || 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="inquiry-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('inquiry.name_label') || 'Full Name'} *
              </label>
              <input
                id="inquiry-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Abebe Kebede"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="inquiry-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('inquiry.email_label') || 'Email Address'} *
                </label>
                <input
                  id="inquiry-email"
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="abebe@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="inquiry-phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('inquiry.phone_label') || 'Phone (Optional)'}
                </label>
                <input
                  id="inquiry-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0911223344"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="inquiry-message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('inquiry.message_label') || 'Your Question'} *
              </label>
              <textarea
                id="inquiry-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('inquiry.message_placeholder') || 'Type your health, drug dosage, or pharmacy question here...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95"
              >
                {t('ui.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-soft transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('inquiry.submitting') || 'Sending...'}</span>
                  </>
                ) : (
                  <span>{t('inquiry.submit_btn') || 'Submit Question'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
