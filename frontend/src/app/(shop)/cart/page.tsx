'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { createOrder, Order } from '@/lib/api/orders';
import { initiatePayment, verifyPayment, InitiatePaymentResult, PaymentDetails } from '@/lib/api/payments';
import { getMe } from '@/lib/api/auth';
import { getAccessToken } from '@/lib/auth/tokens';
import { useLanguage } from '@/context/LanguageContext';

export default function CartPage() {
  const { t } = useLanguage();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [selectedBranch, setSelectedBranch] = useState('Ayat Branch');
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe'>('telebirr');

  // Customer Contact State
  const [customerName, setCustomerName] = useState('Abebe Kebede');
  const [customerEmail, setCustomerEmail] = useState('abebe@example.com');
  const [customerPhone, setCustomerPhone] = useState('+251911223344');
  const [shippingAddress, setShippingAddress] = useState('Bole Sub-city, Woreda 03, Addis Ababa');
  const [notes, setNotes] = useState('');

  // Process States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Payment Verification Flow State
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [paymentResult, setPaymentResult] = useState<InitiatePaymentResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifiedPayment, setVerifiedPayment] = useState<PaymentDetails | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'CART' | 'PAYMENT_PENDING' | 'SUCCESS'>('CART');

  // Auto fill logged in user
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      getMe()
        .then((user) => {
          if (user) {
            setCustomerName(`${user.firstName} ${user.lastName}`);
            setCustomerEmail(user.email);
          }
        })
        .catch(() => {});
    }
  }, []);

  const taxAmount = cartTotal * 0.15; // 15% VAT
  const hasPrescriptionItems = cartItems.some(item => item.prescriptionRequired);
  const deliveryFee = hasPrescriptionItems ? 0 : 150; // Free for in-branch Rx pickup, 150 ETB standard home delivery
  const loyaltyPointsEarned = Math.floor(cartTotal / 10);
  const finalTotal = cartTotal > 0 ? cartTotal + taxAmount + deliveryFee : 0;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage('⚠️ Internet Connection Required: Processing checkout and digital payments (Telebirr / CBE Birr) requires an active internet connection. Please connect to the internet to complete your order.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Create order in PostgreSQL backend
      const order = await createOrder({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: hasPrescriptionItems ? `In-Store Pickup: ${selectedBranch}` : shippingAddress,
        items: cartItems.map(i => ({
          id: Number(i.id) || 0,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          prescriptionRequired: i.prescriptionRequired,
          imageType: i.imageType,
        })),
        subtotal: cartTotal,
        tax: taxAmount,
        deliveryFee,
        notes,
      });

      setCreatedOrder(order);

      // 2. Initiate Payment with chosen method (Telebirr or CBE)
      const payRes = await initiatePayment({
        orderId: order.id,
        paymentMethod,
      });

      setPaymentResult(payRes);
      setCheckoutStep('PAYMENT_PENDING');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initiate checkout. Please check network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentResult?.paymentId) return;
    setVerifying(true);
    setErrorMessage(null);

    try {
      const res = await verifyPayment(paymentResult.paymentId);
      if (res.success && res.status === 'PAID') {
        setVerifiedPayment(res.payment);
        setCheckoutStep('SUCCESS');
        clearCart();
      } else {
        setErrorMessage(res.message || 'Payment is still pending. Please complete authorization in your Telebirr / CBE app and click verify.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error verifying payment. Please retry in a few moments.');
    } finally {
      setVerifying(false);
    }
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

  // STEP 3: SUCCESS VIEW
  if (checkoutStep === 'SUCCESS' && createdOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="bg-white border rounded-3xl p-8 md:p-10 shadow-lg text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              {t('cart.payment_confirmed')}
            </span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('cart.order_confirmed')}</h1>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              {t('cart.thank_you')} <strong>{createdOrder.total.toLocaleString()} ETB</strong> — <strong>{createdOrder.paymentMethod?.toUpperCase()}</strong>.
            </p>
          </div>

          {/* Receipt Breakdown Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
            <div className="flex justify-between items-center border-b pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>{t('cart.order_summary_label')}</span>
              <span className="text-emerald-700 font-mono font-extrabold">{createdOrder.orderNumber}</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">{t('cart.customer_name')}</span>
                <span className="font-bold text-slate-800">{createdOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t('cart.payment_gateway')}</span>
                <span className="font-bold text-brand-700 uppercase">{createdOrder.paymentMethod}</span>
              </div>
              {verifiedPayment?.paymentNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('cart.payment_ref')}</span>
                  <span className="font-mono text-xs font-bold text-slate-700">{verifiedPayment.paymentNumber}</span>
                </div>
              )}
              {verifiedPayment?.providerTransactionId && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Provider Txn ID:</span>
                  <span className="font-mono text-xs font-bold text-emerald-700">{verifiedPayment.providerTransactionId}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-slate-900 font-extrabold">
                <span>{t('cart.total_paid')}</span>
                <span className="text-emerald-600 font-mono">{Number(createdOrder.total).toFixed(2)} ETB</span>
              </div>
            </div>
          </div>

          {hasPrescriptionItems ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs text-left leading-relaxed">
              {t('cart.rx_pickup_notice').replace('{branch}', selectedBranch)}
            </div>
          ) : (
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl text-brand-900 text-xs text-left leading-relaxed">
              {t('cart.home_delivery_notice').replace('{address}', shippingAddress)}
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/account"
              className="rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3 text-sm transition shadow-md"
            >
              {t('cart.view_order')}
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-8 py-3 text-sm transition"
            >
              {t('cart.continue_shopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: PAYMENT PENDING & VERIFICATION MODAL
  if (checkoutStep === 'PAYMENT_PENDING' && createdOrder && paymentResult) {
    const isTelebirr = paymentMethod === 'telebirr';

    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="bg-white border rounded-3xl p-8 md:p-10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isTelebirr ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {isTelebirr ? 'Telebirr Payment' : 'CBE Birr Payment'}
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-2">{t('cart.payment_pending_title')}</h1>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-slate-400 block">{t('cart.total_due')}</span>
              <span className="text-lg font-black text-brand-600">{Number(createdOrder.total).toFixed(2)} ETB</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Payment Instructions Box */}
          <div className={`p-6 rounded-2xl border ${
            isTelebirr ? 'bg-sky-50/70 border-sky-200' : 'bg-purple-50/70 border-purple-200'
          } space-y-4`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                isTelebirr ? 'bg-sky-600' : 'bg-purple-700'
              }`}>
                {isTelebirr ? 'TB' : 'CBE'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isTelebirr ? 'Telebirr SuperApp / Web' : 'CBE Birr Mobile Gateway'}
                </h3>
                <p className="text-xs text-slate-500">{t('cart.order_ref')}: <strong className="font-mono">{createdOrder.orderNumber}</strong></p>
              </div>
            </div>

            <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2 leading-relaxed">
              <li>Click the checkout portal link below or open your {isTelebirr ? 'Telebirr' : 'CBE Birr'} mobile application.</li>
              <li>Confirm the merchant payment request for <strong>{Number(createdOrder.total).toFixed(2)} ETB</strong>.</li>
              <li>Enter your PIN to authorize the transaction safely.</li>
              <li>Return here and click <strong>Verify Payment</strong> below to update your order status.</li>
            </ol>

            {paymentResult.checkoutUrl && (
              <div className="pt-2">
                <a
                  href={paymentResult.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center w-full py-3 px-6 rounded-xl font-bold text-xs text-white shadow transition active:scale-95 ${
                    isTelebirr ? 'bg-sky-600 hover:bg-sky-700' : 'bg-purple-700 hover:bg-purple-800'
                  }`}
                >
                  <span>Open {isTelebirr ? 'Telebirr' : 'CBE Birr'} Pay Portal</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleVerifyPayment}
              disabled={verifying}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 text-sm transition shadow-md active:scale-95 disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('cart.verifying')}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t('cart.verify_payment')}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setCheckoutStep('CART')}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition py-1"
            >
              {t('cart.back_to_order')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 1: SHOPPING CART & CHECKOUT FORM
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">{t('cart.title')}</h1>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 font-bold hover:text-rose-700">&times;</button>
        </div>
      )}

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items & Customer Info Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cart Items List */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 border-b pb-2">{t('cart.selected_products')} ({cartItems.length})</h2>

              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-50/60 border border-gray-200 rounded-xl gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {renderProductMiniIllustration(item.imageType)}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-neutral-800 truncate">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1 items-center">
                          <span className="text-xs font-bold text-neutral-500">{item.price.toFixed(2)} ETB</span>
                          {item.prescriptionRequired && (
                            <span className="bg-red-50 border border-red-100 text-red-600 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                              {t('cart.rx_required')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 hover:bg-gray-100 font-bold transition text-gray-500"
                        >
                          &minus;
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-700">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 hover:bg-gray-100 font-bold transition text-gray-500"
                        >
                          &#43;
                        </button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <p className="text-sm font-extrabold text-neutral-900">{(item.price * item.quantity).toFixed(2)} ETB</p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 transition"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {hasPrescriptionItems && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{t('cart.rx_notice_title')}</span>
                  </div>
                  <p>{t('cart.rx_notice_desc')}</p>
                  <div>
                    <label htmlFor="branchSelect" className="block text-[10px] font-extrabold text-red-700 uppercase mt-1">{t('cart.collection_branch')}</label>
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

            {/* Customer Details Form */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 border-b pb-2">{t('cart.customer_details')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('cart.full_name')} *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('cart.email')} *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('cart.phone')} *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('cart.delivery_address')} *</label>
                  <input
                    type="text"
                    required
                    disabled={hasPrescriptionItems}
                    value={hasPrescriptionItems ? `In-Store Pickup: ${selectedBranch}` : shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 outline-none focus:border-brand-500 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 border-b pb-2">{t('cart.payment_method')}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Telebirr Option */}
                <div
                  onClick={() => setPaymentMethod('telebirr')}
                  className={`cursor-pointer rounded-2xl border-2 p-4 flex items-center gap-3.5 transition ${
                    paymentMethod === 'telebirr'
                      ? 'border-sky-500 bg-sky-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                    paymentMethod === 'telebirr' ? 'bg-sky-600' : 'bg-slate-400'
                  }`}>
                    TB
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">Telebirr SuperApp</h4>
                      {paymentMethod === 'telebirr' && (
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pay via Ethio Telecom Telebirr Web or USSD</p>
                  </div>
                </div>

                {/* CBE Birr Option */}
                <div
                  onClick={() => setPaymentMethod('cbe')}
                  className={`cursor-pointer rounded-2xl border-2 p-4 flex items-center gap-3.5 transition ${
                    paymentMethod === 'cbe'
                      ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                    paymentMethod === 'cbe' ? 'bg-purple-700' : 'bg-slate-400'
                  }`}>
                    CBE
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">CBE Birr</h4>
                      {paymentMethod === 'cbe' && (
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Commercial Bank of Ethiopia Mobile Gateway</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Order Summary Sidebar */}
          <aside className="bg-white border rounded-2xl p-6 shadow-sm self-start space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 border-b pb-2">{t('cart.order_summary')}</h2>

            <div className="space-y-2.5 text-sm text-neutral-600">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-neutral-800">{cartTotal.toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between">
                <span>{t('cart.vat')}</span>
                <span className="font-semibold text-neutral-800">{taxAmount.toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between">
                <span>{t('cart.delivery_fee')}</span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-emerald-600 uppercase text-xs">{t('cart.free_pickup')}</span>
                ) : (
                  <span className="font-semibold text-neutral-800">{deliveryFee.toFixed(2)} ETB</span>
                )}
              </div>
              
              <div className="border-t border-dashed pt-2.5 flex justify-between text-neutral-900 font-extrabold text-base">
                <span>{t('cart.total')}</span>
                <span>{finalTotal.toFixed(2)} ETB</span>
              </div>
            </div>

            {/* Loyalty points banner */}
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 flex items-center gap-2.5 text-xs text-brand-800">
              <svg className="w-5 h-5 text-brand-600 shrink-0 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold">{t('cart.loyalty_earn')}</p>
                <p className="text-[10px] text-brand-600 mt-0.5">{t('cart.loyalty_points').replace('{points}', String(loyaltyPointsEarned))}</p>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 text-sm active:scale-95 transition shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('cart.creating_order')}</span>
                  </span>
                ) : (
                  <span>{t('cart.proceed_pay')} {paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr'}</span>
                )}
              </button>
            </form>

            <Link
              href="/products"
              className="block text-center text-xs font-bold text-neutral-400 hover:text-neutral-600 transition pt-1"
            >
              {t('cart.continue_shopping')}
            </Link>
          </aside>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-gray-50/50">
          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mt-4">{t('cart.empty_title')}</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            {t('cart.empty_desc')}
          </p>
          <Link
            href="/products"
            className="mt-6 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 text-xs transition"
          >
            {t('cart.shop_products')}
          </Link>
        </div>
      )}
    </div>
  );
}
