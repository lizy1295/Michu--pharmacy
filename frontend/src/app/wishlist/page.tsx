'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

const renderProductImage = (type?: string) => {
  switch (type) {
    case 'syrup':
      return <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2h-1M5 11V9a2 2 0 012-2h1m5-4h2a1 1 0 011 1v2H11V4a1 1 0 011-1z" /></svg></div>;
    case 'tablet':
      return <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 22a10 10 0 100-20 10 10 0 000 20z" /></svg></div>;
    case 'cosmetic':
      return <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zM12 5V2m-3 3v4a3 3 0 006 0V5" /></svg></div>;
    default:
      return <div className="w-12 h-12 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center shrink-0"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4" /></svg></div>;
  }
};

export default function WishlistPage() {
  const { t } = useLanguage();
  const { wishlistItems, removeFromWishlist, clearWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMoveToCart = (item: typeof wishlistItems[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      prescriptionRequired: item.prescriptionRequired,
      imageType: item.imageType,
    });
    removeFromWishlist(item.id);
    triggerToast(`${t('wishlist.move_to_cart')}: ${item.name.split(' ')[0]}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white rounded-xl shadow-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 border border-neutral-800 animate-in fade-in duration-200">
          <svg className="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
          {toastMessage}
        </div>
      )}

      <nav className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-6">
        <Link href="/" className="hover:text-brand-600 transition">{t('nav.home')}</Link>
        <span>&gt;</span>
        <span className="text-brand-700">{t('wishlist.title')}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">{t('wishlist.title')}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {wishlistCount > 0
              ? `${wishlistCount} ${t('wishlist.items')}`
              : t('wishlist.empty_desc')}
          </p>
        </div>
        {wishlistCount > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs font-bold text-red-600 hover:text-red-800 transition"
          >
            {t('ui.close')}
          </button>
        )}
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white border rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition duration-200 group">
              <div className="flex gap-4">
                {renderProductImage(item.imageType)}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-neutral-800 group-hover:text-brand-600 transition line-clamp-2">{item.name}</h3>
                  <p className="text-[11px] text-brand-600 font-semibold mt-0.5 uppercase tracking-wide">{item.brand}</p>
                  <span className="text-xs text-gray-400">{item.category}</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-extrabold text-neutral-900">{item.price.toFixed(2)} <span className="text-xs font-normal">ETB</span></span>
                    {item.prescriptionRequired && (
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 uppercase">Rx</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center gap-2">
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 text-xs transition shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  {t('wishlist.move_to_cart')}
                </button>
                <button
                  onClick={() => {
                    removeFromWishlist(item.id);
                    triggerToast(t('products.removed_wishlist'));
                  }}
                  className="p-2 rounded-xl border border-gray-300 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
                  aria-label="Remove"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-gray-50/50">
          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          <h2 className="text-xl font-bold text-gray-800 mt-4">{t('wishlist.empty_title')}</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">{t('wishlist.empty_desc')}</p>
          <Link href="/products" className="mt-6 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 text-xs transition">
            {t('wishlist.browse')}
          </Link>
        </div>
      )}
    </div>
  );
}
