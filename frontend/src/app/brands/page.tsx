'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts, Product } from '@/lib/api/products';
import { useLanguage } from '@/context/LanguageContext';

interface BrandInfo {
  name: string;
  origin?: string;
  count: number;
  categories: string[];
}

const DEFAULT_POPULAR_BRANDS: BrandInfo[] = [
  { name: 'EPHARM (Ethiopian Pharm. Mfg.)', origin: 'Ethiopia (National)', count: 42, categories: ['Medicine', 'First Aid', 'Antibiotics'] },
  { name: 'Cadila Pharmaceuticals Ethiopia', origin: 'Ethiopia / India', count: 35, categories: ['Medicine', 'Cardiovascular', 'Pain Relief'] },
  { name: 'Julphar Pharmaceuticals', origin: 'Julphar Ethiopia', count: 28, categories: ['Medicine', 'Syrups', 'Injections'] },
  { name: 'Addis Pharmaceuticals Factory (APF)', origin: 'APF Adigrat / Addis', count: 31, categories: ['Medicine', 'Generics', 'Pediatrics'] },
  { name: 'Novartis', origin: 'Switzerland', count: 24, categories: ['Medicine', 'Eye Care', 'Chronic Care'] },
  { name: 'Sanofi', origin: 'France', count: 22, categories: ['Medicine', 'Diabetes', 'Vaccines'] },
  { name: 'GSK (GlaxoSmithKline)', origin: 'United Kingdom', count: 26, categories: ['Medicine', 'Consumer Health', 'OTC'] },
  { name: 'Pfizer', origin: 'United States', count: 19, categories: ['Medicine', 'Anti-Infective', 'Cardio'] },
  { name: 'AstraZeneca', origin: 'UK / Sweden', count: 18, categories: ['Medicine', 'Respiratory', 'Oncology'] },
  { name: 'Denk Pharma Germany', origin: 'Germany', count: 29, categories: ['Medicine', 'Vitamins', 'Pain Management'] },
  { name: 'DKT Ethiopia', origin: 'Ethiopia', count: 16, categories: ['Family Health', 'Reproductive Care'] },
  { name: 'Cipla', origin: 'India', count: 25, categories: ['Medicine', 'Inhalers', 'Anti-Asthma'] },
  { name: 'Medreich', origin: 'Global', count: 14, categories: ['Medicine', 'Antibiotics'] },
  { name: 'Bayer', origin: 'Germany', count: 20, categories: ['Medicine', 'Aspirin', 'Women\'s Health'] },
  { name: 'CeraVe', origin: 'United States / France', count: 17, categories: ['Cosmetic', 'Dermatology', 'Cleanser'] },
  { name: 'Neutrogena', origin: 'United States', count: 15, categories: ['Cosmetic', 'Sun Protection', 'Hydro Boost'] },
  { name: 'Gedeon Richter', origin: 'Hungary', count: 12, categories: ['Medicine', 'Women\'s Health'] },
  { name: 'Michu Health Essentials', origin: 'Michu Pharmacy', count: 48, categories: ['Supplement', 'Personal Care', 'Devices'] },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandInfo[]>(DEFAULT_POPULAR_BRANDS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        const brandMap = new Map<string, { count: number; categories: Set<string> }>();

        data.forEach((p: Product) => {
          if (!p.brand) return;
          const existing = brandMap.get(p.brand) || { count: 0, categories: new Set<string>() };
          existing.count += 1;
          if (p.category) existing.categories.add(p.category);
          brandMap.set(p.brand, existing);
        });

        // Merge backend dynamic brands with top Ethiopian & international brands
        const dynamicList: BrandInfo[] = Array.from(brandMap.entries()).map(([name, info]) => ({
          name,
          count: info.count,
          categories: Array.from(info.categories),
        }));

        const existingNames = new Set(dynamicList.map((b) => b.name.toLowerCase()));
        const combined = [
          ...dynamicList,
          ...DEFAULT_POPULAR_BRANDS.filter((b) => !existingNames.has(b.name.toLowerCase())),
        ].sort((a, b) => a.name.localeCompare(b.name));

        setBrands(combined);
      } catch (err) {
        console.error('Failed to load dynamic brands:', err);
        setBrands(DEFAULT_POPULAR_BRANDS);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.categories.some((c) => c.toLowerCase().includes(search.toLowerCase())) ||
    (b.origin && b.origin.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-white/10 text-xs font-extrabold uppercase tracking-wider text-emerald-300 border border-white/15">
              🇪🇹 Ethiopian & Global Pharmaceutical Manufacturers
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {t('brands.title')}
            </h1>
            <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
              {t('brands.subtitle')}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 max-w-xl mx-auto flex items-center gap-3">
          <svg className="w-5 h-5 text-slate-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('branches.search_placeholder')}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600 mr-2 font-bold">
              Clear
            </button>
          )}
        </div>

        {/* Brands Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse h-36"></div>
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <p className="text-lg font-bold text-slate-700">No brands found matching &quot;{search}&quot;</p>
            <p className="text-sm text-slate-400 mt-1">Try clearing your search query or view all products.</p>
            <button onClick={() => setSearch('')} className="mt-4 px-5 py-2 rounded-full bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition">
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.name}
                href={`/products?brand=${encodeURIComponent(brand.name)}`}
                className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-extrabold text-lg group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200 shadow-inner">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                    {brand.origin && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {brand.origin}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors leading-snug">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium line-clamp-1">
                    {brand.categories.join(', ') || 'Pharmaceuticals'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">{brand.count} {brand.count === 1 ? 'Item' : 'Items'}</span>
                  <span className="font-bold text-brand-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Products</span>
                    <span>&rarr;</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
