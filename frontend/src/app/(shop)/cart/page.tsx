'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Ayat Branch');

  const taxAmount = cartTotal * 0.15; // 15% VAT
  const deliveryFee = cartItems.some(item => item.prescriptionRequired) ? 0 : 150; // No delivery fee if pick-up required, or standard fee
  const loyaltyPointsEarned = Math.floor(cartTotal / 10);
  const finalTotal = cartTotal > 0 ? cartTotal + taxAmount + deliveryFee : 0;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutSuccess(true);
    clearCart();
  };

  const renderProductMiniIllustration = (type?: string) => {
    const baseStyle = 'w-12 h-12 rounded-lg flex items-center justify-center border shrink-0';
    switch (type) {
      case 'syrup':
        return (
          <div className={`${baseStyle} bg-emerald-50 text-emerald-600 border-emerald-100`}>
            <svg className="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
            </svg>
          </div>
        );
      case 'tablet':
        return (
          <div className={`${baseStyle} bg-blue-50 text-blue-600 border-blue-100`}>
            <svg className="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
            </svg>
          </div>
        );
      case 'cosmetic':
        return (
          <div className={`${baseStyle} bg-purple-50 text-purple-600 border-purple-100`}>
            <svg className="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${baseStyle} bg-gray-50 text-gray-400 border-gray-200`}>
            <svg className="w-6.5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4" />
            </svg>
          </div>
        );
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="w-16 h-16 bg-brand-50 border border-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Confirmed!</h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          Thank you for choosing Michu Pharmacy! Your order request has been received. A verification SMS has been sent to your registered phone number.
        </p>
        {deliveryFee === 0 ? (
          <p className="mt-4 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 inline-block">
            ⚠️ Prescription Pick-up: Please bring your physical prescription when collecting at {selectedBranch}.
          </p>
        ) : (
          <p className="mt-4 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 rounded-lg p-3 inline-block">
            🚀 Home Delivery: Your package is being compiled and will arrive within 2-4 hours.
          </p>
        )}
        <div className="mt-8">
          <Link
            href="/products"
            className="rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Shopping Cart</h1>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4 flex-1">
                  {renderProductMiniIllustration(item.imageType)}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-neutral-800 truncate">{item.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                      <span className="text-xs font-bold text-neutral-500">{item.price.toFixed(2)} ETB</span>
                      {item.prescriptionRequired && (
                        <span className="bg-red-50 border border-red-100 text-red-600 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                          Rx Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantities & Deletions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 hover:bg-gray-100 font-bold transition text-gray-500"
                    >
                      &minus;
                    </button>
                    <span className="px-3.5 text-xs font-bold text-gray-700">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 hover:bg-gray-100 font-bold transition text-gray-500"
                    >
                      &#43;
                    </button>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <p className="text-sm font-extrabold text-neutral-900">{(item.price * item.quantity).toFixed(2)} ETB</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-neutral-400 hover:text-red-600 transition"
                    aria-label="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Warning Alert if Prescription items are inside */}
            {cartItems.some(item => item.prescriptionRequired) && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Prescription Medicine pickup regulations</span>
                </div>
                <p className="text-xs leading-normal">
                  Your cart contains products that require a prescription. In compliance with health authority regulations, these medications cannot be shipped for delivery. You must collect them in-person at the branch select below and provide the original physical prescription to our pharmacist.
                </p>
                <div className="pt-2">
                  <label htmlFor="branchSelect" className="block text-[10px] font-extrabold text-red-700 uppercase">Selected Collection Branch</label>
                  <select
                    id="branchSelect"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="mt-1 block w-full max-w-xs text-xs rounded-lg border border-red-200 bg-white p-2 text-red-900 outline-none"
                  >
                    <option value="Ayat Branch">Ayat Branch (24 Hours)</option>
                    <option value="Adama Branch">Adama Branch (8:00 AM - 10:00 PM)</option>
                    <option value="Bethel Branch">Bethel Branch (8:00 AM - 9:00 PM)</option>
                    <option value="Dire Dawa Branch">Dire Dawa Branch</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary sidebar */}
          <aside className="bg-white border rounded-2xl p-6 shadow-sm self-start space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 border-b pb-2">Order Summary</h2>

            <div className="space-y-2.5 text-sm text-neutral-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-800">{cartTotal.toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (15%)</span>
                <span className="font-semibold text-neutral-800">{taxAmount.toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery / Pickup Fees</span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-emerald-600 uppercase text-xs">Free Store Pickup</span>
                ) : (
                  <span className="font-semibold text-neutral-800">{deliveryFee.toFixed(2)} ETB</span>
                )}
              </div>
              
              <div className="border-t border-dashed pt-2.5 flex justify-between text-neutral-900 font-extrabold text-base">
                <span>Total Amount</span>
                <span>{finalTotal.toFixed(2)} ETB</span>
              </div>
            </div>

            {/* Loyalty points banner */}
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 flex items-center gap-2.5 text-xs text-brand-800">
              <svg className="w-5 h-5 text-brand-600 shrink-0 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold">Earn Yene Loyalty Points</p>
                <p className="text-[10px] text-brand-600 mt-0.5">Collect +{loyaltyPointsEarned} points from this order</p>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              <button
                type="submit"
                className="w-full flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 text-sm active:scale-95 transition shadow-sm"
              >
                Proceed to Checkout
              </button>
            </form>

            <Link
              href="/products"
              className="block text-center text-xs font-bold text-neutral-400 hover:text-neutral-600 transition pt-1"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-gray-50/50">
          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mt-4">Your Cart is Empty</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            It looks like you haven&apos;t added any products to your shopping cart yet. Browse our selection and take care of your health today.
          </p>
          <Link
            href="/products"
            className="mt-6 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 text-xs transition"
          >
            Shop Products
          </Link>
        </div>
      )}
    </div>
  );
}
