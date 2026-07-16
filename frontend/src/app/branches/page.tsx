'use client';

import { useState } from 'react';
import Link from 'next/link';

const BRANCHES = [
  { name: 'Ayat Branch', address: 'Ayat Zone 2, Main Road', phone: '+251 116 889 900', hours: '24 Hours', services: ['Prescription', 'Consultation', 'Delivery Pickup', 'Loyalty'], coordinates: '9.02, 38.76' },
  { name: 'Adama Branch', address: 'Bole Road, Near Adama Stadium', phone: '+251 221 112 233', hours: '8:00 AM - 10:00 PM', services: ['Prescription', 'Consultation', 'Delivery'], coordinates: '8.54, 39.27' },
  { name: 'Bethel Branch', address: 'Bethel Hospital Street', phone: '+251 113 445 566', hours: '8:00 AM - 9:00 PM', services: ['Prescription', 'Consultation', 'Loyalty'], coordinates: '9.01, 38.74' },
  { name: 'Dire Dawa Branch', address: 'Kezira, Opposite Train Station', phone: '+251 251 112 244', hours: '8:00 AM - 10:00 PM', services: ['Prescription', 'Delivery Pickup'], coordinates: '9.60, 41.85' },
  { name: 'Figa Branch', address: 'Figa Junction, Next to Commercial Bank', phone: '+251 116 334 455', hours: '8:00 AM - 11:00 PM', services: ['Prescription', 'Consultation', 'Delivery'], coordinates: '9.03, 38.73' },
  { name: 'Hawassa Branch', address: 'Piazza, Near Hawassa University', phone: '+251 462 223 344', hours: '8:00 AM - 10:00 PM', services: ['Prescription', 'Consultation', 'Delivery', 'Loyalty'], coordinates: '7.04, 38.47' },
  { name: 'Jemo Branch', address: 'Jemo 1 Condominiums, Block 4', phone: '+251 113 889 911', hours: '7:00 AM - 11:00 PM', services: ['Prescription', 'Consultation', 'Delivery', 'Loyalty'], coordinates: '9.02, 38.80' },
];

export default function BranchesPage() {
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = BRANCHES.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q) || b.services.some(s => s.toLowerCase().includes(q));
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-brand-600 text-xs font-bold uppercase tracking-wider">Find Us</span>
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mt-2">Our Branches</h1>
        <p className="text-sm text-neutral-500 mt-3">Visit any of our 7 branches across Ethiopia for medications, consultations, and health services.</p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-8 relative">
        <input
          type="text"
          placeholder="Search by branch name, area, or service..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branch List */}
        <div className="lg:col-span-1 space-y-3">
          {filtered.map((branch, idx) => (
            <button
              key={branch.name}
              onClick={() => setSelectedBranch(branch)}
              className={`w-full text-left rounded-2xl p-4 transition duration-200 border ${
                selectedBranch.name === branch.name
                  ? 'bg-brand-50 border-brand-200 shadow-md'
                  : 'bg-white border-gray-100 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-800">{branch.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{branch.address}</p>
                </div>
                {branch.hours === '24 Hours' && (
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">Open 24/7</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Branch Detail */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
            {/* Map Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-brand-100 to-emerald-100 relative flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
                  {selectedBranch.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <p className="text-sm font-bold text-brand-900 mt-2">{selectedBranch.name}</p>
                <p className="text-xs text-gray-500">{selectedBranch.address}</p>
              </div>
            </div>

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
                    Call Branch
                  </a>
                  <Link href="/health?action=upload" className="rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 text-sm text-center transition">
                    Upload Rx
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Available Services</h3>
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
