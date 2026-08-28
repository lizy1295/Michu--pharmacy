'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductsClient from '../ProductsClient';
import { getProductById, Product, getImageUrl } from '@/lib/api/products';
import { useLanguage } from '@/context/LanguageContext';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const getProductImageType = (name: string, category: string | null): string => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('syrup')) return 'syrup';
  if (nameLower.includes('tablet') || nameLower.includes('pill') || nameLower.includes('capsule') || nameLower.includes('tabletten')) return 'tablet';
  if (nameLower.includes('drop')) return 'drops';
  if (nameLower.includes('cream') || nameLower.includes('gel') || nameLower.includes('lotion') || nameLower.includes('balm') || nameLower.includes('gloss')) return 'cosmetic';
  if (nameLower.includes('spray')) return 'spray';
  if (nameLower.includes('device') || nameLower.includes('compressor') || nameLower.includes('nebulizer') || nameLower.includes('inhaler')) return 'device';

  const catLower = (category ?? '').toLowerCase();
  if (catLower.includes('medicine')) return 'tablet';
  if (catLower.includes('cosmetic')) return 'cosmetic';
  if (catLower.includes('device')) return 'device';
  if (catLower.includes('personal')) return 'spray';
  if (catLower.includes('supplement')) return 'tablet';

  return 'generic';
};

const getProductBranches = (id: number): string[] => {
  const branches = [];
  if (id % 2 === 0) branches.push('Ayat Branch');
  if (id % 3 === 0) branches.push('Adama Branch');
  if (id % 5 === 0) branches.push('Hawassa Branch');
  if (id % 7 === 0) branches.push('Bethel Branch');
  if (id % 11 === 0) branches.push('Dire Dawa Branch');
  if (branches.length === 0) {
    branches.push('All Branches');
  }
  return branches;
};

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { t } = useLanguage();
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(Number(resolvedParams.id));
        setProduct(data);
      } catch (err: any) {
        console.error('Failed to load product:', err);
        setError(err.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-neutral-500 animate-pulse">{t('ui.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-extrabold text-gray-800">{t('product.not_found')}</h1>
        <p className="text-sm text-gray-500 mt-2">{error || t('product.not_found_desc')}</p>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 text-sm transition">
          {t('product.back_to_products')}
        </Link>
      </div>
    );
  }

  const priceNum = parseFloat(String(product.price)) || 0;
  const productBranches = getProductBranches(product.id);

  const getFullDescription = () => {
    let desc = product.description || 'No description available for this product.';
    if (product.attributes && typeof product.attributes === 'object') {
      const extra = Object.entries(product.attributes)
        .map(([key, val]) => `${key.replace(/_/g, ' ').toUpperCase()}: ${val}`)
        .join(', ');
      if (extra) {
        desc += `\n\nProduct Attributes: ${extra}.`;
      }
    }
    return desc;
  };

  const getDosage = () => {
    if (product.attributes && typeof product.attributes === 'object' && product.attributes.dosage_form) {
      return `This is a ${product.attributes.dosage_form} formulation. Typical dosage should be taken in accordance with package guidelines or as prescribed by your practitioner.`;
    }
    return 'For instructions on dosage and route of administration, please refer to the product leaflet or speak with a certified clinical pharmacist.';
  };

  const getSideEffects = () => {
    return 'Generally well-tolerated. Discontinue use and seek professional medical guidance if you experience any unexpected allergic reactions or irritation.';
  };

  const getStorage = () => {
    return 'Store in a cool, dry place away from direct sunlight. Keep out of reach of children.';
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: String(product.id),
        name: product.name,
        price: priceNum,
        prescriptionRequired: product.prescriptionRequired,
        imageType: getProductImageType(product.name, product.category) as any,
      });
    }
    triggerToast(`${quantity}x ${product.name.split(' ').slice(0, 3).join(' ')} — ${t('products.added_cart')}`);
    setQuantity(1);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(String(product.id))) {
      removeFromWishlist(String(product.id));
      triggerToast(t('products.removed_wishlist'));
    } else {
      addToWishlist({
        id: String(product.id),
        name: product.name,
        price: priceNum,
        prescriptionRequired: product.prescriptionRequired,
        imageType: getProductImageType(product.name, product.category) as any,
        brand: product.brand || 'Other',
        category: product.category || 'Medicine',
      });
      triggerToast(t('products.added_wishlist'));
    }
  };

  const renderProductImage = (type: string) => {
    const fullImgUrl = getImageUrl(product.imageUrl);
    if (fullImgUrl) {
      return (
        <img
          src={fullImgUrl}
          alt={product.name}
          className="w-full h-full object-cover rounded-2xl"
        />
      );
    }
    switch (type) {
      case 'syrup':
        return <div className="w-full h-full bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2h-1M5 11V9a2 2 0 012-2h1m5-4h2a1 1 0 011 1v2H11V4a1 1 0 011-1z" /></svg></div>;
      case 'tablet':
        return <div className="w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 22a10 10 0 100-20 10 10 0 000 20zm0-10h.01M8 12h.01M16 12h.01M12 8h.01M12 16h.01" /></svg></div>;
      case 'drops':
        return <div className="w-full h-full bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600"><svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158A6 6 0 018 16" /></svg></div>;
      case 'cosmetic':
        return <div className="w-full h-full bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 002 2v12a2 2 0 002 2zM12 5V2m-3 3v4a3 3 0 006 0V5" /></svg></div>;
      case 'device':
        return <div className="w-full h-full bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 3v2m6-2v2M9 19v-6a2 2 0 00-2-2H5a2 2 0 002 2v6a2 2 0 002 2h2a2 2 0 012-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg></div>;
      case 'spray':
        return <div className="w-full h-full bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600"><svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2h-1M5 11V9a2 2 0 012-2h1m5-4h2a1 1 0 011 1v2H11V4a1 1 0 011-1z" /></svg></div>;
      default:
        return <div className="w-full h-full bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>;
    }
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
        <Link href="/" className="hover:text-brand-600 transition">{t('product.home')}</Link>
        <span>&gt;</span>
        <Link href="/products" className="hover:text-brand-600 transition">{t('product.back_to_shop')}</Link>
        <span>&gt;</span>
        <span className="text-brand-700">{product.name.split(' ').slice(0, 3).join(' ')}...</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square rounded-3xl overflow-hidden shadow-lg bg-gray-50 relative">
          {renderProductImage(getProductImageType(product.name, product.category))}
          {product.prescriptionRequired && (
            <span className="absolute top-4 left-4 bg-red-50 text-red-600 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-red-200 shadow-sm z-10">{t('cart.rx_required')}</span>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{product.brand || 'Other'}</span>
            <h1 className="text-3xl font-extrabold text-neutral-900 mt-1 leading-tight">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-neutral-900">{priceNum.toFixed(2)}</span>
            <span className="text-lg font-semibold text-gray-500 mb-1">ETB</span>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full mb-1.5 uppercase">{product.category || 'Medicine'}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-gray-100 font-bold transition text-gray-500 text-lg">&minus;</button>
              <span className="px-5 text-base font-bold text-gray-700">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-gray-100 font-bold transition text-gray-500 text-lg">&#43;</button>
            </div>
            <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 text-sm active:scale-95 transition shadow-md shadow-brand-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {t('product.add_to_cart')}
            </button>
            <button onClick={handleWishlistToggle} className={`p-3.5 rounded-xl border transition active:scale-95 ${isInWishlist(String(product.id)) ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' : 'text-neutral-400 hover:text-red-500 hover:bg-neutral-50 border-gray-300'}`} aria-label="Add to wishlist">
              <svg className="w-6 h-6" fill={isInWishlist(String(product.id)) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
          </div>

          {product.prescriptionRequired && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs font-medium flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div><p className="font-bold">{t('product.rx_required_title')}</p><p className="mt-0.5">{t('product.rx_required_desc')}</p></div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('product.available_branches')}</h3>
            <div className="flex flex-wrap gap-2">
              {productBranches.map((branch) => (<span key={branch} className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full">{branch}</span>))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-sm font-bold text-neutral-800">{t('product.details_tab')}</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{getFullDescription()}</p>
          </div>
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-sm font-bold text-neutral-800">{t('product.dosage_tab')}</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{getDosage()}</p>
          </div>
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-sm font-bold text-neutral-800">{t('product.safety_tab')}</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{`${getSideEffects()}\n\n${getStorage()}`}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight mb-6">{t('product.reviews_title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Abebe K.', rating: 5, comment: 'Excellent product! Fast delivery and well packaged.', date: 'July 8, 2026' },
            { name: 'Sara M.', rating: 5, comment: 'Very effective. The pharmacist at Ayat branch gave great advice.', date: 'July 3, 2026' },
            { name: 'Dawit T.', rating: 4, comment: 'Good quality medication. Reasonable price.', date: 'June 28, 2026' },
          ].map((review, idx) => (
            <div key={idx} className="bg-white border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">{review.name.split(' ').map(n => n[0]).join('')}</div>
                  <span className="text-sm font-bold text-neutral-800">{review.name}</span>
                </div>
                <span className="text-[10px] text-gray-400">{review.date}</span>
              </div>
              <div className="flex gap-0.5 mb-2">{Array.from({ length: 5 }).map((_, i) => (<svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>))}</div>
              <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight mb-6">{t('product.related_title')}</h2>
        <ProductsClient currentId={String(product.id)} category={product.category || undefined} />
      </div>
    </div>
  );
}
