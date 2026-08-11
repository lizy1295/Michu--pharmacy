'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts, Product } from '@/lib/api/products';

interface BrandInfo {
  name: string;
  count: number;
  categories: string[];
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

        const list: BrandInfo[] = Array.from(brandMap.entries()).map(([name, info]) => ({
          name,
          count: info.count,
          categories: Array.from(info.categories),
        })).sort((a, b) => a.name.localeCompare(b.name));

        setBrands(list);
      } catch (err) {
        console.error('Failed to load brands:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-white/10">
              Trusted Pharmaceutical Brands
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Shop by Brand</h1>
            <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
              Explore authentic medicines, supplements, skincare, and medical supplies from top global pharmaceutical brands.
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
            placeholder="Search brands (e.g. Pfizer, GSK, Bayer, Solgar...)"
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
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse h-32"></div>
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <p className="text-lg font-bold text-slate-700">No brands found matching &quot;{search}&quot;</p>
            <p className="text-sm text-slate-400 mt-1">Try clearing your search or view all products.</p>
            <button onClick={() => setSearch('')} className="mt-4 px-5 py-2 rounded-full bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition">
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.name}
                href={`/products?brand=${encodeURIComponent(brand.name)}`}
                className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-extrabold text-lg group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200 mb-4 shadow-inner">
                    {brand.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {brand.categories.join(', ') || 'Pharmaceuticals'}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">{brand.count} {brand.count === 1 ? 'Product' : 'Products'}</span>
                  <span className="font-bold text-brand-600 group-hover:translate-x-1 transition-transform">
                    View Catalog &rarr;
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
