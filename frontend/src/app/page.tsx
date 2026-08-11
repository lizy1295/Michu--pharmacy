'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { getProducts, Product } from '@/lib/api/products';

export default function HomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };
  const [categories, setCategories] = useState<{ name: string; count: string; color: string; icon: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getProducts();
        const categoryMap = new Map<string, number>();
        data.forEach((p: Product) => {
          const cat = p.category || 'Other';
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });

        const colorMap: Record<string, string> = {
          'Medicine': 'bg-emerald-50 text-emerald-700 border-emerald-100',
          'Supplement': 'bg-blue-50 text-blue-700 border-blue-100',
          'Cosmetic': 'bg-purple-50 text-purple-700 border-purple-100',
          'Medical Devices': 'bg-amber-50 text-amber-700 border-amber-100',
          'Personal Care': 'bg-pink-50 text-pink-700 border-pink-100',
        };

        const iconMap: Record<string, string> = {
          'Medicine': 'pill',
          'Supplement': 'bottle',
          'Cosmetic': 'cream',
          'Medical Devices': 'device',
          'Personal Care': 'spray',
        };

        const dynamicCategories = Array.from(categoryMap.entries())
          .map(([name, count]) => ({
            name,
            count: `${count}+ Products`,
            color: colorMap[name] || 'bg-gray-50 text-gray-700 border-gray-100',
            icon: iconMap[name] || 'default',
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCategories(dynamicCategories);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const features = [
    {
      title: 'Prescription Upload',
      description: 'Upload your medical prescription. Our registered pharmacists will review and prepare it for you.',
      link: '/health?action=upload',
      buttonText: 'Upload Now',
      color: 'border-emerald-100 hover:border-emerald-300 bg-emerald-50/30'
    },
    {
      title: 'Tele-health consultation',
      description: 'Speak directly with our clinical pharmacists online for advice on dosage, side effects, and therapy.',
      link: '/health?action=consult',
      buttonText: 'Book Consult',
      color: 'border-brand-100 hover:border-brand-300 bg-brand-50/30'
    },
    {
      title: 'Yene Card Loyalty',
      description: 'Earn points on every purchase of supplements, cosmetics, and devices. Redeem points for discount vouchers.',
      link: '/account',
      buttonText: 'View Rewards',
      color: 'border-purple-100 hover:border-purple-300 bg-purple-50/30'
    }
  ];

  const featuredProducts = [
    {
      id: 'prod-exedexe',
      name: '(Exedexe) Dextromethorphan syrup...',
      price: 240,
      prescriptionRequired: false,
      imageType: 'syrup' as const,
      desc: 'Cough suppressant syrup for dry cough relief'
    },
    {
      id: 'prod-actrapid',
      name: 'Actrapid 100iu/ml 10ml/vial...',
      price: 1155,
      prescriptionRequired: true,
      imageType: 'tablet' as const,
      desc: 'Soluble human insulin injection'
    },
    {
      id: 'prod-acyclovir',
      name: 'Acyclovir Denk 200mg...',
      price: 460,
      prescriptionRequired: true,
      imageType: 'tablet' as const,
      desc: 'Antiviral formulation for herpes infections'
    },
    {
      id: 'prod-crest',
      name: '3D white charcoal whitening Tp...',
      price: 500,
      prescriptionRequired: false,
      imageType: 'cosmetic' as const,
      desc: 'Toothpaste for deep staining removal'
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

      {/* 1. Hero Landing Section */}
      <section className="relative overflow-hidden bg-gradient-to-tr from-brand-900 via-brand-800 to-emerald-950 text-white py-20 md:py-28 px-4">
        {/* Abstract background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
        {/* Floating circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative mx-auto max-w-7xl flex flex-col items-center text-center">
          <span className="bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
            🛡️ 100% Certified Medications
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl leading-tight">
            Your Health is Our Priority.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 to-emerald-200">
              Convenient Online Care
            </span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-brand-100 max-w-2xl leading-relaxed">
            Order prescription medications, find daily supplements, look after your skin with professional cosmetics, and consult clinical pharmacists from the comfort of your home.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="rounded-full bg-brand-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-brand-700 shadow-lg shadow-brand-700/20 transition-transform active:scale-95 duration-150"
            >
              Shop Medications
            </Link>
            <Link
              href="/health?action=upload"
              className="rounded-full border border-brand-500 bg-brand-900/50 hover:bg-brand-950 px-8 py-3.5 text-sm font-bold text-brand-200 hover:text-white transition active:scale-95 duration-150 backdrop-blur-sm"
            >
              Upload Prescription
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category Quick Links */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-extrabold text-neutral-800">
            Shop By Categories
          </h2>
          <p className="text-center text-sm text-neutral-500 mt-1 max-w-md mx-auto">
            Find the health, wellness, and beauty essentials you need instantly
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
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">{cat.count}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3. Stats / Trust Badges */}
      <section className="py-12 bg-white border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-neutral-100 bg-neutral-50 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-2xl font-extrabold text-neutral-900">3+</p>
              <p className="text-sm font-semibold text-neutral-600 mt-1">Years Experience</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-neutral-100 bg-neutral-50 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
              </div>
              <p className="text-2xl font-extrabold text-neutral-900">10,000+</p>
              <p className="text-sm font-semibold text-neutral-600 mt-1">Happy Customers</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-neutral-100 bg-neutral-50 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <p className="text-2xl font-extrabold text-neutral-900">24/7</p>
              <p className="text-sm font-semibold text-neutral-600 mt-1">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Promotional Health Services Cards */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              Looking After Your Health
            </h2>
            <p className="text-sm text-neutral-500 mt-2">
              Michu Pharmacy provides professional medical platform tools to simplify your healthcare needs.
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

      {/* 4. Featured Best Sellers Grid */}
      <section className="py-16 bg-neutral-50 border-t border-b">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-brand-600 text-xs font-bold uppercase tracking-wider">Top Selections</span>
              <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
                Featured Wellness Items
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1 shrink-0"
            >
              View Full Catalog
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                className="group bg-white rounded-2xl border border-neutral-100 p-4 flex flex-col justify-between hover:shadow-xl transition duration-200"
              >
                <div>
                  {/* Image container */}
                  <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 relative">
                    {renderProductIllustration(prod.imageType)}
                    {prod.prescriptionRequired && (
                      <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-red-200">
                        Rx Required
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
                    <span className="text-[10px] text-neutral-400 font-medium">Price</span>
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
                      triggerToast(`Added ${prod.name.split('...')[0]} to your cart!`);
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

      {/* 5. Health Quote Banner */}
      <section className="bg-brand-50 py-16 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold text-brand-600 uppercase tracking-widest">Michu Cares</p>
          <blockquote className="mt-4 text-xl md:text-2xl font-semibold text-brand-950 italic max-w-3xl mx-auto leading-relaxed">
            &quot;Your health is a investment, not an expense. We are dedicated to providing the advice, convenience, and safety you and your family deserve.&quot;
          </blockquote>
          <div className="mt-6 flex justify-center items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-extrabold">MP</div>
            <div className="text-left">
              <p className="text-sm font-bold text-neutral-800">Michu Pharmacy Board</p>
              <p className="text-xs text-neutral-500">Clinical Pharmaceutical Committee</p>
            </div>
          </div>
        </div>
      </section>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
