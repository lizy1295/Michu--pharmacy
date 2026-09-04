'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { BranchLocation, BRANCH_LOCATIONS } from '@/lib/data/branchesData';
import BranchGoogleMap from '@/components/branches/BranchGoogleMap';

export default function BranchesPage() {
  const { t, language } = useLanguage();
  const [selectedBranch, setSelectedBranch] = useState<BranchLocation>(BRANCH_LOCATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = BRANCH_LOCATIONS.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q) || b.services.some(s => s.toLowerCase().includes(q));
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-brand-600 text-xs font-bold uppercase tracking-wider">{t('branches.find_us')}</span>
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mt-2">{t('branches.title')}</h1>
        <p className="text-sm text-neutral-500 mt-3">{t('branches.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-8 relative">
        <input
          type="text"
          placeholder={t('branches.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branch List */}
        <div className="lg:col-span-1 space-y-3">
          {filtered.map((branch) => (
            <button
              key={branch.name}
              onClick={() => setSelectedBranch(branch)}
              className={`w-full text-left rounded-2xl p-4 transition duration-200 border ${
                selectedBranch.name === branch.name
                  ? 'bg-brand-50 border-brand-200 shadow-md ring-2 ring-brand-500/20'
                  : 'bg-white border-gray-100 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-800">
                    {language === 'am' && branch.nameAm ? branch.nameAm : branch.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {language === 'am' && branch.addressAm ? branch.addressAm : branch.address}
                  </p>
                </div>
                {branch.is24Hours && (
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">{t('branches.open_247')}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Branch Detail */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
            {/* Interactive Branch Google Map */}
            <BranchGoogleMap
              branches={BRANCH_LOCATIONS}
              selectedBranch={selectedBranch}
              onSelectBranch={setSelectedBranch}
              height="380px"
              className="border-none rounded-none rounded-t-3xl shadow-none"
            />

            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-3">
                  <h2 className="text-xl font-extrabold text-neutral-900">{selectedBranch.name}</h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {selectedBranch.address}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {selectedBranch.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {selectedBranch.hours}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <a href={`tel:${selectedBranch.phone}`} className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 text-sm text-center transition shadow-sm">
                    {t('branches.call_branch')}
                  </a>
                  <Link href="/health?action=upload" className="rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 text-sm text-center transition">
                    {t('nav.upload_prescription')}
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">{t('branches.services')}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedBranch.services.map((service) => (
                    <span key={service} className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
