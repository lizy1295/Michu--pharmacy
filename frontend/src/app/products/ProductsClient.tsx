'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getProducts, Product } from '@/lib/api/products';

const FALLBACK_PRODUCTS = [
  { id: 'p1', name: '(Exedexe) Dextromethorphan syrup 120ml', price: 240, prescriptionRequired: false, imageType: 'syrup', brand: 'Exedexe', category: 'Medicines', branches: ['Adama Branch', 'Ayat Branch', 'Hawassa Branch'] },
  { id: 'p2', name: '(Nicardia retard 20) Nifedipine 20mg of 100', price: 25, prescriptionRequired: true, imageType: 'tablet', brand: 'Nicardia', category: 'Medicines', branches: ['Bethel Branch', 'Jemo Branch', 'Adama Branch'] },
  { id: 'p3', name: '(Zoxan-D) Ciprofloxacin 0.3% + Dexamethason 5ml', price: 290, prescriptionRequired: true, imageType: 'drops', brand: 'Zoxan-D', category: 'Medicines', branches: ['Figa Branch', 'Hawassa Branch', 'Ayat Branch'] },
  { id: 'p4', name: '3D white charcoal whitening Tp of 204g', price: 500, prescriptionRequired: false, imageType: 'cosmetic', brand: 'Crest', category: 'Cosmetics', branches: ['Ayat Branch', 'Hawassa Branch', 'Jemo Branch'] },
  { id: 'p5', name: 'Absolute Lip Gloss Clear Glow', price: 73.91, prescriptionRequired: false, imageType: 'cosmetic', brand: 'Other', category: 'Cosmetics', branches: ['Jemo Branch', 'Dire Dawa Branch', 'Figa Branch'] },
  { id: 'p6', name: 'Acetazolamide 250mg of 10*10 tablet', price: 225, prescriptionRequired: true, imageType: 'tablet', brand: 'Other', category: 'Medicines', branches: ['Adama Branch', 'Bethel Branch', 'Dire Dawa Branch'] },
  { id: 'p7', name: 'Actrapid 100iu/ml 10ml/vial soluble insulin', price: 1155, prescriptionRequired: true, imageType: 'tablet', brand: 'Other', category: 'Medicines', branches: ['Dire Dawa Branch', 'Ayat Branch', 'Jemo Branch'] },
  { id: 'p8', name: 'Acyclovir Denk 200mg of 5*10 tabletten', price: 460, prescriptionRequired: true, imageType: 'tablet', brand: 'Acyclovir Denk', category: 'Medicines', branches: ['Hawassa Branch', 'Jemo Branch', 'Bethel Branch'] },
  { id: 'p9', name: 'Michu Daily Multi-Vitamin Capsules', price: 350, prescriptionRequired: false, imageType: 'tablet', brand: 'Other', category: 'Supplements', branches: ['All Branches', 'Ayat Branch', 'Adama Branch'] },
  { id: 'p10', name: 'Sterile Nebulizer Compressor Device', price: 2450, prescriptionRequired: false, imageType: 'device', brand: 'Other', category: 'Medical Devices', branches: ['Adama Branch', 'Bethel Branch', 'Jemo Branch'] },
  { id: 'p11', name: 'Anti-Bacterial Hand Spray 100ml', price: 95, prescriptionRequired: false, imageType: 'spray', brand: 'Other', category: 'Personal Care', branches: ['All Branches', 'Figa Branch', 'Dire Dawa Branch'] },
];

interface ProductsClientProps {
  currentId?: string;
  category?: string;
}

export default function ProductsClient({ currentId, category }: ProductsClientProps) {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Using local data.');
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const related = products
    .filter((p) => p.id !== currentId && (!category || p.category === category))
    .slice(0, 4);

  const renderProductIllustration = (type: string) => {
    const baseColor = 'flex items-center justify-center rounded-2xl w-full h-full relative';
    switch (type) {
      case 'syrup':
        return <div className={`${baseColor} bg-emerald-50 text-emerald-600`}><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2h-1M5 11V9a2 2 0 012-2h1m5-4h2a1 1 0 011 1v2H11V4a1 1 0 011-1z" /></svg></div>;
      case 'tablet':
        return <div className={`${baseColor} bg-blue-50 text-blue-600`}><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 22a10 10 0 100-20 10 10 0 000 20zm0-10h.01M8 12h.01M16 12h.01M12 8h.01M12 16h.01" /></svg></div>;
      case 'drops':
        return <div className={`${baseColor} bg-teal-50 text-teal-600`}><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158A6 6 0 018 16" /></svg></div>;
      case 'cosmetic':
        return <div className={`${baseColor} bg-purple-50 text-purple-600`}><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zM12 5V2m-3 3v4a3 3 0 006 0V5" /></svg></div>;
      case 'device':
        return <div className={`${baseColor} bg-amber-50 text-amber-600`}><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 3v2m6-2v2M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg></div>;
      case 'spray':
        return <div className={`${baseColor} bg-pink-50 text-pink-600`}><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2h-1M5 11V9a2 2 0 012-2h1m5-4h2a1 1 0 011 1v2H11V4a1 1 0 011-1z" /></svg></div>;
      default:
        return <div className={`${baseColor} bg-gray-50 text-gray-400`}><svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>;
    }
  };

  if (related.length === 0) {
    return (
      <p className="text-sm text-gray-500">No related products found. Browse our <Link href="/products" className="text-brand-600 font-bold hover:underline">full catalog</Link>.</p>
    );
  }

  return (
    <>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white rounded-xl shadow-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 border border-neutral-800 animate-in fade-in duration-200">
          <svg className="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
          {toastMessage}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((prod) => {
          const fav = isInWishlist(prod.id);
          return (
            <Link
              key={prod.id}
              href={`/products/${prod.id}`}
              className="group bg-white rounded-2xl border border-neutral-100 p-4 flex flex-col justify-between hover:shadow-xl transition duration-200"
            >
              <div>
                <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 relative shadow-inner bg-neutral-50">
                  {renderProductIllustration(prod.imageType)}
                  {prod.prescriptionRequired && (
                    <span className="absolute top-2 left-2 bg-red-50 text-red-600 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-red-200 shadow-sm">
                      Rx Required
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-neutral-800 group-hover:text-brand-600 transition line-clamp-1">{prod.name}</h3>
                <p className="text-[11px] text-brand-600 font-semibold mt-0.5 uppercase tracking-wide">{prod.brand}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase">Price</span>
                  <span className="text-base font-extrabold text-neutral-900">{prod.price} <span className="text-xs font-normal">ETB</span></span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (fav) {
                        removeFromWishlist(prod.id);
                        triggerToast('Removed from wishlist');
                      } else {
                        addToWishlist({ id: prod.id, name: prod.name, price: prod.price, prescriptionRequired: prod.prescriptionRequired, imageType: prod.imageType, brand: prod.brand, category: prod.category });
                        triggerToast('Added to wishlist!');
                      }
                    }}
                    className={`p-2 rounded-xl border transition active:scale-95 ${
                      fav ? 'bg-red-50 text-red-500 border-red-100' : 'text-neutral-400 hover:text-red-500 border-gray-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart({ id: prod.id, name: prod.name, price: prod.price, prescriptionRequired: prod.prescriptionRequired, imageType: prod.imageType });
                      triggerToast(`Added ${prod.name.split(' ')[0]} to cart!`);
                    }}
                    className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 hover:scale-105 active:scale-95 transition shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
