'use client';

import { useState, useRef, useEffect, FormEvent, ClipboardEvent, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forgotPassword, verifyOtp, resetPassword } from '@/lib/api/auth';

type Step = 'EMAIL' | 'OTP' | 'PASSWORD' | 'SUCCESS';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>('EMAIL');

  // Form data
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // Timers
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiresIn, setOtpExpiresIn] = useState(600); // 10 minutes in seconds

  // Refs for 6-box OTP inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Resend Cooldown Countdown ───
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // ─── OTP Expiry Countdown ───
  useEffect(() => {
    if (step !== 'OTP' || otpExpiresIn <= 0) return;
    const interval = setInterval(() => {
      setOtpExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, otpExpiresIn]);

  // Format seconds as MM:SS
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // ─── Step 1: Request OTP ───
  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      await forgotPassword(email.trim());
      setStep('OTP');
      setOtpExpiresIn(600); // 10 min
      setResendCooldown(60); // 60s cooldown for resend
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Resend OTP ───
  async function handleResendOtp() {
    if (resendCooldown > 0 || loading) return;

    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      await forgotPassword(email.trim());
      setInfoMessage('A new verification code has been sent.');
      setResendCooldown(60);
      setOtpExpiresIn(600);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code.');
    } finally {
      setLoading(false);
    }
  }

  // ─── OTP Input Handlers ───
  function handleOtpChange(index: number, val: string) {
    // Only accept numeric digit
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    const digit = cleaned.slice(-1); // Take last entered digit
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    // Auto-focus next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setOtpDigits(next);

    const targetIdx = Math.min(pasted.length, 5);
    inputRefs.current[targetIdx]?.focus();
  }

  // ─── Step 2: Verify OTP ───
  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    const rawOtp = otpDigits.join('');
    if (rawOtp.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    if (otpExpiresIn <= 0) {
      setError('Your verification code has expired. Please request a new one.');
      return;
    }

    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const res = await verifyOtp(email.trim(), rawOtp);
      setResetToken(res.resetToken);
      setStep('PASSWORD');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 3: Reset Password ───
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPasswordMismatch(false);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    if (!resetToken) {
      setError('Your recovery session has expired. Please start over.');
      setStep('EMAIL');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(resetToken, newPassword);
      setStep('SUCCESS');
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-neutral-100 p-8 md:p-10 transition-all duration-300">

        {/* Step Header Badge / Brand Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
            {step === 'EMAIL' && (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
            {step === 'OTP' && (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
            {step === 'PASSWORD' && (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            )}
            {step === 'SUCCESS' && (
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {/* Step Indicator Pills (Steps 1 to 3) */}
        {step !== 'SUCCESS' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 'EMAIL' ? 'w-8 bg-emerald-600' : 'w-2 bg-emerald-200'
            }`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 'OTP' ? 'w-8 bg-emerald-600' : step === 'PASSWORD' ? 'w-2 bg-emerald-200' : 'w-2 bg-neutral-200'
            }`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 'PASSWORD' ? 'w-8 bg-emerald-600' : 'w-2 bg-neutral-200'
            }`} />
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 1: ENTER EMAIL                                           */}
        {/* ───────────────────────────────────────────────────────────── */}
        {step === 'EMAIL' && (
          <>
            <h1 className="text-2xl font-extrabold text-neutral-900 text-center">Reset Password</h1>
            <p className="text-sm text-neutral-500 text-center mt-2 mb-6 leading-relaxed">
              Enter the email address associated with your Michu Pharmacy account and we&apos;ll send you a 6-digit verification code.
            </p>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-600 font-medium flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-emerald-100 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending Code…
                  </span>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
          </>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 2: VERIFY 6-DIGIT OTP                                    */}
        {/* ───────────────────────────────────────────────────────────── */}
        {step === 'OTP' && (
          <>
            <h1 className="text-2xl font-extrabold text-neutral-900 text-center">Enter Verification Code</h1>
            <p className="text-sm text-neutral-500 text-center mt-2 mb-2 leading-relaxed">
              We sent a 6-digit code to <strong className="text-neutral-800">{email}</strong>
            </p>
            <div className="text-center mb-6">
              <button
                type="button"
                onClick={() => {
                  setStep('EMAIL');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline"
              >
                Change email
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-600 font-medium flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium text-center">
                {infoMessage}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 6-box input */}
              <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-extrabold text-neutral-900 border-2 rounded-xl border-neutral-200 bg-white focus:border-emerald-600 focus:bg-emerald-50/20 focus:outline-none transition shadow-sm"
                  />
                ))}
              </div>

              {/* Countdown timer & Resend */}
              <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeWidth="2" d="M12 6v6l4 2" />
                  </svg>
                  {otpExpiresIn > 0 ? (
                    <span>Expires in <strong className="text-neutral-700 font-mono">{formatTime(otpExpiresIn)}</strong></span>
                  ) : (
                    <span className="text-red-500 font-semibold">Code expired</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="font-bold text-emerald-600 hover:text-emerald-700 disabled:text-neutral-400 disabled:cursor-not-allowed transition"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6 || otpExpiresIn <= 0}
                className="w-full flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-emerald-100"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying…
                  </span>
                ) : (
                  'Verify Code'
                )}
              </button>
            </form>
          </>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 3: SET NEW PASSWORD                                      */}
        {/* ───────────────────────────────────────────────────────────── */}
        {step === 'PASSWORD' && (
          <>
            <h1 className="text-2xl font-extrabold text-neutral-900 text-center">Create New Password</h1>
            <p className="text-sm text-neutral-500 text-center mt-2 mb-6 leading-relaxed">
              Your code has been verified. Choose a strong, secure password for your account.
            </p>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-600 font-medium flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Minimum 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordMismatch) setPasswordMismatch(false);
                  }}
                  placeholder="••••••••"
                  className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition ${
                    passwordMismatch
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-neutral-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  }`}
                />
                {passwordMismatch && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-emerald-100 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating Password…
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 4: SUCCESS CONFIRMATION                                  */}
        {/* ───────────────────────────────────────────────────────────── */}
        {step === 'SUCCESS' && (
          <div className="text-center py-2">
            <h2 className="text-2xl font-extrabold text-neutral-900">Password Updated!</h2>
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm transition shadow-md shadow-emerald-100"
              >
                Log In Now →
              </Link>
            </div>
            <p className="text-xs text-neutral-400 mt-4">
              Redirecting you to login in a moment…
            </p>
          </div>
        )}

        {/* Back to Login Footer */}
        {step !== 'SUCCESS' && (
          <div className="text-center mt-6 pt-4 border-t border-neutral-100">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-emerald-700 font-semibold transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
