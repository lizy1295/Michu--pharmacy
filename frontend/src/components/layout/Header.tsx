'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage, LANGUAGES, Language } from '@/context/LanguageContext';
import { getAccessToken } from '@/lib/auth/tokens';
import { getProducts, Product } from '@/lib/api/products';

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartCount } = useCart();
  const { language, setLanguage, t, currentLanguageOption } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'categories' | 'brands' | 'services' | 'lang' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const data = await getProducts();
        const uniqueCategories = Array.from(new Set(data.map((p: Product) => p.category).filter(Boolean))) as string[];
        const uniqueBrands = Array.from(new Set(data.map((p: Product) => p.brand).filter(Boolean))) as string[];
        setCategories(uniqueCategories.sort());
        setBrands(uniqueBrands.sort());
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    fetchFilters();
  }, []);

  // Check customer login status on mount & on auth changes
  useEffect(() => {
    const checkAuth = () => {
      const customerToken = localStorage.getItem('michu_access_token');
      setIsLoggedIn(!!customerToken);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  // Sync search input with URL query param if any
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleCategorySelect = (category: string) => {
    router.push(`/products?category=${encodeURIComponent(category)}`);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleBrandSelect = (brand: string) => {
    router.push(`/products?brand=${encodeURIComponent(brand)}`);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full flex flex-col bg-pearl sticky top-0 z-50 shadow-sm shadow-moss-900/10">
      {/* 1. Announcement Top Bar — Tilled Earth bg, Wheat Field Sunrise text */}
      <div className="w-full bg-moss-900 text-pearl py-2 px-4 text-xs font-semibold overflow-hidden border-b border-moss-950">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gleam animate-ping"></span>
            <span>{t('nav.announcement')}</span>
          </div>
          <span className="hidden md:inline text-herb-500">|</span>
          <div>Michu Pharmacy · {t('nav.slogan')}</div>
          <span className="hidden md:inline text-herb-500">|</span>
          <div className="text-radiate-300">{t('nav.warning')}</div>
          <span className="hidden md:inline text-herb-500">|</span>
          <div className="bg-radiate px-2 py-0.5 rounded text-pearl text-[10px] uppercase font-bold tracking-wider">
            {t('nav.discount')}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Header Bar — Alabaster Hay bg */}
      <div className="border-b border-herb-200 bg-pearl shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-herb-500 flex items-center justify-center text-pearl shadow-md shadow-herb-200 group-hover:scale-105 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-moss-900 leading-none">Michu Pharmacy</span>
              <span className="text-[10px] text-herb-600 font-medium tracking-wide mt-0.5 uppercase">{t('nav.slogan')} !</span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.search_placeholder')}
                className="w-full rounded-full border border-herb-300 bg-pearl-100/80 py-2.5 pl-5 pr-12 text-sm text-moss-900 placeholder:text-herb-600/50 focus:border-herb-500 focus:bg-pearl focus:outline-none focus:ring-2 focus:ring-herb-200 transition"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-herb-500 hover:text-moss-900 transition"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* User, Language Selector & Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Quick Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'lang' ? null : 'lang')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-herb-300 hover:border-herb-500 bg-pearl-100/60 hover:bg-pearl text-xs font-bold text-moss-900 transition"
                aria-label="Language selector"
              >
                <span>{currentLanguageOption.flag}</span>
                <span className="hidden sm:inline uppercase text-[11px] tracking-wider">{currentLanguageOption.code}</span>
                <svg className="w-3 h-3 text-herb-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === 'lang' && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-pearl p-2 shadow-xl ring-1 ring-moss-900/10 z-50 animate-in fade-in slide-in-from-top-1 border border-herb-200">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-herb-600 uppercase tracking-wider border-b border-herb-100 mb-1 flex items-center justify-between">
                    <span>6 Languages</span>
                    <Link href="/account" onClick={() => setOpenDropdown(null)} className="text-herb-600 hover:text-moss-900 hover:underline">
                      Dashboard
                    </Link>
                  </div>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        language === l.code
                          ? 'bg-herb-100 text-moss-900 font-bold'
                          : 'text-moss-800 hover:bg-pearl-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.nativeName}</span>
                      </span>
                      {language === l.code && <span className="text-herb-600">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 1. Fast Payment Quick Access Button (Left of Cart) */}
            <Link
              href="/cart"
              className="hidden lg:flex items-center gap-2 rounded-full bg-emerald-50/90 hover:bg-emerald-100 text-emerald-950 border border-emerald-200/90 px-3.5 py-1.5 text-xs font-black transition shadow-2xs group"
              title="Telebirr & CBE Direct Payments Accepted"
            >
              <svg className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="3" strokeWidth="1.8" />
                <path strokeLinecap="round" strokeWidth="1.8" d="M2 10h20" />
                <circle cx="7" cy="15" r="1.5" fill="currentColor" />
              </svg>
              <span className="tracking-tight">{t('nav.payment').replace(/[💳]/g, '').trim()}</span>
            </Link>

            {/* 2. Cart Icon (Left of Profile) */}
            <Link
              href="/cart"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-pearl-200 hover:bg-pearl-300 text-moss-900 transition border border-herb-200 flex items-center justify-center group"
              aria-label="View Cart"
              title="View Cart"
            >
              <svg
                className="w-5 h-5 text-moss-900 group-hover:text-herb-600 transition shrink-0"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-radiate text-[10px] font-black text-white ring-2 ring-pearl px-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* 3. Profile Icon (At Most Right — Icon only, no words. Clicking opens My Account) */}
            <Link
              href={isLoggedIn ? "/account" : "/login"}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-pearl-200 hover:bg-pearl-300 text-moss-900 transition border border-herb-200 flex items-center justify-center group"
              title={isLoggedIn ? t('nav.my_account') : t('nav.sign_in')}
              aria-label={isLoggedIn ? t('nav.my_account') : t('nav.sign_in')}
            >
              <svg
                className="w-5 h-5 text-moss-900 group-hover:text-herb-600 transition shrink-0"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {isLoggedIn && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-pearl-200 text-moss-900 transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sub-navigation menu — slightly darker pearl with herb borders */}
      <div className="bg-pearl-200/70 border-b border-herb-200 py-2.5 px-4 relative z-40 hidden md:block">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <nav className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'categories' ? null : 'categories')}
                className={`flex items-center gap-1.5 text-sm font-semibold text-moss-800 hover:text-herb-600 transition ${openDropdown === 'categories' ? 'text-herb-600 border-b-2 border-herb-500' : ''} pb-1`}
              >
                {t('nav.categories')}
                <svg className={`w-4 h-4 transition ${openDropdown === 'categories' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'categories' && (
                <div className="absolute left-0 mt-3.5 w-64 rounded-2xl bg-pearl p-3 shadow-2xl ring-1 ring-moss-900/10 border border-herb-200 animate-in fade-in slide-in-from-top-1 max-h-96 overflow-y-auto">
                  <button onClick={() => handleCategorySelect('')} className="w-full text-left rounded-xl px-3.5 py-2 text-sm text-herb-700 font-bold bg-herb-50 hover:bg-herb-100 transition mb-1">
                    All Categories &amp; Products
                  </button>
                  <div className="my-1 border-t border-herb-100"></div>
                  {[
                    { name: 'Medicines', target: 'Medicine' },
                    { name: 'Vitamins & Supplements', target: 'Supplement' },
                    { name: 'Skin Care', target: 'Cosmetic' },
                    { name: 'Hair Care', target: 'Cosmetic' },
                    { name: 'Personal Care', target: 'Cosmetic' },
                    { name: 'Baby & Mother', target: 'Cosmetic' },
                    { name: 'Medical Devices', target: 'Medicine' },
                    { name: 'First Aid', target: 'Medicine' },
                    { name: 'Oral Care', target: 'Cosmetic' },
                    { name: 'Eye Care', target: 'Medicine' },
                    { name: 'Diabetes Care', target: 'Medicine' },
                    { name: "Women's Health", target: 'Supplement' },
                    { name: 'Health & Wellness', target: 'Supplement' },
                    { name: 'Special Offers', target: '' },
                  ].map((cat) => (
                    <button key={cat.name} onClick={() => handleCategorySelect(cat.target || cat.name)} className="w-full text-left rounded-xl px-3.5 py-2 text-sm text-moss-800 hover:bg-herb-50 hover:text-herb-700 font-medium transition flex items-center justify-between group">
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-herb-400 group-hover:text-herb-600 transition">&rarr;</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'brands' ? null : 'brands')}
                className={`flex items-center gap-1.5 text-sm font-semibold text-moss-800 hover:text-herb-600 transition ${openDropdown === 'brands' ? 'text-herb-600 border-b-2 border-herb-500' : ''} pb-1`}
              >
                {t('nav.brands')}
                <svg className={`w-4 h-4 transition ${openDropdown === 'brands' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'brands' && (
                <div className="absolute left-0 mt-3.5 w-64 rounded-2xl bg-pearl p-3 shadow-2xl ring-1 ring-moss-900/10 border border-herb-200 animate-in fade-in slide-in-from-top-1 max-h-96 overflow-y-auto">
                  <Link href="/brands" onClick={() => setOpenDropdown(null)} className="block w-full text-left rounded-xl px-3.5 py-2 text-sm text-herb-700 font-bold bg-herb-50 hover:bg-herb-100 transition mb-1">
                    Explore All Brands &rarr;
                  </Link>
                  <div className="my-1 border-t border-herb-100"></div>
                  {brands.map((b) => (
                    <button key={b} onClick={() => handleBrandSelect(b)} className="w-full text-left rounded-xl px-3.5 py-2 text-sm text-moss-800 hover:bg-herb-50 hover:text-herb-700 font-medium transition">
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'services' ? null : 'services')}
                className={`flex items-center gap-1.5 text-sm font-semibold text-moss-800 hover:text-herb-600 transition ${openDropdown === 'services' ? 'text-herb-600 border-b-2 border-herb-500' : ''} pb-1`}
              >
                {t('nav.services')}
                <svg className={`w-4 h-4 transition ${openDropdown === 'services' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'services' && (
                <div className="absolute left-0 mt-3.5 w-64 rounded-xl bg-pearl p-2 shadow-xl ring-1 ring-moss-900/10 border border-herb-200 animate-in fade-in slide-in-from-top-1">
                  <Link href="/symptoms" onClick={() => { setOpenDropdown(null); setMobileMenuOpen(false); }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-moss-800 hover:bg-herb-50 hover:text-herb-700 font-medium transition">
                    <div className="p-1.5 rounded-lg bg-herb-100 text-herb-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
                    <div><p className="font-semibold leading-tight">Symptom Checker &amp; Info</p><p className="text-xs text-herb-600/70 mt-0.5">Explore chronic conditions &amp; triage</p></div>
                  </Link>
                  <Link href="/health" onClick={() => { setOpenDropdown(null); setMobileMenuOpen(false); }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-moss-800 hover:bg-herb-50 hover:text-herb-700 font-medium transition">
                    <div className="p-1.5 rounded-lg bg-herb-100 text-herb-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg></div>
                    <div><p className="font-semibold leading-tight">Services List</p><p className="text-xs text-herb-600/70 mt-0.5">Explore our healthcare services</p></div>
                  </Link>
                  <Link href="/health?action=drug-info" onClick={() => { setOpenDropdown(null); setMobileMenuOpen(false); }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-moss-800 hover:bg-herb-50 hover:text-herb-700 font-medium transition">
                    <div className="p-1.5 rounded-lg bg-gleam/30 text-moss-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
                    <div><p className="font-semibold leading-tight">Drug Information</p><p className="text-xs text-herb-600/70 mt-0.5">Research medication safety details</p></div>
                  </Link>
                  <Link href="/health?action=consult" onClick={() => { setOpenDropdown(null); setMobileMenuOpen(false); }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-moss-800 hover:bg-herb-50 hover:text-herb-700 font-medium transition">
                    <div className="p-1.5 rounded-lg bg-radiate/20 text-radiate-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                    <div><p className="font-semibold leading-tight">Get Consultation</p><p className="text-xs text-herb-600/70 mt-0.5">Connect online with a pharmacist</p></div>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/blogs" className="text-sm font-semibold text-moss-800 hover:text-herb-600 transition pb-1">{t('nav.blogs')}</Link>
            <Link href="/branches" className="text-sm font-semibold text-moss-800 hover:text-herb-600 transition pb-1">{t('nav.branches')}</Link>
            <Link href="/about" className="text-sm font-semibold text-moss-800 hover:text-herb-600 transition pb-1">{language === 'am' ? 'ስለ እኛ' : 'About Us'}</Link>
            <Link href="/faq" className="text-sm font-semibold text-moss-800 hover:text-herb-600 transition pb-1">{t('nav.faq')}</Link>
          </nav>

          <Link href="/health?action=upload" className="rounded-full bg-radiate px-5 py-2 text-sm font-bold text-pearl hover:bg-radiate-600 shadow-sm shadow-radiate/30 transition duration-200">
            {t('nav.upload_prescription')}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-moss-950/60 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-pearl shadow-2xl overflow-y-auto animate-in slide-in-from-right border-l border-herb-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-herb-200 flex items-center justify-between bg-pearl-200/60">
              <span className="text-lg font-bold text-moss-900">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-pearl-300 text-moss-900 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-herb-200">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('nav.search_placeholder')}
                    className="w-full rounded-xl border border-herb-300 bg-pearl-100 px-4 py-2.5 pl-10 text-sm text-moss-900 placeholder:text-herb-500/60 focus:border-herb-500 focus:ring-1 focus:ring-herb-400 focus:outline-none"
                  />
                  <svg className="w-4 h-4 text-herb-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </form>
            </div>

            {/* Mobile Language Selector */}
            <div className="p-4 border-b border-herb-200">
              <p className="text-xs font-bold text-herb-600 uppercase tracking-wider mb-2">Language / ቋንቋ</p>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border ${
                      language === l.code
                        ? 'border-herb-500 bg-herb-50 text-moss-900 font-bold'
                        : 'border-herb-200 text-moss-800 hover:bg-pearl-200'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span className="truncate">{l.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-moss-800 hover:bg-herb-50 hover:text-herb-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-herb-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                {t('nav.home')}
              </Link>
              <Link href="/blogs" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-moss-800 hover:bg-herb-50 hover:text-herb-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-herb-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9a2 2 0 00-2 2v1" /></svg>
                {t('nav.blogs')}
              </Link>
              <Link href="/symptoms" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-herb-700 bg-herb-50/60 hover:bg-herb-50 hover:text-moss-900 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-herb-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Symptom Checker &amp; Info
              </Link>
              <Link href="/health" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-moss-800 hover:bg-herb-50 hover:text-herb-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-herb-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                {t('nav.services')}
              </Link>
              <Link href="/branches" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-moss-800 hover:bg-herb-50 hover:text-herb-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-herb-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {t('nav.branches')}
              </Link>
              <Link href="/about" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-moss-800 hover:bg-herb-50 hover:text-herb-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-herb-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {language === 'am' ? 'ስለ እኛ' : 'About Us'}
              </Link>
              <Link href="/faq" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-moss-800 hover:bg-herb-50 hover:text-herb-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-herb-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t('nav.faq')}
              </Link>

              <div className="border-t border-herb-200 my-3"></div>

              {isLoggedIn ? (
                <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-herb-700 hover:bg-herb-50 transition" onClick={() => setMobileMenuOpen(false)}>
                  <svg className="w-5 h-5 text-herb-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {t('nav.my_account')}
                </Link>
              ) : (
                <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-radiate-700 hover:bg-radiate/10 transition" onClick={() => setMobileMenuOpen(false)}>
                  <svg className="w-5 h-5 text-radiate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  {t('nav.sign_in')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
