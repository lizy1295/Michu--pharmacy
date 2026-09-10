'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { login, register } from '@/lib/api/auth';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    try {
      if (isRegister) {
        await register({
          email,
          password,
          firstName: form.get('firstName') as string,
          lastName: form.get('lastName') as string,
          phone: (form.get('phone') as string)?.trim() || undefined,
        });
      } else {
        await login({ email, password });
      }
      window.location.href = '/account';
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.error_generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white rounded-3xl shadow-xl overflow-hidden border border-neutral-100 p-8 md:p-12 relative">
        
        {/* Left Column: Graphic and Promotional Copy */}
        <div className="flex flex-col space-y-6 relative z-10">
          {/* Abstract green accent circle */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-brand-500/5 -z-10 blur-2xl"></div>
          <div className="absolute -bottom-24 -right-12 w-64 h-64 rounded-full bg-emerald-500/5 -z-10 blur-3xl"></div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
            Looking After<br />
            <span className="relative text-brand-600 block mt-2">
              Your Health
              <span className="absolute bottom-0 left-0 w-44 h-1.5 bg-brand-600 rounded-full"></span>
            </span>
          </h2>
          
          <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-md">
            Access Ethiopia&apos;s leading pharmacy platform. Order medicines, book consultations, and manage your health — all in one place.
          </p>

          {/* Clean decorative graphic using SVGs */}
          <div className="pt-6 hidden md:block">
            <svg className="w-64 h-64 text-brand-100 animate-pulse duration-[3000ms]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1.5" />
              <path d="M100 20V180M20 100H180" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              <circle cx="100" cy="100" r="12" fill="#474C80" fillOpacity="0.15" />
              <path d="M100 93V107M93 100H107" stroke="#474C80" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Right Column: Authentication Card Form */}
        <div className="w-full">
          <div className="bg-gray-50 border border-neutral-100 rounded-2xl p-6 md:p-8 flex flex-col items-center">
            
            {/* Green styled Lock Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center shadow-sm mb-4">
              <svg className="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-neutral-900">
              {isRegister ? t('auth.register_title') : t('auth.welcome_title')}
            </h3>
            <p className="text-xs text-gray-500 mt-1.5 text-center">
              {isRegister ? t('auth.register_subtitle') : t('auth.welcome_subtitle')}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 w-full space-y-4">
              {isRegister && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        {t('auth.first_name_label')}
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        placeholder="John"
                        className="mt-1.5 block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        {t('auth.last_name_label')}
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        placeholder="Doe"
                        className="mt-1.5 block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {t('auth.phone_label')}
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="0911234567 or +251911234567"
                      className="mt-1.5 block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none placeholder:text-gray-400 font-medium"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Required for SMS verification & password recovery</p>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('auth.email_label')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. 0911965779 or email@domain.com"
                  className="mt-1.5 block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none placeholder:text-gray-400 font-medium"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('auth.password_label')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="mt-1.5 block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Forgot password link — only shown in sign-in mode */}
              {!isRegister && (
                <div className="text-right -mt-1">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline transition"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium flex items-start gap-1.5">
                  <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 text-sm active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-brand-100 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('auth.loading')}
                  </span>
                ) : isRegister ? (
                  t('auth.submit_register')
                ) : (
                  t('auth.submit_sign_in')
                )}
              </button>
            </form>

            <div className="w-full border-t border-neutral-200 mt-6 pt-4 text-center">
              <p className="text-sm text-gray-600">
                {isRegister ? t('auth.have_account') : t('auth.no_account')}{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-brand-600 hover:text-brand-800 font-bold hover:underline"
                >
                  {isRegister ? t('auth.login_link') : t('auth.register_link')}
                </button>
              </p>
              
              <Link href="/" className="inline-block text-xs font-semibold text-gray-400 hover:text-gray-600 transition mt-4">
                &larr; {t('ui.back')}
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
