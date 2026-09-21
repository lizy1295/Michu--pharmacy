'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { createOrder, getOrderById, Order } from '@/lib/api/orders';
import {
  initiatePayment,
  verifyPayment,
  uploadPaymentProof,
  submitPaymentProof,
  getPaymentByOrderId,
  getReceiptByOrderId,
  InitiatePaymentResult,
  PaymentDetails,
  ReceiptDetails,
} from '@/lib/api/payments';
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
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'CART' | 'PAYMENT_PENDING' | 'SUCCESS'>('CART');

  // Manual Proof Submission State
  const [txnIdInput, setTxnIdInput] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Check for return from Chapa: /cart?orderId=...&paymentNumber=...
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get('orderId');
    if (orderIdParam) {
      const oid = Number(orderIdParam);
      if (!isNaN(oid) && oid > 0) {
        getOrderById(oid)
          .then(async (orderData) => {
            setCreatedOrder(orderData);
            const payData = await getPaymentByOrderId(oid);
            if (payData) setVerifiedPayment(payData);

            if (orderData.paymentStatus === 'paid') {
              const recData = await getReceiptByOrderId(oid);
              if (recData) setReceipt(recData);
              setCheckoutStep('SUCCESS');
              clearCart();
            } else {
              setCheckoutStep('PAYMENT_PENDING');
              if (payData) {
                setPaymentResult({
                  paymentId: payData.id,
                  paymentNumber: payData.paymentNumber,
                  paymentMethod: payData.paymentMethod as any,
                  amount: payData.amount,
                  checkoutUrl: payData.checkoutUrl,
                  providerReference: payData.providerReference,
                  status: payData.status,
                });
              }
            }
          })
          .catch(() => {});
      }
    }
  }, [clearCart]);

  // Auto fill logged in user
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      getMe()
        .then((user) => {
          if (user) {
            setCustomerName(`${user.firstName} ${user.lastName}`);
            if (user.email) setCustomerEmail(user.email);
            if (user.phone) setCustomerPhone(user.phone);
          }
        })
        .catch(() => {});
    }
  }, []);

  const taxAmount = cartTotal * 0.15; // 15% VAT
  const hasPrescriptionItems = cartItems.some(item => item.prescriptionRequired);
  const deliveryFee = hasPrescriptionItems ? 0 : 150; // Free for in-branch Rx pickup, 150 ETB standard home delivery
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
      // Stay on page in PAYMENT_PENDING state with USSD / mobile app instructions and verify button
      setCheckoutStep('PAYMENT_PENDING');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initiate checkout. Please check network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMediaUrl = (path?: string | null) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(/\/api\/v1\/?$/, '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const handleCopy = (text: string, field: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    setProofFile(file);
    const preview = URL.createObjectURL(file);
    setProofPreviewUrl(preview);
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) return;

    const cleanTxnId = txnIdInput.trim();
    if (!proofFile && !cleanTxnId && !createdOrder.proofImage) {
      setErrorMessage('Please upload a screenshot of your receipt or enter the Transaction ID.');
      return;
    }

    setIsUploadingProof(true);
    setErrorMessage(null);

    try {
      let uploadedImageUrl: string | undefined = createdOrder.proofImage || undefined;
      if (proofFile) {
        const uploadRes = await uploadPaymentProof(proofFile);
        uploadedImageUrl = uploadRes.url;
      }

      await submitPaymentProof({
        orderId: createdOrder.id,
        paymentMethod,
        transactionId: cleanTxnId || undefined,
        proofImage: uploadedImageUrl,
      });

      setProofSubmitted(true);
      setCreatedOrder((prev) =>
        prev
          ? {
              ...prev,
              transactionId: cleanTxnId || prev.transactionId,
              proofImage: uploadedImageUrl || prev.proofImage,
              paymentStatus: 'payment_initiated',
            }
          : null,
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit payment proof. Please try again.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleCheckApprovalStatus = async () => {
    if (!createdOrder) return;
    setVerifying(true);
    setErrorMessage(null);
    try {
      const orderData = await getOrderById(createdOrder.id);
      setCreatedOrder(orderData);
      if (orderData.paymentStatus === 'paid') {
        const rec = await getReceiptByOrderId(createdOrder.id);
        if (rec) setReceipt(rec);
        const payData = await getPaymentByOrderId(createdOrder.id);
        if (payData) setVerifiedPayment(payData);
        setCheckoutStep('SUCCESS');
        clearCart();
      } else if (orderData.paymentStatus === 'failed') {
        setErrorMessage('Payment proof was rejected by admin. Please verify transaction details and resubmit.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to check payment status.');
    } finally {
      setVerifying(false);
    }
  };

  // Poll for admin approval when proof is submitted
  useEffect(() => {
    if (checkoutStep !== 'PAYMENT_PENDING' || !createdOrder?.id) return;
    if (!proofSubmitted && !createdOrder.transactionId) return;

    const interval = setInterval(async () => {
      try {
        const orderData = await getOrderById(createdOrder.id);
        if (orderData.paymentStatus === 'paid') {
          const rec = await getReceiptByOrderId(createdOrder.id);
          if (rec) setReceipt(rec);
          setCreatedOrder(orderData);
          const payData = await getPaymentByOrderId(createdOrder.id);
          if (payData) setVerifiedPayment(payData);
          setCheckoutStep('SUCCESS');
          clearCart();
        }
      } catch {
        // Polling background silence
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [checkoutStep, createdOrder?.id, proofSubmitted, createdOrder?.transactionId, clearCart]);

  const handleVerifyPayment = async () => {
    if (!paymentResult?.paymentId) return;
    setVerifying(true);
    setErrorMessage(null);

    try {
      const res = await verifyPayment(paymentResult.paymentId);
      if (res.success && res.status === 'PAID') {
        setVerifiedPayment(res.payment);
        if (createdOrder) {
          const rec = await getReceiptByOrderId(createdOrder.id);
          if (rec) setReceipt(rec);
        }
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

          {/* Phase 4: Full Digital Receipt Card */}
          {receipt && (
            <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-6 text-left space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base">Official Payment Receipt</h3>
                  <p className="text-xs text-slate-400">Michu Pharmacy &bull; Digital Tax Invoice</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase">
                  VERIFIED & ISSUED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold">RECEIPT NO</span>
                  <span className="font-mono font-extrabold text-emerald-700">{receipt.receiptNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">DATE & TIME</span>
                  <span className="font-mono text-slate-700">{new Date(receipt.issuedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t pt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-slate-800">{Number(receipt.subtotal).toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (15%):</span>
                  <span className="font-mono font-bold text-slate-800">{Number(receipt.tax).toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-mono font-bold text-slate-800">{Number(receipt.deliveryFee).toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-black text-slate-900">
                  <span>Total Settled:</span>
                  <span className="font-mono text-emerald-600">{Number(receipt.total).toFixed(2)} {receipt.currency}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => typeof window !== 'undefined' && window.print()}
                className="w-full py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <span>🖨️</span>
                <span>Print / Save Receipt</span>
              </button>
            </div>
          )}

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
    const merchantCode = isTelebirr ? '100200' : '998877';
    const merchantCodeLabel = isTelebirr ? 'Telebirr Merchant Code' : 'CBE Till Number';
    const displayProofImage = proofPreviewUrl || getMediaUrl(createdOrder.proofImage);
    const hasSubmitted = proofSubmitted || Boolean(createdOrder.transactionId);

    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="bg-white border rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isTelebirr ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {isTelebirr ? 'Telebirr Manual Transfer' : 'CBE Birr Mobile Transfer'}
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-2">
                {hasSubmitted ? 'Payment Proof Submitted' : 'Complete Mobile Payment'}
              </h1>
            </div>
            <div className="sm:text-right font-mono">
              <span className="text-xs text-slate-400 block">{t('cart.total_due')}</span>
              <span className="text-2xl font-black text-brand-600">{Number(createdOrder.total).toFixed(2)} ETB</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-rose-500 font-bold hover:text-rose-700">&times;</button>
            </div>
          )}

          {/* Payment Instructions Box */}
          <div className={`p-6 rounded-2xl border ${
            isTelebirr ? 'bg-sky-50/70 border-sky-200' : 'bg-purple-50/70 border-purple-200'
          } space-y-4`}>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white shadow-sm ${
                isTelebirr ? 'bg-sky-600' : 'bg-purple-700'
              }`}>
                {isTelebirr ? 'TB' : 'CBE'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isTelebirr ? 'Telebirr SuperApp / USSD *127#' : 'CBE Birr Mobile Gateway / *847#'}
                </h3>
                <p className="text-xs text-slate-500">Order Ref: <strong className="font-mono text-slate-800">{createdOrder.orderNumber}</strong></p>
              </div>
            </div>

            {/* Account Information Cards with Copy Buttons */}
            <div className="bg-white/90 rounded-xl p-4 border border-slate-200/80 space-y-3 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{merchantCodeLabel}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono font-black text-base text-slate-900">{merchantCode}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(merchantCode, 'merchant')}
                      className="text-[10px] font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-2 py-0.5 rounded"
                    >
                      {copiedField === 'merchant' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Order Reference</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono font-black text-sm text-brand-700 truncate mr-1">{createdOrder.orderNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(createdOrder.orderNumber, 'ref')}
                      className="text-[10px] font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-2 py-0.5 rounded shrink-0"
                    >
                      {copiedField === 'ref' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount to Transfer</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono font-black text-sm text-emerald-700">{Number(createdOrder.total).toFixed(2)} ETB</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(Number(createdOrder.total).toFixed(2), 'amount')}
                      className="text-[10px] font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-2 py-0.5 rounded shrink-0"
                    >
                      {copiedField === 'amount' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

              </div>

              <div className="text-xs text-slate-700 space-y-1 leading-relaxed pt-1 border-t border-slate-100">
                <p className="font-bold text-slate-900">Payment Steps:</p>
                <p>1. Open your <strong>{isTelebirr ? 'Telebirr App' : 'CBE Birr App'}</strong> or dial <strong className="font-mono text-brand-700">{isTelebirr ? '*127#' : '*847#'}</strong>.</p>
                <p>2. Select <strong>Pay Merchant</strong> & enter code <strong className="font-mono">{merchantCode}</strong>.</p>
                <p>3. Enter exact amount <strong>{Number(createdOrder.total).toFixed(2)} ETB</strong> and put order reference <strong className="font-mono">{createdOrder.orderNumber}</strong>.</p>
                <p>4. Complete the transfer and copy the <strong>Transaction ID</strong> or take a <strong>Screenshot of the receipt</strong>.</p>
              </div>
            </div>
          </div>

          {/* Form OR Status Card based on hasSubmitted */}
          {!hasSubmitted ? (
            <form onSubmit={handleProofSubmit} className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Step 2: Submit Payment Receipt or Transaction Reference
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload a screenshot of your transfer receipt. Entering the Transaction ID is optional.
                </p>
              </div>

              <div className="space-y-4">
                {/* Screenshot Upload Dropzone (Primary) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span>Attach Receipt Screenshot</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Recommended
                    </span>
                  </label>
                  
                  {!proofPreviewUrl ? (
                    <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center group">
                      <svg className="w-9 h-9 text-emerald-600 group-hover:scale-110 transition mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                        Click or drag to upload receipt screenshot
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, JPEG, WEBP (Max 10MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proofPreviewUrl}
                          alt="Receipt Preview"
                          className="w-14 h-14 object-cover rounded-lg border shrink-0 cursor-pointer hover:opacity-80"
                          onClick={() => setPreviewModalOpen(true)}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{proofFile?.name || 'receipt-screenshot.png'}</p>
                          <p className="text-[10px] text-slate-400">
                            {proofFile ? `${(proofFile.size / 1024).toFixed(1)} KB` : 'Uploaded'}
                          </p>
                          <button
                            type="button"
                            onClick={() => setPreviewModalOpen(true)}
                            className="text-[10px] text-brand-600 font-bold hover:underline"
                          >
                            Click to preview
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProofFile(null);
                          setProofPreviewUrl(null);
                        }}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-100 shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Optional Transaction ID Input */}
                <div className="pt-2 border-t border-slate-200/70">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Transaction ID / Reference Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={txnIdInput}
                    onChange={(e) => setTxnIdInput(e.target.value)}
                    placeholder={isTelebirr ? 'e.g. TX2409... (optional if screenshot attached)' : 'e.g. FT2409... (optional if screenshot attached)'}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-mono focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    You do not need to fill this if you already uploaded your receipt screenshot.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploadingProof}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 text-sm transition shadow-md active:scale-95 disabled:opacity-50"
              >
                {isUploadingProof ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Uploading & Submitting Proof...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Submit Payment Proof for Verification</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Proof Submitted Status Card */
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-950">
                      Payment Proof Submitted — Awaiting Admin Approval
                    </h3>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Our finance team is verifying your transaction. Your official receipt will be generated automatically once approved.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 shrink-0">
                  In Review
                </span>
              </div>

              {/* Submitted Info Overview */}
              <div className="bg-white rounded-xl p-4 border border-emerald-100 text-xs space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-slate-500">Submitted Transaction ID:</span>
                  <span className="font-mono font-black text-brand-700 text-sm">
                    {createdOrder.transactionId || txnIdInput}
                  </span>
                </div>

                {displayProofImage && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">Attached Receipt Screenshot:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewModalOpen(true)}
                      className="flex items-center gap-1.5 text-brand-600 font-bold hover:underline"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={displayProofImage}
                        alt="Receipt proof thumbnail"
                        className="w-8 h-8 rounded object-cover border"
                      />
                      <span>View Screenshot</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCheckApprovalStatus}
                  disabled={verifying}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs transition shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Checking Approval Status...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Check Approval Status Now</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setProofSubmitted(false)}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition text-center"
                >
                  Edit or Re-upload
                </button>
              </div>

              <p className="text-[11px] text-emerald-800/80 text-center">
                ⏱️ Checking automatically every 4 seconds. No need to reload the page.
              </p>
            </div>
          )}

          <div className="border-t pt-3">
            <button
              onClick={() => setCheckoutStep('CART')}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition py-1"
            >
              {t('cart.back_to_order')}
            </button>
          </div>
        </div>

        {/* Modal for full receipt screenshot preview */}
        {previewModalOpen && displayProofImage && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-4 space-y-3 shadow-2xl relative">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-sm font-bold text-slate-900">Submitted Receipt Screenshot</h4>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
                >
                  &times;
                </button>
              </div>
              <div className="max-h-[75vh] overflow-auto rounded-xl flex items-center justify-center bg-slate-900 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayProofImage}
                  alt="Receipt Full Preview"
                  className="max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              </div>
              <div className="flex justify-end">
                <a
                  href={displayProofImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-600 font-bold hover:underline"
                >
                  Open Original in New Tab &rarr;
                </a>
              </div>
            </div>
          </div>
        )}
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
