'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductsClient from '../ProductsClient';

interface Product {
  id: string;
  name: string;
  price: number;
  prescriptionRequired: boolean;
  imageType: 'syrup' | 'tablet' | 'drops' | 'cream' | 'spray' | 'cosmetic' | 'device';
  brand: string;
  category: string;
  branches: string[];
  description: string;
  fullDescription: string;
  dosage: string;
  sideEffects: string;
  storage: string;
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: '(Exedexe) Dextromethorphan syrup 120ml',
    price: 240,
    prescriptionRequired: false,
    imageType: 'syrup',
    brand: 'Exedexe',
    category: 'Medicines',
    branches: ['Adama Branch', 'Ayat Branch', 'Hawassa Branch'],
    description: 'A trusted cough suppressant syrup formulated for effective relief of dry cough.',
    fullDescription: 'Exedexe Dextromethorphan syrup is a clinically proven cough suppressant that provides fast and effective relief from dry, irritating coughs. The 120ml bottle contains Dextromethorphan Hydrobromide.',
    dosage: 'Adults and children over 12 years: 10ml (2 teaspoons) every 4-6 hours as needed. Do not exceed 40ml in 24 hours.',
    sideEffects: 'May cause mild drowsiness, nausea, or stomach upset in some users.',
    storage: 'Store below 25°C. Do not refrigerate. Keep away from direct sunlight.',
  },
  {
    id: 'p2',
    name: '(Nicardia retard 20) Nifedipine 20mg of 100',
    price: 25,
    prescriptionRequired: true,
    imageType: 'tablet',
    brand: 'Nicardia',
    category: 'Medicines',
    branches: ['Bethel Branch', 'Jemo Branch', 'Adama Branch'],
    description: 'Sustained-release Nifedipine tablet for management of hypertension and chronic stable angina pectoris.',
    fullDescription: 'Nicardia Retard 20 contains Nifedipine 20mg in a sustained-release formulation. Used to treat high blood pressure and chronic stable angina.',
    dosage: 'Usually one tablet daily or as directed by your physician. Swallow whole with water.',
    sideEffects: 'May cause flushing, headache, dizziness, and ankle swelling.',
    storage: 'Store in a cool, dry place below 30°C. Protect from moisture.',
  },
  {
    id: 'p3',
    name: '(Zoxan-D) Ciprofloxacin 0.3% + Dexamethason 5ml',
    price: 290,
    prescriptionRequired: true,
    imageType: 'drops',
    brand: 'Zoxan-D',
    category: 'Medicines',
    branches: ['Figa Branch', 'Hawassa Branch', 'Ayat Branch'],
    description: 'Combination antibiotic and anti-inflammatory eye drops for bacterial eye infections.',
    fullDescription: 'Zoxan-D eye drops combine Ciprofloxacin with Dexamethasone to treat bacterial eye infections and associated inflammation.',
    dosage: 'Instill 1-2 drops in the affected eye(s) every 4 hours. Do not use for more than 7 days.',
    sideEffects: 'May cause temporary stinging or burning sensation.',
    storage: 'Store below 25°C. Discard 4 weeks after first opening.',
  },
  {
    id: 'p4',
    name: '3D white charcoal whitening Tp of 204g',
    price: 500,
    prescriptionRequired: false,
    imageType: 'cosmetic',
    brand: 'Crest',
    category: 'Cosmetics',
    branches: ['Ayat Branch', 'Hawassa Branch', 'Jemo Branch'],
    description: 'Advanced whitening toothpaste with activated charcoal for deep stain removal.',
    fullDescription: 'Crest 3D White Charcoal toothpaste uses activated charcoal to gently remove tough stains and whiten teeth.',
    dosage: 'Brush thoroughly for 2 minutes, twice daily.',
    sideEffects: 'None reported. For external use only.',
    storage: 'Store at room temperature.',
  },
  {
    id: 'p5',
    name: 'Absolute Lip Gloss Clear Glow',
    price: 73.91,
    prescriptionRequired: false,
    imageType: 'cosmetic',
    brand: 'Other',
    category: 'Cosmetics',
    branches: ['Jemo Branch', 'Dire Dawa Branch', 'Figa Branch'],
    description: 'High-shine clear lip gloss that adds a natural luminous finish.',
    fullDescription: 'Absolute Lip Gloss Clear Glow provides a brilliant, non-sticky shine that enhances your natural lip color.',
    dosage: 'Apply directly to clean lips as needed.',
    sideEffects: 'Discontinue if irritation occurs.',
    storage: 'Store in a cool, dry place.',
  },
  {
    id: 'p6',
    name: 'Acetazolamide 250mg of 10*10 tablet',
    price: 225,
    prescriptionRequired: true,
    imageType: 'tablet',
    brand: 'Other',
    category: 'Medicines',
    branches: ['Adama Branch', 'Bethel Branch', 'Dire Dawa Branch'],
    description: 'Carbonic anhydrase inhibitor for glaucoma, epilepsy, and altitude sickness.',
    fullDescription: 'Acetazolamide 250mg tablets are used to treat glaucoma, manage epilepsy, and prevent altitude sickness.',
    dosage: 'As prescribed. Typical dose for glaucoma: 250mg 1-4 times daily.',
    sideEffects: 'May cause tingling in hands/feet, loss of appetite.',
    storage: 'Store below 30°C.',
  },
  {
    id: 'p7',
    name: 'Actrapid 100iu/ml 10ml/vial soluble insulin',
    price: 1155,
    prescriptionRequired: true,
    imageType: 'tablet',
    brand: 'Other',
    category: 'Medicines',
    branches: ['Dire Dawa Branch', 'Ayat Branch', 'Jemo Branch'],
    description: 'Soluble human insulin injection for diabetes management.',
    fullDescription: 'Actrapid is a fast-acting soluble human insulin used to control blood glucose levels in diabetes.',
    dosage: 'Subcutaneous injection as directed. Usually 30 minutes before meals.',
    sideEffects: 'May cause hypoglycemia, injection site reactions.',
    storage: 'Store in refrigerator (2-8°C) before opening.',
  },
  {
    id: 'p8',
    name: 'Acyclovir Denk 200mg of 5*10 tabletten',
    price: 460,
    prescriptionRequired: true,
    imageType: 'tablet',
    brand: 'Acyclovir Denk',
    category: 'Medicines',
    branches: ['Hawassa Branch', 'Jemo Branch', 'Bethel Branch'],
    description: 'Antiviral medication for treatment of herpes simplex virus infections.',
    fullDescription: 'Acyclovir Denk 200mg tablets are antiviral medications for treating HSV infections including cold sores and shingles.',
    dosage: '200mg 5 times daily at 4-hourly intervals for 5-10 days.',
    sideEffects: 'May cause nausea, diarrhea, headache.',
    storage: 'Store below 25°C.',
  },
  {
    id: 'p9',
    name: 'Michu Daily Multi-Vitamin Capsules',
    price: 350,
    prescriptionRequired: false,
    imageType: 'tablet',
    brand: 'Other',
    category: 'Supplements',
    branches: ['All Branches', 'Ayat Branch', 'Adama Branch'],
    description: 'Complete daily multivitamin and mineral supplement.',
    fullDescription: 'Michu Daily Multi-Vitamin Capsules provide a comprehensive blend of essential vitamins and minerals.',
    dosage: 'Take 1 capsule daily with a meal.',
    sideEffects: 'Generally well tolerated.',
    storage: 'Store in a cool, dry place.',
  },
  {
    id: 'p10',
    name: 'Sterile Nebulizer Compressor Device',
    price: 2450,
    prescriptionRequired: false,
    imageType: 'device',
    brand: 'Other',
    category: 'Medical Devices',
    branches: ['Adama Branch', 'Bethel Branch', 'Jemo Branch'],
    description: 'High-quality compressor nebulizer system for respiratory therapy.',
    fullDescription: 'The Sterile Nebulizer Compressor Device converts liquid medication into a fine mist for inhalation.',
    dosage: 'Use as directed. Typically 5-10 minute sessions 2-4 times daily.',
    sideEffects: 'None reported.',
    storage: 'Keep device dry. Clean nebulizer parts after each use.',
  },
  {
    id: 'p11',
    name: 'Anti-Bacterial Hand Spray 100ml',
    price: 95,
    prescriptionRequired: false,
    imageType: 'spray',
    brand: 'Other',
    category: 'Personal Care',
    branches: ['All Branches', 'Figa Branch', 'Dire Dawa Branch'],
    description: 'Kills 99.9% of germs. Alcohol-based hand sanitizer spray.',
    fullDescription: 'Michu Anti-Bacterial Hand Spray provides instant germ protection with 70% Isopropyl Alcohol.',
    dosage: 'Spray onto dry hands and rub until dry.',
    sideEffects: 'For external use only. Flammable.',
    storage: 'Store below 30°C.',
  },
];

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const product = PRODUCTS.find((p) => p.id === resolvedParams.id);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-extrabold text-gray-800">Product Not Found</h1>
        <p className="text-sm text-gray-500 mt-2">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 text-sm transition">
          Back to Products
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        prescriptionRequired: product.prescriptionRequired,
        imageType: product.imageType,
      });
    }
    triggerToast(`Added ${quantity} x ${product.name.split(' ').slice(0, 3).join(' ')} to cart!`);
    setQuantity(1);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      triggerToast('Removed from wishlist');
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        prescriptionRequired: product.prescriptionRequired,
        imageType: product.imageType,
        brand: product.brand,
        category: product.category,
      });
      triggerToast('Added to wishlist!');
    }
  };

  const renderProductImage = (type: string) => {
    switch (type) {
      case 'syrup':
        return <div className="w-full h-full bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2h-1M5 11V9a2 2 0 012-2h1m5-4h2a1 1 0 011 1v2H11V4a1 1 0 011-1z" /></svg></div>;
      case 'tablet':
        return <div className="w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 22a10 10 0 100-20 10 10 0 000 20zm0-10h.01M8 12h.01M16 12h.01M12 8h.01M12 16h.01" /></svg></div>;
      case 'drops':
        return <div className="w-full h-full bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600"><svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158A6 6 0 018 16" /></svg></div>;
      case 'cosmetic':
        return <div className="w-full h-full bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zM12 5V2m-3 3v4a3 3 0 006 0V5" /></svg></div>;
      case 'device':
        return <div className="w-full h-full bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 3v2m6-2v2M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg></div>;
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
        <Link href="/" className="hover:text-brand-600 transition">Home</Link>
        <span>&gt;</span>
        <Link href="/products" className="hover:text-brand-600 transition">Shop</Link>
        <span>&gt;</span>
        <span className="text-brand-700">{product.name.split(' ').slice(0, 3).join(' ')}...</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square rounded-3xl overflow-hidden shadow-lg bg-gray-50 relative">
          {renderProductImage(product.imageType)}
          {product.prescriptionRequired && (
            <span className="absolute top-4 left-4 bg-red-50 text-red-600 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-red-200 shadow-sm">Rx Required</span>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{product.brand}</span>
            <h1 className="text-3xl font-extrabold text-neutral-900 mt-1 leading-tight">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-neutral-900">{product.price.toFixed(2)}</span>
            <span className="text-lg font-semibold text-gray-500 mb-1">ETB</span>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full mb-1.5">{product.category}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-gray-100 font-bold transition text-gray-500 text-lg">&minus;</button>
              <span className="px-5 text-base font-bold text-gray-700">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-gray-100 font-bold transition text-gray-500 text-lg">&#43;</button>
            </div>
            <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 text-sm active:scale-95 transition shadow-md shadow-brand-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Add to Cart
            </button>
            <button onClick={handleWishlistToggle} className={`p-3.5 rounded-xl border transition active:scale-95 ${isInWishlist(product.id) ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' : 'text-neutral-400 hover:text-red-500 hover:bg-neutral-50 border-gray-300'}`} aria-label="Add to wishlist">
              <svg className="w-6 h-6" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
          </div>

          {product.prescriptionRequired && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs font-medium flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div><p className="font-bold">Prescription Required</p><p className="mt-0.5">This medication requires a valid prescription collected at branch.</p></div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Available at Branches</h3>
            <div className="flex flex-wrap gap-2">
              {product.branches.map((branch) => (<span key={branch} className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full">{branch}</span>))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div><h3 className="font-bold text-neutral-800">Product Details</h3></div>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{product.fullDescription}</p>
          </div>
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><h3 className="font-bold text-neutral-800">Dosage & Usage</h3></div>
            <p className="text-xs text-gray-600 leading-relaxed">{product.dosage}</p>
          </div>
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><h3 className="font-bold text-neutral-800">Safety & Storage</h3></div>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{product.sideEffects}\n\n{product.storage}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight mb-6">Customer Reviews</h2>
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
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight mb-6">You May Also Like</h2>
        <ProductsClient currentId={product.id} category={product.category} />
      </div>
    </div>
  );
}
