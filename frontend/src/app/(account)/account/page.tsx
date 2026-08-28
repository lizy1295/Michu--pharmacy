'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { AuthUser } from '@michu/shared';
import { getMe } from '@/lib/api/auth';
import { clearTokens, getAccessToken } from '@/lib/auth/tokens';
import { getOrdersByCustomer, Order } from '@/lib/api/orders';
import { useLanguage, LANGUAGES, Language } from '@/context/LanguageContext';

export default function AccountPage() {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'rx' | 'language'>('orders');

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((userData) => {
        setUser(userData);
        if (userData?.email) {
          setLoadingOrders(true);
          getOrdersByCustomer({ email: userData.email })
            .then(setOrders)
            .catch((err) => console.error('Failed to load customer orders', err))
            .finally(() => setLoadingOrders(false));
        }
      })
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

  // Component for Language Choice 6-Languages Card
  const LanguagePreferencesCard = () => (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
            <span>🌐</span>
            <span>{t('dashboard.lang_title')}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {t('dashboard.lang_subtitle')}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0 self-start sm:self-auto">
          <span>Active:</span>
          <strong className="uppercase">{language}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {LANGUAGES.map((langItem) => {
          const isSelected = language === langItem.code;
          return (
            <button
              key={langItem.code}
              type="button"
              onClick={() => setLanguage(langItem.code)}
              className={`p-4 rounded-xl border text-left transition relative overflow-hidden flex flex-col justify-between min-h-[105px] group ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/30 shadow-sm'
                  : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-emerald-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <span className="text-2xl shrink-0">{langItem.flag}</span>
                <div>
                  <h4 className={`text-sm font-extrabold ${isSelected ? 'text-emerald-950' : 'text-neutral-800 group-hover:text-emerald-800'}`}>
                    {langItem.nativeName}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {langItem.name}
                  </p>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[10px]">
                <span className={isSelected ? 'text-emerald-700 font-bold' : 'text-gray-400'}>
                  {isSelected ? t('dashboard.lang_active') : t('dashboard.lang_select_btn')}
                </span>
                <span className="font-mono text-gray-400 uppercase">
                  {langItem.code}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Guest Logged-out view
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">

        {/* Hero Image Banner */}
        <div className="relative w-full h-56 sm:h-72 rounded-3xl overflow-hidden shadow-xl">
          <Image
            src="/pharmacy-hero.jpg"
            alt="Michu Pharmacy — Your trusted health partner"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 via-emerald-800/50 to-transparent" />
          {/* Text on top of image */}
          <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-emerald-300 mb-2">
              Michu Pharmacy
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
              {t('nav.slogan')}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-xs leading-relaxed">
              {t('dashboard.subtitle')}
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-brand-500/5 -z-10 blur-2xl"></div>
          <div className="absolute -bottom-24 -right-12 w-64 h-64 rounded-full bg-emerald-500/5 -z-10 blur-3xl"></div>

          <div className="w-16 h-16 bg-brand-50 border border-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            {t('dashboard.guest_title')}
          </h1>
          <p className="mt-3 text-gray-500 max-w-md mx-auto leading-relaxed">
            {t('dashboard.guest_desc')}
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-brand-600 px-8 py-3 text-sm font-bold text-white hover:bg-brand-700 transition active:scale-95 shadow-md shadow-brand-100"
            >
              {t('nav.sign_in')}
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-gray-300 hover:bg-gray-50 px-8 py-3 text-sm font-bold text-gray-600 transition active:scale-95"
            >
              {t('dashboard.shop_products')}
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

        {/* 6 Languages Preference Card for Guests */}
        <LanguagePreferencesCard />
      </div>
    );
  }

  // User Logged-in view
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">

      {/* Hero Welcome Banner — image-first design */}
      <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden mb-8 shadow-2xl">
        <Image
          src="/pharmacy-hero.jpg"
          alt="Michu Pharmacy dashboard banner"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 py-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-emerald-300 mb-1 drop-shadow">
              {t('dashboard.welcome_back')}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-1 text-xs text-white/80 max-w-xs leading-relaxed drop-shadow">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Pill badges */}
          <div className="shrink-0 hidden sm:flex flex-col items-end gap-2">
            <span className="bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full">
              {user.role.replace('_', ' ')}
            </span>
            <span className="bg-emerald-500/20 backdrop-blur-md border border-emerald-300/30 text-emerald-200 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span>🌐</span>
              <span className="uppercase">{language}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: User Profile Details, Language Selector Quick Card & Yene Card (Sticky) */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          
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
                <dt className="text-xs font-bold text-gray-400 uppercase">{t('dashboard.registered_email')}</dt>
                <dd className="font-semibold text-gray-700 mt-0.5">{user.email}</dd>
              </div>
            </dl>

            <button
              onClick={handleLogout}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 active:scale-95 transition"
            >
              {t('nav.sign_out')}
            </button>
          </div>

          {/* Yene Loyalty Card Widget */}
          <div className="bg-gradient-to-tr from-brand-900 to-emerald-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden border border-brand-800">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-brand-500/10 blur-xl pointer-events-none"></div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-brand-300 font-extrabold uppercase tracking-widest">Michu Pharmacy Loyalty</p>
                <h3 className="text-xl font-black tracking-tight mt-0.5">{t('dashboard.yene_card')}</h3>
              </div>
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/15">YC</span>
            </div>

            <div className="mt-8 flex justify-between items-end">
              <div>
                <p className="text-[9px] text-brand-400 font-semibold uppercase">Card Holder</p>
                <p className="text-sm font-bold tracking-wide mt-0.5">{user.firstName} {user.lastName}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-brand-400 font-semibold uppercase">{t('dashboard.points_balance')}</p>
                <p className="text-xl font-black mt-0.5">480 <span className="text-xs font-normal text-brand-300">pts</span></p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-brand-300">
              <span>{t('dashboard.loyalty_tier')}: <strong className="text-brand-200">Emerald Class</strong></span>
              <span>{t('dashboard.discount_active')}</span>
            </div>
          </div>
        </aside>

        {/* Right Column: Tabbed Lists (Orders / Prescriptions / Language Choices) */}
        <section className="lg:col-span-2 space-y-6">
          
          {/* Tab selector */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-3 px-5 text-sm font-bold border-b-2 transition duration-200 whitespace-nowrap ${
                activeTab === 'orders' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('dashboard.tab_orders')} ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('rx')}
              className={`py-3 px-5 text-sm font-bold border-b-2 transition duration-200 whitespace-nowrap ${
                activeTab === 'rx' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('dashboard.tab_prescriptions')} (2)
            </button>
            <button
              onClick={() => setActiveTab('language')}
              className={`py-3 px-5 text-sm font-bold border-b-2 transition duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'language' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>🌐</span>
              <span>{t('dashboard.tab_language')}</span>
            </button>
          </div>

          {/* Tab 1: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {loadingOrders ? (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                  <svg className="animate-spin h-6 w-6 text-brand-600 mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-xs font-semibold">Loading your orders...</p>
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="bg-white border rounded-2xl p-5 shadow-sm space-y-3.5">
                    <div className="flex flex-col sm:flex-row justify-between border-b pb-3 gap-2">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">{t('dashboard.order_ref')}</p>
                        <p className="text-sm font-extrabold font-mono text-neutral-800">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">{t('dashboard.order_date')}</p>
                        <p className="text-xs text-neutral-600 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {order.paymentStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {Array.isArray(order.items) && order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-medium">{item.name} &times; {item.quantity || 1}</span>
                          <span className="font-bold text-neutral-800">{(Number(item.price) * (item.quantity || 1)).toFixed(2)} ETB</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t flex justify-between items-center text-xs">
                      <p className="text-gray-500">{t('dashboard.paid_via')} <strong className="uppercase text-brand-700">{order.paymentMethod || 'cash'}</strong></p>
                      <p className="text-sm font-extrabold text-neutral-900 font-mono">{t('dashboard.total')}: {Number(order.total).toFixed(2)} ETB</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 border rounded-2xl bg-slate-50 text-center space-y-3">
                  <p className="text-sm font-bold text-slate-700">{t('dashboard.no_orders')}</p>
                  <p className="text-xs text-slate-400">{t('dashboard.no_orders_sub')}</p>
                  <Link href="/products" className="inline-block rounded-full bg-brand-600 text-white font-bold text-xs px-6 py-2">
                    {t('dashboard.shop_products')}
                  </Link>
                </div>
              )}
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
                    {t('dashboard.rx_status_review')}
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
                    {t('dashboard.rx_status_approved')}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 bg-neutral-50 rounded-xl p-3 border">
                  <p><strong>Pharmacist Notes:</strong> {t('dashboard.rx_pick_up_notice')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Language Choice (6 Languages) */}
          {activeTab === 'language' && (
            <LanguagePreferencesCard />
          )}

        </section>

      </div>
    </div>
  );
}
