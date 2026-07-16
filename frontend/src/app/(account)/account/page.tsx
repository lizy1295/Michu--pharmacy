'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AuthUser } from '@michu/shared';
import { getMe } from '@/lib/api/auth';
import { clearTokens, getAccessToken } from '@/lib/auth/tokens';

export default function AccountPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'rx'>('orders');

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    clearTokens();
    setUser(null);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 flex flex-col items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-brand-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-500 font-semibold text-sm">Verifying session credentials...</p>
      </div>
    );
  }

  // Guest Logged-out view
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="bg-white border rounded-3xl p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-brand-500/5 -z-10 blur-2xl"></div>
          <div className="absolute -bottom-24 -right-12 w-64 h-64 rounded-full bg-emerald-500/5 -z-10 blur-3xl"></div>

          <div className="w-16 h-16 bg-brand-50 border border-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">My Account</h1>
          <p className="mt-3 text-gray-500 max-w-md mx-auto leading-relaxed">
            Create an account to upload prescriptions, track order history, book clinical consultations, and earn rewards with your Yene Card.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-brand-600 px-8 py-3 text-sm font-bold text-white hover:bg-brand-700 transition active:scale-95 shadow-md shadow-brand-100"
            >
              Sign In
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-gray-300 hover:bg-gray-50 px-8 py-3 text-sm font-bold text-gray-600 transition active:scale-95"
            >
              Shop First
            </Link>
          </div>

          {/* Value props list */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t">
            <div className="text-center space-y-1">
              <p className="font-bold text-neutral-800 text-sm">Digital Rx Locker</p>
              <p className="text-xs text-gray-400">Keep and renew your prescriptions safely online</p>
            </div>
            <div className="text-center space-y-1">
              <p className="font-bold text-neutral-800 text-sm">Yene Loyalty Card</p>
              <p className="text-xs text-gray-400">Get points on cosmetics and supplements checkouts</p>
            </div>
            <div className="text-center space-y-1">
              <p className="font-bold text-neutral-800 text-sm">Pharmacist Consults</p>
              <p className="text-xs text-gray-400">Book direct clinical video consultation slots</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User Logged-in view
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">My Account</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage details, active prescription lists, and Yene Card loyalty points.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: User Profile Details & Yene Card */}
        <aside className="space-y-6">
          
          {/* Details Card */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-extrabold text-lg shadow">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div>
                <h2 className="font-bold text-neutral-800 text-base">{user.firstName} {user.lastName}</h2>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded uppercase tracking-wider mt-1 inline-block">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-bold text-gray-400 uppercase">Registered Email</dt>
                <dd className="font-semibold text-gray-700 mt-0.5">{user.email}</dd>
              </div>
            </dl>

            <button
              onClick={handleLogout}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 active:scale-95 transition"
            >
              Sign Out Account
            </button>
          </div>

          {/* Yene Loyalty Card Widget */}
          <div className="bg-gradient-to-tr from-brand-900 to-emerald-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden border border-brand-800">
            {/* Background design elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-brand-500/10 blur-xl pointer-events-none"></div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-brand-300 font-extrabold uppercase tracking-widest">Michu Pharmacy Loyalty</p>
                <h3 className="text-xl font-black tracking-tight mt-0.5">YENE CARD</h3>
              </div>
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/15">YC</span>
            </div>

            <div className="mt-8 flex justify-between items-end">
              <div>
                <p className="text-[9px] text-brand-400 font-semibold uppercase">Card Holder</p>
                <p className="text-sm font-bold tracking-wide mt-0.5">{user.firstName} {user.lastName}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-brand-400 font-semibold uppercase">Points Balance</p>
                <p className="text-xl font-black mt-0.5">480 <span className="text-xs font-normal text-brand-300">pts</span></p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-brand-300">
              <span>Tier status: <strong className="text-brand-200">Emerald Class</strong></span>
              <span>10% Discount Coupon Active</span>
            </div>
          </div>
        </aside>

        {/* Right Column: Tabbed Lists (Orders / Prescriptions) */}
        <section className="lg:col-span-2 space-y-6">
          
          {/* Tab selector */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition duration-200 ${
                activeTab === 'orders' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('rx')}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition duration-200 ${
                activeTab === 'rx' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Prescriptions ({activeTab === 'rx' ? '2' : '2'})
            </button>
          </div>

          {/* Tab 1: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order Item 1 */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3.5">
                <div className="flex flex-col sm:flex-row justify-between border-b pb-3 gap-2">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Order ID</p>
                    <p className="text-sm font-bold text-neutral-800">#MPH-998-1002</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Order Date</p>
                    <p className="text-xs text-neutral-600 mt-0.5">July 10, 2026</p>
                  </div>
                  <div>
                    <span className="bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                      Home Delivering
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">3D white charcoal whitening Tp &times; 1</span>
                    <span className="font-bold text-neutral-800">500.00 ETB</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">(Exedexe) Dextromethorphan syrup &times; 2</span>
                    <span className="font-bold text-neutral-800">480.00 ETB</span>
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-between items-center">
                  <p className="text-xs text-gray-400">Paid online via CBE Birr</p>
                  <p className="text-sm font-extrabold text-neutral-900">Total: 1,127.00 ETB</p>
                </div>
              </div>

              {/* Order Item 2 */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3.5 opacity-85">
                <div className="flex flex-col sm:flex-row justify-between border-b pb-3 gap-2">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Order ID</p>
                    <p className="text-sm font-bold text-neutral-800">#MPH-872-9112</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Order Date</p>
                    <p className="text-xs text-neutral-600 mt-0.5">June 18, 2026</p>
                  </div>
                  <div>
                    <span className="bg-neutral-100 border text-neutral-600 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                      Completed
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Michu Daily Multi-Vitamin &times; 1</span>
                    <span className="font-bold text-neutral-800">350.00 ETB</span>
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-between items-center">
                  <p className="text-xs text-gray-400">Paid in-cash at Ayat Branch</p>
                  <p className="text-sm font-extrabold text-neutral-900">Total: 402.50 ETB</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Prescriptions */}
          {activeTab === 'rx' && (
            <div className="space-y-4">
              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-800">Prescription_July2026.pdf</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Uploaded on July 10, 2026</p>
                  </div>
                  <span className="bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                    Awaiting Review
                  </span>
                </div>
                <div className="text-xs text-neutral-500 bg-neutral-50 rounded-xl p-3 border">
                  <p><strong>Pharmacist Notes:</strong> Assigned to <strong>Ayat Branch</strong> for pharmacist check. A notification will be dispatched when approved.</p>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3 opacity-90">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-800">Prescription_DrAbdi_May26.jpg</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Uploaded on May 24, 2026</p>
                  </div>
                  <span className="bg-emerald-100 border text-emerald-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                    Approved
                  </span>
                </div>
                <div className="text-xs text-neutral-500 bg-neutral-50 rounded-xl p-3 border">
                  <p><strong>Pharmacist Notes:</strong> Prescription validated. Medications prepared & collected at Bethel Branch.</p>
                </div>
              </div>
            </div>
          )}

        </section>

      </div>
    </div>
  );
}
