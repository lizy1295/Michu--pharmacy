'use client';

import React, { useState, useId } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export interface PrescriptionFormData {
  patientName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  rxNumber: string;
  doctorName: string;
  doctorLicense?: string;
  knownAllergies: string;
  currentMedications?: string;
  notes?: string;
  prescriptionFile?: File | null;
  acknowledgment: boolean;
}

export interface PrescriptionIntakeFormProps {
  onSuccess?: (data: PrescriptionFormData) => void;
  className?: string;
}

// Strict Rx number regex: exactly 2 uppercase letters followed by exactly 7 digits
const RX_NUMBER_REGEX = /^[A-Z]{2}\d{7}$/;

export default function PrescriptionIntakeForm({
  onSuccess,
  className = '',
}: PrescriptionIntakeFormProps) {
  const formId = useId();
  const { t } = useLanguage();

  // Form State
  const [formData, setFormData] = useState<PrescriptionFormData>({
    patientName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    rxNumber: '',
    doctorName: '',
    doctorLicense: '',
    knownAllergies: '',
    currentMedications: '',
    notes: '',
    prescriptionFile: null,
    acknowledgment: false,
  });

  // Validation Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Compute maximum date for Date of Birth (Today's date in YYYY-MM-DD format to block future dates)
  const todayStr = new Date().toISOString().split('T')[0];

  /**
   * Calculates age in years given a date string (YYYY-MM-DD)
   */
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();

    if (isNaN(birthDate.getTime())) return 0;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * Validates individual field or all fields
   */
  const validateField = (name: keyof PrescriptionFormData, value: any): string => {
    switch (name) {
      case 'patientName':
        if (!value || !value.trim()) {
          return t('rx_intake.patient_name_required');
        }
        if (value.trim().length < 2) {
          return t('rx_intake.patient_name_min');
        }
        return '';

      case 'dateOfBirth':
        if (!value) {
          return t('rx_intake.dob_required');
        }
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (selectedDate > today) {
          return t('rx_intake.dob_future_error');
        }

        const age = calculateAge(value);
        if (age < 18) {
          return t('rx_intake.dob_under18_error');
        }
        return '';

      case 'rxNumber':
        const cleanRx = (value || '').trim();
        if (!cleanRx) {
          return t('rx_intake.rx_required');
        }
        if (!RX_NUMBER_REGEX.test(cleanRx)) {
          return t('rx_intake.rx_regex_error');
        }
        return '';

      case 'knownAllergies':
        const allergiesText = (value || '').trim();
        if (!allergiesText) {
          return t('rx_intake.allergies_required');
        }
        return '';

      case 'phone':
        if (!value || !value.trim()) {
          return t('rx_intake.phone_required');
        }
        return '';

      case 'email':
        if (value && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return t('rx_intake.email_invalid');
        }
        return '';

      case 'doctorName':
        if (!value || !value.trim()) {
          return t('rx_intake.doctor_name_required');
        }
        return '';

      case 'acknowledgment':
        if (!value) {
          return t('rx_intake.consent_required');
        }
        return '';

      default:
        return '';
    }
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fieldKeys: (keyof PrescriptionFormData)[] = [
      'patientName',
      'dateOfBirth',
      'rxNumber',
      'knownAllergies',
      'phone',
      'email',
      'doctorName',
      'acknowledgment',
    ];

    fieldKeys.forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) {
        newErrors[key] = err;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Field Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'rxNumber') {
      // Auto-uppercase Rx number to assist user adhering to regex
      finalValue = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    // Revalidate if touched
    if (touched[name]) {
      const errorMsg = validateField(name as keyof PrescriptionFormData, finalValue);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  // Handle Blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name as keyof PrescriptionFormData, finalValue);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // Handle File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, prescriptionFile: e.target.files![0] }));
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {
      patientName: true,
      dateOfBirth: true,
      rxNumber: true,
      knownAllergies: true,
      phone: true,
      email: true,
      doctorName: true,
      doctorLicense: true,
      currentMedications: true,
      notes: true,
      acknowledgment: true,
    };
    setTouched(allTouched);

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API Submission or invoke callback
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSubmitSuccess(true);
      if (onSuccess) {
        onSuccess(formData);
      }
    } catch (err: any) {
      setServerError(err?.message || t('ui.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Form
  const handleReset = () => {
    setFormData({
      patientName: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      rxNumber: '',
      doctorName: '',
      doctorLicense: '',
      knownAllergies: '',
      currentMedications: '',
      notes: '',
      prescriptionFile: null,
      acknowledgment: false,
    });
    setErrors({});
    setTouched({});
    setSubmitSuccess(false);
    setServerError(null);
  };

  if (submitSuccess) {
    return (
      <div className={`bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-8 shadow-sm text-center ${className}`}>
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {t('rx_intake.success_title')}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6 text-sm">
          {t('rx_intake.success_desc')}{' '}
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            {formData.rxNumber}
          </span>
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 max-w-md mx-auto text-left text-xs text-slate-600 dark:text-slate-300 mb-6 space-y-1.5 border border-slate-200 dark:border-slate-700">
          <div><span className="font-semibold text-slate-900 dark:text-white">{t('rx_intake.recorded_patient')}</span> {formData.patientName}</div>
          <div><span className="font-semibold text-slate-900 dark:text-white">{t('rx_intake.recorded_dob')}</span> {formData.dateOfBirth} ({t('rx_intake.dob_age').replace('{age}', String(calculateAge(formData.dateOfBirth)))})</div>
          <div><span className="font-semibold text-slate-900 dark:text-white">{t('rx_intake.recorded_doctor')}</span> {formData.doctorName}</div>
          <div><span className="font-semibold text-slate-900 dark:text-white">{t('rx_intake.recorded_allergies')}</span> {formData.knownAllergies}</div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition shadow-sm cursor-pointer"
        >
          {t('rx_intake.submit_another')}
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 backdrop-blur-sm">
            {t('rx_intake.badge_clinical')}
          </span>
          <span className="text-xs text-emerald-200">{t('rx_intake.badge_safety')}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{t('rx_intake.title')}</h2>
        <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl">
          {t('rx_intake.desc')}
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-6">
        {serverError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        {/* Section 1: Patient Information */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">1</span>
            {t('rx_intake.sec1_title')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor={`${formId}-patientName`} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('rx_intake.patient_name')} <span className="text-rose-500">*</span>
              </label>
              <input
                id={`${formId}-patientName`}
                name="patientName"
                type="text"
                required
                value={formData.patientName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('rx_intake.patient_name_placeholder')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  touched.patientName && errors.patientName
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/40'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40'
                }`}
                aria-invalid={!!(touched.patientName && errors.patientName)}
                aria-describedby={touched.patientName && errors.patientName ? `${formId}-patientName-error` : undefined}
              />
              {touched.patientName && errors.patientName && (
                <p id={`${formId}-patientName-error`} className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {errors.patientName}
                </p>
              )}
            </div>

            {/* Date of Birth (Must block future dates and validate age >= 18) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={`${formId}-dateOfBirth`} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('rx_intake.dob')} <span className="text-rose-500">*</span>
                </label>
                {formData.dateOfBirth && !errors.dateOfBirth && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {t('rx_intake.dob_age').replace('{age}', String(calculateAge(formData.dateOfBirth)))}
                  </span>
                )}
              </div>
              <input
                id={`${formId}-dateOfBirth`}
                name="dateOfBirth"
                type="date"
                required
                max={todayStr}
                value={formData.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  touched.dateOfBirth && errors.dateOfBirth
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/40'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40'
                }`}
                aria-invalid={!!(touched.dateOfBirth && errors.dateOfBirth)}
                aria-describedby={touched.dateOfBirth && errors.dateOfBirth ? `${formId}-dateOfBirth-error` : undefined}
              />
              {touched.dateOfBirth && errors.dateOfBirth ? (
                <p id={`${formId}-dateOfBirth-error`} className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.dateOfBirth}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {t('rx_intake.dob_help')}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor={`${formId}-phone`} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('rx_intake.phone')} <span className="text-rose-500">*</span>
              </label>
              <input
                id={`${formId}-phone`}
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('rx_intake.phone_placeholder')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  touched.phone && errors.phone
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/40'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40'
                }`}
                aria-invalid={!!(touched.phone && errors.phone)}
                aria-describedby={touched.phone && errors.phone ? `${formId}-phone-error` : undefined}
              />
              {touched.phone && errors.phone && (
                <p id={`${formId}-phone-error`} className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor={`${formId}-email`} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('rx_intake.email')}
              </label>
              <input
                id={`${formId}-email`}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('rx_intake.email_placeholder')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  touched.email && errors.email
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/40'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40'
                }`}
                aria-invalid={!!(touched.email && errors.email)}
                aria-describedby={touched.email && errors.email ? `${formId}-email-error` : undefined}
              />
              {touched.email && errors.email && (
                <p id={`${formId}-email-error`} className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {errors.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Prescription & Doctor Details */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">2</span>
            {t('rx_intake.sec2_title')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Strict Rx Number (^[A-Z]{2}\d{7}$) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={`${formId}-rxNumber`} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('rx_intake.rx_number')} <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {t('rx_intake.rx_format_hint')}
                </span>
              </div>
              <div className="relative">
                <input
                  id={`${formId}-rxNumber`}
                  name="rxNumber"
                  type="text"
                  required
                  maxLength={9}
                  value={formData.rxNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t('rx_intake.rx_placeholder')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono uppercase tracking-wider transition outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                    touched.rxNumber && errors.rxNumber
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/40'
                      : formData.rxNumber && RX_NUMBER_REGEX.test(formData.rxNumber)
                      ? 'border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40'
                      : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40'
                  }`}
                  aria-invalid={!!(touched.rxNumber && errors.rxNumber)}
                  aria-describedby={touched.rxNumber && errors.rxNumber ? `${formId}-rxNumber-error` : undefined}
                />
                {formData.rxNumber && RX_NUMBER_REGEX.test(formData.rxNumber) && (
                  <span className="absolute right-3 top-2.5 text-emerald-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              {touched.rxNumber && errors.rxNumber ? (
                <p id={`${formId}-rxNumber-error`} className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.rxNumber}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {t('rx_intake.rx_pattern_info')}
                </p>
              )}
            </div>

            {/* Prescribing Doctor / Clinic */}
            <div>
              <label htmlFor={`${formId}-doctorName`} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('rx_intake.doctor_name')} <span className="text-rose-500">*</span>
              </label>
              <input
                id={`${formId}-doctorName`}
                name="doctorName"
                type="text"
                required
                value={formData.doctorName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('rx_intake.doctor_name_placeholder')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  touched.doctorName && errors.doctorName
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/40'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40'
                }`}
                aria-invalid={!!(touched.doctorName && errors.doctorName)}
                aria-describedby={touched.doctorName && errors.doctorName ? `${formId}-doctorName-error` : undefined}
              />
              {touched.doctorName && errors.doctorName && (
                <p id={`${formId}-doctorName-error`} className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {errors.doctorName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Mandatory Drug Allergies & Clinical Safety */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">3</span>
            {t('rx_intake.sec3_title')}
          </h3>

          <div className="space-y-4">
            {/* MANDATORY Known Drug Allergies Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={`${formId}-knownAllergies`} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('rx_intake.allergies_label')} <span className="text-rose-500">* ({t('rx_intake.allergies_mandatory')})</span>
                </label>
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  {t('rx_intake.allergies_safety_note')}
                </span>
              </div>
              <textarea
                id={`${formId}-knownAllergies`}
                name="knownAllergies"
                required
                rows={3}
                value={formData.knownAllergies}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('rx_intake.allergies_placeholder')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  touched.knownAllergies && errors.knownAllergies
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/40'
                    : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40'
                }`}
                aria-invalid={!!(touched.knownAllergies && errors.knownAllergies)}
                aria-describedby={touched.knownAllergies && errors.knownAllergies ? `${formId}-knownAllergies-error` : undefined}
              />
              {touched.knownAllergies && errors.knownAllergies ? (
                <p id={`${formId}-knownAllergies-error`} className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.knownAllergies}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {t('rx_intake.allergies_help')}
                </p>
              )}
            </div>

            {/* Current Medications & Dosage Notes */}
            <div>
              <label htmlFor={`${formId}-currentMedications`} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('rx_intake.medications_label')}
              </label>
              <textarea
                id={`${formId}-currentMedications`}
                name="currentMedications"
                rows={2}
                value={formData.currentMedications}
                onChange={handleChange}
                placeholder={t('rx_intake.medications_placeholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm transition outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40"
              />
            </div>

            {/* Prescription File Upload (Optional attachment) */}
            <div>
              <label htmlFor={`${formId}-prescriptionFile`} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('rx_intake.upload_file_label')}
              </label>
              <input
                id={`${formId}-prescriptionFile`}
                name="prescriptionFile"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950 dark:file:text-emerald-300 hover:file:bg-emerald-100 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Acknowledgment & Consent */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="acknowledgment"
              required
              checked={formData.acknowledgment}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('rx_intake.consent')} <span className="text-rose-500">*</span>
            </span>
          </label>
          {touched.acknowledgment && errors.acknowledgment && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {errors.acknowledgment}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('rx_intake.encryption_notice')}
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('rx_intake.submitting')}
              </span>
            ) : (
              t('rx_intake.submit_btn')
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
