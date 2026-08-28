'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, useMemo } from 'react';
import { getProducts, Product, getImageUrl } from '@/lib/api/products';

export default function HomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [categories, setCategories] = useState<{ name: string; count: number; color: string; icon: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);

  const FEATURED_BRANDS = useMemo(() => [
    { name: 'EPHARM', origin: language === 'am' ? 'የኢትዮጵያ መድኃኒት ፋብሪካ' : 'Ethiopian Pharm. Mfg.', badge: 'National Leader', icon: '🇪🇹', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    { name: 'Cadila Pharmaceuticals', origin: language === 'am' ? 'ካዲላ ኢትዮጵያ' : 'Cadila Ethiopia', badge: 'Certified GMP', icon: '💊', color: 'bg-blue-50 border-blue-200 text-blue-800' },
    { name: 'Julphar Pharmaceuticals', origin: language === 'am' ? 'ጁልፋር ኢትዮጵያ' : 'Julphar Ethiopia', badge: 'Global Standard', icon: '🏢', color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
    { name: 'Addis Pharmaceuticals (APF)', origin: language === 'am' ? 'ኤፒኤፍ ዓዲግራት / አዲስ' : 'APF Adigrat / Addis', badge: 'Trusted Generic', icon: '🛡️', color: 'bg-amber-50 border-amber-200 text-amber-800' },
    { name: 'Novartis', origin: language === 'am' ? 'ስዊዘርላንድ' : 'Switzerland', badge: 'Premium Rx', icon: '⚕️', color: 'bg-rose-50 border-rose-200 text-rose-800' },
    { name: 'Sanofi', origin: language === 'am' ? 'ፈረንሳይ' : 'France', badge: 'Specialty Care', icon: '💉', color: 'bg-purple-50 border-purple-200 text-purple-800' },
    { name: 'GSK', origin: language === 'am' ? 'ግላክሶ ስሚዝ ክላይን ዩኬ' : 'GlaxoSmithKline UK', badge: 'Vaccines & OTC', icon: '🔬', color: 'bg-orange-50 border-orange-200 text-orange-800' },
    { name: 'Pfizer', origin: language === 'am' ? 'አሜሪካ' : 'USA', badge: 'Therapeutics', icon: '🧪', color: 'bg-sky-50 border-sky-200 text-sky-800' },
    { name: 'AstraZeneca', origin: language === 'am' ? 'ዩኬ / ስዊድን' : 'UK / Sweden', badge: 'Cardio & Resp.', icon: '🫀', color: 'bg-teal-50 border-teal-200 text-teal-800' },
    { name: 'Denk Pharma', origin: language === 'am' ? 'ጀርመን' : 'Germany', badge: 'German Quality', icon: '🇩🇪', color: 'bg-slate-50 border-slate-200 text-slate-800' },
    { name: 'DKT Ethiopia', origin: language === 'am' ? 'የቤተሰብ ጤና' : 'Family Health', badge: 'Reproductive Care', icon: '🩺', color: 'bg-pink-50 border-pink-200 text-pink-800' },
    { name: 'CeraVe & Skincare', origin: language === 'am' ? 'የቆዳ ህክምና ማዘዣ' : 'Dermatologist Rx', badge: 'Skin Barrier', icon: '✨', color: 'bg-cyan-50 border-cyan-200 text-cyan-800' },
  ], [language]);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const data = await getProducts();
        if (!isMounted) return;

        setLiveProducts(data);

        const categoryMap = new Map<string, number>();
        data.forEach((p: Product) => {
          const cat = p.category || 'Other';
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });

        const colorMap: Record<string, string> = {
          'Medicine': 'bg-emerald-50 text-emerald-700 border-emerald-100',
          'Medicines': 'bg-emerald-50 text-emerald-700 border-emerald-100',
          'Supplement': 'bg-blue-50 text-blue-700 border-blue-100',
          'Supplements': 'bg-blue-50 text-blue-700 border-blue-100',
          'Cosmetic': 'bg-purple-50 text-purple-700 border-purple-100',
          'Cosmetics': 'bg-purple-50 text-purple-700 border-purple-100',
          'Medical Devices': 'bg-amber-50 text-amber-700 border-amber-100',
          'Personal Care': 'bg-pink-50 text-pink-700 border-pink-100',
        };

        const iconMap: Record<string, string> = {
          'Medicine': 'pill',
          'Medicines': 'pill',
          'Supplement': 'bottle',
          'Supplements': 'bottle',
          'Cosmetic': 'cream',
          'Cosmetics': 'cream',
          'Medical Devices': 'device',
          'Personal Care': 'spray',
        };

        const dynamicCategories = Array.from(categoryMap.entries())
          .map(([name, count]) => ({
            name,
            count,
            color: colorMap[name] || 'bg-gray-50 text-gray-700 border-gray-100',
            icon: iconMap[name] || 'default',
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        if (dynamicCategories.length === 0) {
          // Fallback initial categories if database is syncing
          setCategories([
            { name: 'Medicine', count: 45, color: colorMap['Medicine'], icon: 'pill' },
            { name: 'Supplement', count: 28, color: colorMap['Supplement'], icon: 'bottle' },
            { name: 'Cosmetic', count: 32, color: colorMap['Cosmetic'], icon: 'cream' },
            { name: 'Medical Devices', count: 18, color: colorMap['Medical Devices'], icon: 'device' },
            { name: 'Personal Care', count: 24, color: colorMap['Personal Care'], icon: 'spray' },
          ]);
        } else {
          setCategories(dynamicCategories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    };

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const getTranslatedCategoryName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('medicine')) return t('home.cat_medicine');
    if (lower.includes('supplement') || lower.includes('vitamin')) return t('home.cat_supplement');
    if (lower.includes('cosmetic') || lower.includes('skin')) return t('home.cat_cosmetic');
    if (lower.includes('device')) return t('home.cat_medical_devices');
    if (lower.includes('personal')) return t('home.cat_personal_care');
    return name;
  };

  const features = [
    {
      title: t('home.service_rx_title'),
      description: t('home.service_rx_desc'),
      link: '/health?action=upload',
      buttonText: t('home.service_rx_btn'),
      color: 'border-emerald-200 hover:border-emerald-300 bg-emerald-50/50'
    },
    {
      title: t('home.service_consult_title'),
      description: t('home.service_consult_desc'),
      link: '/health?action=consult',
      buttonText: t('home.service_consult_btn'),
      color: 'border-brand-200 hover:border-brand-300 bg-brand-50/50'
    },
    {
      title: t('home.service_reward_title'),
      description: t('home.service_reward_desc'),
      link: '/account',
      buttonText: t('home.service_reward_btn'),
      color: 'border-purple-200 hover:border-purple-300 bg-purple-50/50'
    }
  ];

  const featuredProducts = [
    {
      id: 'prod-exedexe',
      name: '(Exedexe) Dextromethorphan syrup 120ml',
      price: 240,
      prescriptionRequired: false,
      imageType: 'syrup' as const,
      desc: 'Cough suppressant syrup for dry cough relief and throat comfort'
    },
    {
      id: 'prod-actrapid',
      name: 'Actrapid 100iu/ml 10ml/vial soluble insulin',
      price: 1155,
      prescriptionRequired: true,
      imageType: 'tablet' as const,
      desc: 'Soluble human insulin injection for blood glucose regulation'
    },
    {
      id: 'prod-acyclovir',
      name: 'Acyclovir Denk 200mg of 5*10 tabletten',
      price: 460,
      prescriptionRequired: true,
      imageType: 'tablet' as const,
      desc: 'Antiviral formulation for herpes simplex and viral infections'
    },
    {
      id: 'prod-crest',
      name: '3D white charcoal whitening Tp of 204g',
      price: 500,
      prescriptionRequired: false,
      imageType: 'cosmetic' as const,
      desc: 'Enamel-safe whitening toothpaste for deep stain removal'
    }
  ];

  const renderIcon = (type: string) => {
    switch (type) {
      case 'pill':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'bottle':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'cream':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158A6 6 0 018 16m0 0l-4 4-2-2 4-4" />
          </svg>
        );
      case 'device':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const renderProductIllustration = (type: string) => {
    switch (type) {
      case 'syrup':
        return (
          <div className="w-full h-full bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2h-1M5 11V9a2 2 0 012-2h1m5-4h2a1 1 0 011 1v2H11V4a1 1 0 011-1z" />
            </svg>
          </div>
        );
      case 'tablet':
        return (
          <div className="w-full h-full bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 22a10 10 0 100-20 10 10 0 000 20zm0-10h.01M8 12h.01M16 12h.01M12 8h.01M12 16h.01" />
            </svg>
          </div>
        );
      case 'cosmetic':
        return (
          <div className="w-full h-full bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zM12 5V2m-3 3v4a3 3 0 006 0V5" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col bg-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white rounded-xl shadow-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 border border-neutral-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <svg className="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* 1. Hero Landing Section with Clean Full-Width Background (Grid overlay removed) */}
      <section className="relative w-full overflow-hidden text-white min-h-[520px] sm:min-h-[580px] md:min-h-[640px] flex items-center justify-center">
        {/* Full-width background image with clean, smooth gradient lighting without square grid */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/pharmacy-hero.png"
            alt="Michu Pharmacy — Quality Medicines & Health Products"
            fill
            priority
            className="object-cover object-center w-full h-full"
            sizes="100vw"
            quality={95}
          />
          {/* Smooth Multilayer Gradient & Lighting Overlay without any square artifacts */}
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/92 via-emerald-950/80 to-neutral-950/88" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28 flex flex-col items-center text-center z-10 w-full">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
              {t('home.hero_badge1')}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white border border-white/20 rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md shadow-sm">
              {t('home.hero_badge2')}
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl leading-tight drop-shadow-md">
            {t('home.hero_title1')}<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 via-emerald-200 to-teal-200">
              {t('home.hero_title2')}
            </span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-emerald-100/90 max-w-2xl leading-relaxed drop-shadow">
            {t('home.hero_desc')}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="rounded-full bg-brand-600 hover:bg-brand-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-900/40 transition-all hover:scale-105 active:scale-95 duration-150"
            >
              {t('home.hero_btn_shop')}
            </Link>
            <Link
              href="/health?action=upload"
              className="rounded-full border border-emerald-400/40 bg-emerald-950/60 hover:bg-emerald-900/80 px-8 py-3.5 text-sm font-bold text-emerald-100 hover:text-white transition-all hover:scale-105 active:scale-95 duration-150 backdrop-blur-md shadow-lg"
            >
              {t('home.hero_btn_rx')}
            </Link>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200/80 font-medium">
            <span className="flex items-center gap-1.5">{t('home.hero_trust1')}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">{t('home.hero_trust2')}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">{t('home.hero_trust3')}</span>
          </div>
        </div>
      </section>

      {/* 2. Promotions Banner */}
      <section className="bg-emerald-900 text-white py-5 px-4 border-b border-emerald-800 shadow-inner">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs uppercase animate-pulse">
              {t('home.promo_badge')}
            </span>
            <p className="text-sm font-bold text-emerald-100">
              {t('home.promo_text')}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/products"
              className="px-4 py-2 rounded-xl bg-white text-emerald-950 text-xs font-black hover:bg-emerald-100 transition shadow-sm"
            >
              {t('home.promo_cta')}
            </Link>
            <Link
              href="/blogs"
              className="px-4 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-emerald-200 text-xs font-bold transition border border-emerald-700"
            >
              {t('home.promo_blogs')}
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category Quick Links */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-extrabold text-neutral-800">
            {t('home.categories_title')}
          </h2>
          <p className="text-center text-sm text-neutral-500 mt-1 max-w-md mx-auto">
            {t('home.categories_subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-8">
            {categoriesLoading ? (
              <p className="text-sm text-neutral-500">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-neutral-500">No categories available.</p>
            ) : (
              categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(`/products?category=${encodeURIComponent(cat.name)}`)}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition duration-200 shadow-sm group-hover:scale-105 group-hover:shadow-md ${cat.color}`}>
                    {renderIcon(cat.icon)}
                  </div>
                  <span className="text-sm font-bold text-neutral-700 mt-3 group-hover:text-brand-600 transition">
                    {getTranslatedCategoryName(cat.name)}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">{cat.count} {t('home.category_products_suffix')}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Common Pharmacy Brands Showcase */}
      <section className="py-12 bg-white border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-brand-600 text-xs font-bold uppercase tracking-wider">{t('home.brands_subtitle')}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
                {t('home.brands_title')}
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1"
            >
              {t('home.brands_view_all')}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {FEATURED_BRANDS.map((brand, idx) => (
              <button
                key={idx}
                onClick={() => router.push(`/products?brand=${encodeURIComponent(brand.name)}`)}
                className={`p-4 rounded-2xl border text-left transition hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between ${brand.color}`}
              >
                <div>
                  <div className="text-2xl mb-2">{brand.icon}</div>
                  <h3 className="font-extrabold text-sm leading-snug">{brand.name}</h3>
                  <p className="text-[10px] opacity-80 mt-0.5">{brand.origin}</p>
                </div>
                <span className="mt-3 inline-block text-[9px] font-bold uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded-full border border-black/5 self-start">
                  {brand.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Payment Options Section */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{t('home.payment_badge')}</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              {t('home.payment_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              {t('home.payment_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Telebirr */}
            <div className="bg-slate-800/80 border border-sky-500/30 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">📱</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">1-Click USSD</span>
                </div>
                <h3 className="text-base font-extrabold text-sky-300">{t('home.payment_telebirr_title')}</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {t('home.payment_telebirr_desc')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] font-mono text-sky-400">
                {t('home.payment_telebirr_code')}
              </div>
            </div>

            {/* CBE Birr */}
            <div className="bg-slate-800/80 border border-purple-500/30 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">🏦</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">CBE Gateway</span>
                </div>
                <h3 className="text-base font-extrabold text-purple-300">{t('home.payment_cbe_title')}</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {t('home.payment_cbe_desc')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] font-mono text-purple-400">
                {t('home.payment_cbe_code')}
              </div>
            </div>

            {/* Awash Bank */}
            <div className="bg-slate-800/80 border border-blue-500/30 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">💳</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">Awash Pay</span>
                </div>
                <h3 className="text-base font-extrabold text-blue-300">{t('home.payment_awash_title')}</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {t('home.payment_awash_desc')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] font-mono text-blue-400">
                {t('home.payment_awash_code')}
              </div>
            </div>

            {/* Cash on Pickup */}
            <div className="bg-slate-800/80 border border-emerald-500/30 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">💵</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">In-Branch</span>
                </div>
                <h3 className="text-base font-extrabold text-emerald-300">{t('home.payment_cash_title')}</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {t('home.payment_cash_desc')}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] font-mono text-emerald-400">
                {t('home.payment_cash_branches')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Promotional Health Services Cards */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              {t('home.services_title')}
            </h2>
            <p className="text-sm text-neutral-500 mt-2">
              {t('home.services_subtitle')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition hover:shadow-lg ${feat.color}`}
              >
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{feat.title}</h3>
                  <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
                <Link
                  href={feat.link}
                  className="mt-6 inline-flex justify-center items-center rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700 active:scale-95 transition"
                >
                  {feat.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6.5 Founder & Clinical Leadership Spotlight Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white via-slate-900 to-neutral-950 text-white relative overflow-hidden">
        {/* Background glow & subtle patterns */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="rounded-3xl bg-neutral-900/95 border border-emerald-500/25 shadow-2xl p-6 sm:p-10 lg:p-14 backdrop-blur-xl relative overflow-hidden">
            {/* Top decorative accent ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-brand-500" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Left Column: Image with layered glass styling, verification badge & status */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative group w-full max-w-sm sm:max-w-md">
                  {/* Glowing ambient ring */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 via-emerald-400 to-teal-400 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                  
                  {/* Photo Container */}
                  <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-neutral-800 border-2 border-emerald-400/30 shadow-2xl">
                    <Image
                      src="/dr-million-negasa.png"
                      alt="Dr. Million Negasa - Founder & Owner of Michu Pharmacy"
                      fill
                      className="object-cover object-top transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 400px"
                      priority
                    />
                    
                    {/* Dark gradient fade at bottom of image for readability of floating badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/20 to-neutral-950/30" />
                    
                    {/* Top Floating Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 bg-neutral-900/85 backdrop-blur-md text-emerald-300 border border-emerald-500/40 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {language === 'am' ? 'መስራች እና ባለቤት' : 'Founder & Owner'}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-brand-600/90 backdrop-blur-md text-white border border-brand-400/30 rounded-full px-3 py-1 text-[11px] font-bold shadow-md">
                        ✓ EFDA Licensed
                      </span>
                    </div>

                    {/* Bottom Floating Info Over Image */}
                    <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-neutral-950/85 backdrop-blur-md border border-white/10 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-medium text-emerald-300 uppercase tracking-wider">{language === 'am' ? 'የሚቹ ፋርማሲ ክሊኒካል መሪ' : 'Clinical Leadership'}</p>
                          <h4 className="text-base font-extrabold text-white">{language === 'am' ? 'ዶ/ር ሚሊዮን ነጋሳ' : 'Dr. Million Negasa'}</h4>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-black text-xs">
                          MPH
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Founder's Story, Vision, Core Commitments & CTA */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-3">
                    <span>✨</span>
                    <span>{language === 'am' ? 'የመስራቹ መልእክት እና ራዕይ' : "Founder's Vision & Clinical Leadership"}</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    {language === 'am' ? (
                      <>ጥራት ያለው የጤና አገልግሎት <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-teal-200">ለሁሉም ቤተሰብ</span></>
                    ) : (
                      <>Committed to Transforming <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-teal-200">Pharmacy Care</span> Across Ethiopia</>
                    )}
                  </h3>
                  <p className="text-sm font-semibold text-emerald-400 mt-1">
                    {language === 'am' ? 'ዶክተር ሚሊዮን ነጋሳ — የሚቹ ፋርማሲ መስራች እና ባለቤት' : 'Dr. Million Negasa — Founder, Owner & Managing Director'}
                  </p>
                </div>

                {/* Personal Vision Statement Quote */}
                <div className="relative pl-5 border-l-2 border-emerald-500/60 bg-white/5 rounded-r-2xl p-4 sm:p-5 backdrop-blur-sm">
                  <p className="text-sm sm:text-base text-neutral-200 italic leading-relaxed">
                    {language === 'am'
                      ? "«የሚቹ ፋርማሲ የተመሰረተው በኢትዮጵያ ውስጥ የሚገኝ ማንኛውም ዜጋ ትክክለኛ እና የተረጋገጠ መድኃኒት፣ ሙያዊ የፋርማሲስት ምክር እንዲሁም ፈጣን የዲጂታል ክፍያና ርክክብ በቀላሉ እንዲያገኝ ለማስቻል ነው። ጤናዎ ሁሌም ቀዳሚ ምርጫችን ነው!»"
                      : '"At Michu Pharmacy, our founding mission is to ensure every family in Ethiopia receives genuine, WHO-GMP certified medications, transparent pharmacist guidance, and modern digital healthcare convenience at all times."'}
                  </p>
                </div>

                {/* 3 Core Trust Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 hover:border-emerald-500/40 transition">
                    <div className="text-2xl mb-1.5">🛡️</div>
                    <h5 className="font-bold text-xs text-white">{language === 'am' ? '100% የተረጋገጠ ጥራት' : '100% EFDA Licensed'}</h5>
                    <p className="text-[11px] text-neutral-400 mt-1">{language === 'am' ? 'ከአስተማማኝ አምራቾች የቀረበ' : 'Genuine WHO-GMP medications'}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 hover:border-emerald-500/40 transition">
                    <div className="text-2xl mb-1.5">🏥</div>
                    <h5 className="font-bold text-xs text-white">{language === 'am' ? '8 አጠቃላይ ቅርንጫፎች' : '8 Physical Branches'}</h5>
                    <p className="text-[11px] text-neutral-400 mt-1">{language === 'am' ? 'አዲስ አበባ እና ክልሎች' : 'Addis Ababa & Regional centers'}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 hover:border-emerald-500/40 transition">
                    <div className="text-2xl mb-1.5">⚡</div>
                    <h5 className="font-bold text-xs text-white">{language === 'am' ? 'ዲጂታል ፈጣን አገልግሎት' : 'Instant Digital Care'}</h5>
                    <p className="text-[11px] text-neutral-400 mt-1">{language === 'am' ? 'በቴሌብርና ሲቢኢ ፈጣን ግዢ' : 'Prescription upload & Telebirr'}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex flex-wrap items-center gap-3.5">
                  <Link
                    href="/health?action=consult"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-600 hover:bg-brand-500 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-brand-900/50 hover:scale-105 active:scale-95 transition"
                  >
                    <span>👨‍⚕️</span>
                    <span>{language === 'am' ? 'የህክምና ምክክር ቀጠሮ ይያዙ' : 'Book Clinical Consultation'}</span>
                  </Link>
                  <Link
                    href="/health?action=upload"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400/40 px-6 py-3 text-xs font-bold text-emerald-200 hover:text-white transition hover:scale-105 active:scale-95"
                  >
                    <span>📸</span>
                    <span>{language === 'am' ? 'የሐኪም ማዘዣ ይላኩ' : 'Upload Prescription'}</span>
                  </Link>
                  <Link
                    href="/branches"
                    className="text-xs font-bold text-neutral-300 hover:text-white transition flex items-center gap-1.5 px-3 py-2"
                  >
                    <span>{language === 'am' ? 'ቅርንጫፎቻችንን ይጎብኙ →' : 'View All Branches →'}</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 7. Featured Best Sellers Grid */}
      <section className="py-16 bg-neutral-50 border-t border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-brand-600 text-xs font-bold uppercase tracking-wider">{t('home.featured_subtitle')}</span>
              <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
                {t('home.featured_title')}
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1 shrink-0"
            >
              {t('home.featured_view_all')}
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(liveProducts.length > 0
              ? liveProducts.slice(0, 4).map((p) => ({
                  id: String(p.id),
                  name: p.name,
                  price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
                  prescriptionRequired: p.prescriptionRequired ?? false,
                  imageUrl: p.imageUrl,
                  imageType: (p.name.toLowerCase().includes('syrup') ? 'syrup' : p.name.toLowerCase().includes('cream') || p.name.toLowerCase().includes('gloss') ? 'cosmetic' : p.name.toLowerCase().includes('spray') ? 'spray' : p.name.toLowerCase().includes('drop') ? 'drops' : 'tablet') as any,
                  desc: p.description || p.brand || 'Quality pharmacy approved medication',
                }))
              : featuredProducts
            ).map((prod) => (
              <div
                key={prod.id}
                className="group bg-white rounded-2xl border border-neutral-100 p-4 flex flex-col justify-between hover:shadow-xl transition duration-200"
              >
                <div>
                  {/* Image container */}
                  <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 relative bg-neutral-50">
                    {'imageUrl' in prod && prod.imageUrl ? (
                      <img
                        src={getImageUrl(prod.imageUrl) as string}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      renderProductIllustration(prod.imageType)
                    )}
                    {prod.prescriptionRequired && (
                      <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-red-200">
                        {t('home.rx_required')}
                      </span>
                    )}
                  </div>
                  {/* Category and Title */}
                  <h3 className="text-sm font-bold text-neutral-800 group-hover:text-brand-600 transition truncate">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {prod.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-medium">{t('home.featured_price')}</span>
                    <span className="text-base font-extrabold text-neutral-900">{prod.price} <span className="text-xs font-normal">ETB</span></span>
                  </div>
                  <button
                    onClick={() => {
                      addToCart({
                        id: prod.id,
                        name: prod.name,
                        price: prod.price,
                        prescriptionRequired: prod.prescriptionRequired,
                        imageType: prod.imageType,
                      });
                      triggerToast(`${prod.name.split('...')[0]} — ${t('home.toast_added')}`);
                    }}
                    className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 hover:scale-105 active:scale-95 transition shadow-sm"
                    aria-label="Add to cart"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Health Quote Banner with Dr. Million Negasa */}
      <section className="bg-gradient-to-r from-emerald-50 via-brand-50 to-teal-50 py-16 px-4 border-t border-emerald-100">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold text-brand-700 uppercase tracking-widest bg-brand-100/80 border border-brand-200 rounded-full px-4 py-1 inline-block mb-3">
            {t('home.quote_badge')}
          </p>
          <blockquote className="text-xl md:text-2xl font-semibold text-brand-950 italic max-w-3xl mx-auto leading-relaxed">
            {t('home.quote_text')}
          </blockquote>
          <div className="mt-6 flex justify-center items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-brand-600 shadow-md shrink-0">
              <Image
                src="/dr-million-negasa.png"
                alt="Dr. Million Negasa"
                fill
                className="object-cover object-top"
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-extrabold text-neutral-900">
                {language === 'am' ? 'ዶ/ር ሚሊዮን ነጋሳ' : 'Dr. Million Negasa'}
              </p>
              <p className="text-xs text-brand-700 font-semibold">
                {language === 'am' ? 'የሚቹ ፋርማሲ መስራች እና ባለቤት' : 'Founder & Owner, Michu Pharmacy'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
