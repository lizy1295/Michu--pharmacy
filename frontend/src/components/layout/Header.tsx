'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getAccessToken } from '@/lib/auth/tokens';

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'categories' | 'brands' | 'services' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check login status on mount
  useEffect(() => {
    setIsLoggedIn(!!getAccessToken());
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
    router.push(`/products?category=${encodeURIComponent(category === 'All Medicines' ? '' : category)}`);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleBrandSelect = (brand: string) => {
    router.push(`/products?brand=${encodeURIComponent(brand)}`);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full flex flex-col bg-white sticky top-0 z-50">
      {/* 1. Announcement Top Bar */}
      <div className="w-full bg-brand-700 text-white py-2.5 px-4 text-xs font-semibold overflow-hidden border-b border-brand-800">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>Free Blood pressure and weight measurement</span>
          </div>
          <span className="hidden md:inline text-brand-300">|</span>
          <div>Michu Pharmacy Looking After Your Health</div>
          <span className="hidden md:inline text-brand-300">|</span>
          <div className="text-red-200">We Don&apos;t Offer Delivery For Prescription Medication</div>
          <span className="hidden md:inline text-brand-300">|</span>
          <div className="bg-brand-600 px-2 py-0.5 rounded text-white text-[10px] uppercase font-bold tracking-wider">
            Get up to 15% OFF every order
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Header Bar */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-200 group-hover:scale-105 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-brand-900 leading-none">Michu Pharmacy</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide mt-0.5 uppercase">Looking After Your Health !</span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medications & products..."
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-5 pr-12 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 transition"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-brand-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* User & Cart */}
          <div className="flex items-center gap-3 shrink-0">
            {isLoggedIn ? (
              <Link
                href="/account"
                className="hidden md:flex items-center gap-1.5 rounded-full bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 transition shadow-sm"
              >
                Sign In
              </Link>
            )}

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition hidden md:flex"
              aria-label="Wishlist"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white px-1">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              aria-label="View Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white ring-2 ring-white px-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
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

      {/* 3. Sub-navigation menu */}
      <div className="bg-gray-50 border-b py-2.5 px-4 relative z-40 hidden md:block">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <nav className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'categories' ? null : 'categories')}
                className={`flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-brand-600 transition ${openDropdown === 'categories' ? 'text-brand-600 border-b-2 border-brand-600' : ''} pb-1`}
              >
                Shop by Categories
                <svg className={`w-4 h-4 transition ${openDropdown === 'categories' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'categories' && (
                <div className="absolute left-0 mt-3.5 w-56 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
                  {['All Medicines', 'Supplements', 'Cosmetics', 'Medical Devices', 'Personal Care'].map((cat) => (
                    <button key={cat} onClick={() => handleCategorySelect(cat)} className="w-full text-left rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 font-medium transition">
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'brands' ? null : 'brands')}
                className={`flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-brand-600 transition ${openDropdown === 'brands' ? 'text-brand-600 border-b-2 border-brand-600' : ''} pb-1`}
              >
                Shop by Brand
                <svg className={`w-4 h-4 transition ${openDropdown === 'brands' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'brands' && (
                <div className="absolute left-0 mt-3.5 w-56 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
                  {['Acyclovir Denk', 'Crest', 'Exedexe', 'Nicardia', 'Zoxan-D'].map((b) => (
                    <button key={b} onClick={() => handleBrandSelect(b)} className="w-full text-left rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 font-medium transition">
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'services' ? null : 'services')}
                className={`flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-brand-600 transition ${openDropdown === 'services' ? 'text-brand-600 border-b-2 border-brand-600' : ''} pb-1`}
              >
                Services
                <svg className={`w-4 h-4 transition ${openDropdown === 'services' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'services' && (
                <div className="absolute left-0 mt-3.5 w-64 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
                  <Link href="/health" onClick={() => { setOpenDropdown(null); setMobileMenuOpen(false); }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 font-medium transition">
                    <div className="p-1.5 rounded-lg bg-brand-100 text-brand-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg></div>
                    <div><p className="font-semibold leading-tight">Services List</p><p className="text-xs text-gray-500 mt-0.5">Explore our healthcare services</p></div>
                  </Link>
                  <Link href="/health?action=drug-info" onClick={() => { setOpenDropdown(null); setMobileMenuOpen(false); }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 font-medium transition">
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
                    <div><p className="font-semibold leading-tight">Drug Information</p><p className="text-xs text-gray-500 mt-0.5">Research medication safety details</p></div>
                  </Link>
                  <Link href="/health?action=consult" onClick={() => { setOpenDropdown(null); setMobileMenuOpen(false); }} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 font-medium transition">
                    <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                    <div><p className="font-semibold leading-tight">Get Consultation</p><p className="text-xs text-gray-500 mt-0.5">Connect online with a pharmacist</p></div>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/products" className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition pb-1">Shop</Link>
            <Link href="/blogs" className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition pb-1">Blogs</Link>
            <Link href="/branches" className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition pb-1">Branches</Link>
            <Link href="/faq" className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition pb-1">FAQ</Link>
          </nav>

          <Link href="/health?action=upload" className="rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 shadow-sm shadow-brand-100 transition duration-200">
            Upload a Prescription
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-bold text-brand-900">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 pl-10 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </form>
            </div>

            <div className="p-4 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                Home
              </Link>
              <Link href="/products" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Shop Products
              </Link>
              <Link href="/blogs" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9a2 2 0 00-2 2v1" /></svg>
                Health Blog
              </Link>
              <Link href="/health" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                Health Services
              </Link>
              <Link href="/branches" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Branches
              </Link>
              <Link href="/faq" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                FAQ
              </Link>
              <Link href="/track" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                Track Order
              </Link>
              <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                Wishlist
              </Link>

              <div className="border-t my-3"></div>

              {isLoggedIn ? (
                <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-brand-700 hover:bg-brand-50 transition" onClick={() => setMobileMenuOpen(false)}>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  My Account
                </Link>
              ) : (
                <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-brand-700 hover:bg-brand-50 transition" onClick={() => setMobileMenuOpen(false)}>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
