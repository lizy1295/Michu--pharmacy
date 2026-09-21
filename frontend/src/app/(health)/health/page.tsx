'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import PrescriptionIntakeForm from '@/components/prescriptions/PrescriptionIntakeForm';

const BRANCHES = [
  { name: 'Adama Branch', address: 'Bole Road, Near Adama Stadium', phone: '+251 221 112 233', hours: '8:00 AM - 10:00 PM' },
  { name: 'Ayat Branch', address: 'Ayat Zone 2, Main Road', phone: '+251 116 889 900', hours: '24 Hours' },
  { name: 'Bethel Branch', address: 'Bethel Hospital Street', phone: '+251 113 445 566', hours: '8:00 AM - 9:00 PM' },
  { name: 'Dire Dawa Branch', address: 'Kezira, Opposite Train Station', phone: '+251 251 112 244', hours: '8:00 AM - 10:00 PM' },
  { name: 'Figa Branch', address: 'Figa Junction, Next to Commercial Bank', phone: '+251 116 334 455', hours: '8:00 AM - 11:00 PM' },
  { name: 'Hawassa Branch', address: 'Piazza, Near Hawassa University', phone: '+251 462 223 344', hours: '8:00 AM - 10:00 PM' },
  { name: 'Jemo Branch', address: 'Jemo 1 Condominiums, Block 4', phone: '+251 113 889 911', hours: '7:00 AM - 11:00 PM' },
];

const DRUG_DATABASE: Record<string, { uses: string; dosage: string; warnings: string }> = {
  'paracetamol': {
    uses: 'Relief of mild to moderate pain (headache, toothache, muscle pain) and fever reduction.',
    dosage: '1-2 tablets (500mg - 1000mg) every 4 to 6 hours as needed. Do not exceed 4000mg in 24 hours.',
    warnings: 'Avoid using with other paracetamol-containing drugs to prevent severe liver damage.'
  },
  'amoxicillin': {
    uses: 'Treatment of bacterial infections including middle ear, throat, respiratory tract, and urinary tract infections.',
    dosage: 'Typically 250mg to 500mg three times daily for 7-10 days. Complete the full course.',
    warnings: 'Requires a valid prescription. Do not use if allergic to penicillin or cephalosporin antibiotics.'
  },
  'nifedipine': {
    uses: 'Management of hypertension (high blood pressure) and chronic stable angina pectoris.',
    dosage: 'Usually 20mg to 60mg daily as a sustained-release tablet (e.g. Nicardia retard). Do not crush.',
    warnings: 'Can cause dizziness, headache, flushing, and peripheral edema. Avoid grapefruit juice.'
  },
  'ciprofloxacin': {
    uses: 'Broad-spectrum antibiotic used for bacterial infections (urinary tract, skin, eye/ear drops).',
    dosage: 'In drops form: 1-2 drops in affected eye/ear every 4 hours. In tablet form: 250mg - 500mg twice daily.',
    warnings: 'Complete full course. Avoid prolonged sun exposure. May cause tendonitis in rare cases.'
  },
  'acyclovir': {
    uses: 'Antiviral therapy to treat infections caused by herpes simplex virus (shingles, chickenpox, cold sores).',
    dosage: 'Usually 200mg to 800mg 5 times daily at regular intervals for 5-10 days.',
    warnings: 'Maintain adequate hydration during treatment to protect kidney function.'
  }
};

function HealthServicesContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'upload' | 'consult' | 'drug-info'>('upload');
  
  // Tab states synced with URL parameters
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'consult') {
      setActiveTab('consult');
    } else if (action === 'drug-info') {
      setActiveTab('drug-info');
    } else if (action === 'upload') {
      setActiveTab('upload');
    }
  }, [searchParams]);

  // Toast State
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Consultation Form State
  const [consultDoctor, setConsultDoctor] = useState('Dr. Million Negasa (Founder & Chief Pharmacist)');
  const [consultDate, setConsultDate] = useState('');
  const [consultTime, setConsultTime] = useState('10:00 AM');
  const [consultReason, setConsultReason] = useState('');

  // Drug Lookup State
  const [drugSearch, setDrugSearch] = useState('');
  const [drugResult, setDrugResult] = useState<{ name: string; uses: string; dosage: string; warnings: string } | null>(null);

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      triggerToast('⚠️ Internet Connection Required: Tele-health consultation booking requires an active internet connection.');
      return;
    }
    if (!consultDate) {
      triggerToast('Please select a preferred date.');
      return;
    }
    triggerToast(`Booking confirmed for ${consultDate} at ${consultTime} with ${consultDoctor}! Check your SMS for link.`);
    setConsultReason('');
  };

  const handleDrugSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = drugSearch.toLowerCase().trim();
    if (DRUG_DATABASE[query]) {
      setDrugResult({
        name: drugSearch,
        ...DRUG_DATABASE[query]
      });
    } else {
      // Find partial matches
      const key = Object.keys(DRUG_DATABASE).find(k => k.includes(query) || query.includes(k));
      if (key) {
        setDrugResult({
          name: key.toUpperCase(),
          ...DRUG_DATABASE[key]
        });
      } else {
        setDrugResult(null);
        triggerToast('Medication not found in database. Try searching for paracetamol, amoxicillin, nifedipine.');
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white rounded-xl shadow-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 border border-neutral-800 animate-in fade-in duration-200">
          <svg className="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      {/* Header title & Symptom Guide Feature Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">{t('health.title')}</h1>
          <p className="mt-2 text-sm text-neutral-500 max-w-xl">
            {t('health.subtitle')}
          </p>
        </div>
        <Link
          href="/symptoms"
          className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-lg hover:shadow-xl transition border border-emerald-600/40 hover:scale-[1.01]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
            🩺
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">New Clinical Tool</span>
            <p className="text-sm font-black text-white">Symptom Guide & Chronic Conditions</p>
          </div>
          <span className="text-emerald-300 font-bold ml-1">&rarr;</span>
        </Link>
      </div>

      {/* Grid: Form options on left, Branch locator & contact info on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Services forms) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab selector */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition duration-200 ${
                activeTab === 'upload' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('health.tab_upload')}
            </button>
            <button
              onClick={() => setActiveTab('consult')}
              className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition duration-200 ${
                activeTab === 'consult' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('health.tab_consult')}
            </button>
            <button
              onClick={() => setActiveTab('drug-info')}
              className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition duration-200 ${
                activeTab === 'drug-info' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('health.tab_drug_info')}
            </button>
          </div>

          {/* Form Content */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            
            {/* 1. Upload & Intake Prescription Form */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <PrescriptionIntakeForm
                  onSuccess={() => {
                    triggerToast('Prescription intake successfully submitted and logged with licensed pharmacist!');
                  }}
                />
              </div>
            )}

            {/* 2. Book Tele-health Consultation Form */}
            {activeTab === 'consult' && (
              <form onSubmit={handleConsultationSubmit} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">{t('health.consult_title')}</h2>
                <p className="text-xs text-gray-500">
                  {t('health.consult_desc')}
                </p>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">{t('health.consult_doctor')}</label>
                  <select
                    value={consultDoctor}
                    onChange={(e) => setConsultDoctor(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Dr. Million Negasa (Founder & Chief Pharmacist)">Dr. Million Negasa (Founder & Chief Pharmacist)</option>
                    <option value="Dr. Sarah Hailu (Clinical Lead)">Dr. Sarah Hailu (Clinical Lead)</option>
                    <option value="Abebe Kebede (Senior Pharmacist)">Abebe Kebede (Senior Pharmacist)</option>
                    <option value="Dr. Betty Girma (Cosmetic consultant)">Dr. Betty Girma (Cosmetic consultant)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">{t('health.consult_date')}</label>
                    <input
                      type="date"
                      required
                      value={consultDate}
                      onChange={(e) => setConsultDate(e.target.value)}
                      className="mt-1.5 block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">{t('health.consult_time')}</label>
                    <select
                      value={consultTime}
                      onChange={(e) => setConsultTime(e.target.value)}
                      className="mt-1.5 block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">{t('health.consult_reason')}</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Briefly describe what questions or issues you would like to discuss (e.g. side effects, dosages, multi-drug reviews)."
                    value={consultReason}
                    onChange={(e) => setConsultReason(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 text-sm active:scale-95 transition shadow-sm"
                >
                  Schedule Video Consultation
                </button>
              </form>
            )}

            {/* 3. Drug Info Search Database */}
            {activeTab === 'drug-info' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Drug Information Safety Database</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Check critical medication facts. Find uses, recommended dosages, and severe interactions.
                  </p>
                </div>

                <form onSubmit={handleDrugSearch} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Search medication name (e.g. Paracetamol, Amoxicillin, Nifedipine)..."
                    value={drugSearch}
                    onChange={(e) => setDrugSearch(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm"
                  >
                    Lookup
                  </button>
                </form>

                {/* Display Lookup Results */}
                {drugResult ? (
                  <div className="border border-brand-100 rounded-xl p-5 bg-brand-50/20 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-brand-100 pb-2">
                      <h3 className="text-lg font-bold text-brand-900 capitalize">{drugResult.name} Details</h3>
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded uppercase">Verified Guide</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">Approved Uses</p>
                        <p className="text-gray-700 leading-normal">{drugResult.uses}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">Recommended Dosage</p>
                        <p className="text-gray-700 leading-normal">{drugResult.dosage}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-red-400 uppercase">Safety Warnings</p>
                        <p className="text-red-700 font-medium leading-normal">{drugResult.warnings}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-xl p-8 text-center text-gray-400 bg-gray-50/50">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-semibold">Enter a medication name above to lookup clinical facts.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Column (Branches Contacts) */}
        <aside className="space-y-6">
          <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Branch Locator</h2>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {BRANCHES.map((b, idx) => (
                <div key={idx} className="border-b last:border-0 pb-3 last:pb-0 space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-neutral-800">{b.name}</h3>
                    {b.hours === '24 Hours' && (
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">Open 24/7</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {b.address}
                  </p>
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {b.phone}
                  </p>
                  <p className="text-xs text-neutral-400 font-medium">Hours: {b.hours}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick FAQ info box */}
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide">Helpful Guide</h3>
            <ul className="text-xs text-brand-800 space-y-2.5 list-disc list-inside">
              <li>
                <strong>Prescription Pickups:</strong> Due to health safety regulations, prescription drugs cannot be delivered and must be checked by our pharmacist at branches.
              </li>
              <li>
                <strong>Tele-health Consults:</strong> Connect directly with licensed clinical pharmacists for professional medication guidance and safety reviews.
              </li>
              <li>
                <strong>Review Time:</strong> Standard uploads take approximately 15-30 minutes to review during standard opening hours.
              </li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default function HealthServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-semibold">Loading health services...</div>}>
      <HealthServicesContent />
    </Suspense>
  );
}
