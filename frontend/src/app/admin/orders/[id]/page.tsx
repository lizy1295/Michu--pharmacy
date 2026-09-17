'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getOrderById, updateOrderStatus, Order } from '@/lib/api/orders';
import {
  getPaymentByOrderId,
  getReceiptByOrderId,
  adminApprovePayment,
  adminRejectPayment,
  PaymentDetails,
  ReceiptDetails,
} from '@/lib/api/payments';

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderById(Number(resolvedParams.id));
        setOrder(orderData);

        try {
          const paymentData = await getPaymentByOrderId(orderData.id);
          setPayment(paymentData);
        } catch {
          // Payment record optional
        }

        if (orderData.paymentStatus === 'paid') {
          try {
            const receiptData = await getReceiptByOrderId(orderData.id);
            setReceipt(receiptData);
          } catch {
            // Receipt optional
          }
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [resolvedParams.id]);

  const handleStatusChange = async (newStatus: 'pending' | 'approved' | 'shipped' | 'completed' | 'cancelled') => {
    if (!order) return;
    try {
      setUpdating(true);
      const updated = await updateOrderStatus(order.id, newStatus);
      setOrder(updated);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAdminApprove = () => {
    if (!order) return;
    setApproveModalOpen(true);
  };

  const executeAdminApprove = async () => {
    if (!order) return;
    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await adminApprovePayment(order.id);
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: 'approved',
              paymentStatus: 'paid',
              approvedAt: new Date().toISOString(),
            }
          : null,
      );
      if (res.payment) setPayment(res.payment);
      if (res.receipt) setReceipt(res.receipt);
      setApproveModalOpen(false);
      setSuccessMessage('Payment verified successfully! Order is now approved and digital receipt issued.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to approve payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminReject = async () => {
    if (!order) return;
    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await adminRejectPayment(order.id, rejectReason || 'Payment proof rejected by admin');
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              paymentStatus: 'failed',
            }
          : null,
      );
      setRejectModalOpen(false);
      setSuccessMessage('Payment proof marked as rejected.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reject payment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 flex flex-col items-center">
        <svg className="animate-spin h-8 w-8 text-emerald-600 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="font-semibold text-sm">Fetching order and payment record from PostgreSQL...</p>
      </div>
    );
  }

  if (!order) {
    const isAuth =
      errorMessage?.includes('401') ||
      errorMessage?.includes('403') ||
      errorMessage?.toLowerCase().includes('unauthorized') ||
      errorMessage?.toLowerCase().includes('forbidden');

    return (
      <div className="p-12 text-center text-slate-500 space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-base font-bold text-slate-800">
          {isAuth ? 'Administrator Session Required' : `Order #${resolvedParams.id} not found`}
        </p>
        <p className="text-xs text-slate-500">
          {isAuth
            ? 'Your administrator credentials are required to view this order. Please sign in to the Admin Portal.'
            : (errorMessage || 'The requested order does not exist in the database.')}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          {isAuth ? (
            <Link
              href="/admin/login"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-sm hover:bg-slate-800 transition"
            >
              Sign In to Admin Portal
            </Link>
          ) : (
            <Link href="/admin/orders" className="text-emerald-600 font-bold text-xs hover:underline">
              &larr; Return to Orders Management
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/admin/orders" className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition flex items-center gap-1 mb-1">
              &larr; Back to Orders
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 font-mono">{order.orderNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {order.paymentStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-2">Update Order Status:</span>
            <select
              disabled={updating}
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 shadow-xs"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 font-bold hover:text-rose-700">&times;</button>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🎉</span>
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 font-bold hover:text-emerald-700">&times;</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Items Card */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b pb-2">Purchased Products</h2>
              <div className="divide-y divide-slate-100">
                {Array.isArray(order.items) && order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity || 1} &bull; Price: {Number(item.price).toFixed(2)} ETB</p>
                    </div>
                    <p className="font-bold text-slate-900 font-mono">{(Number(item.price) * (item.quantity || 1)).toFixed(2)} ETB</p>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="border-t pt-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{Number(order.subtotal).toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT Tax (15%)</span>
                  <span className="font-semibold text-slate-800">{Number(order.tax).toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery / Pickup Fee</span>
                  <span className="font-semibold text-slate-800">{Number(order.deliveryFee).toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-slate-900 font-extrabold text-sm">
                  <span>Total Amount</span>
                  <span className="font-mono text-emerald-600">{Number(order.total).toFixed(2)} ETB</span>
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b pb-2">Customer & Shipping Details</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="font-bold text-slate-400 uppercase">Customer Name</dt>
                  <dd className="font-bold text-slate-800 mt-1">{order.customerName}</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-400 uppercase">Customer Email</dt>
                  <dd className="font-semibold text-slate-700 mt-1">{order.customerEmail}</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-400 uppercase">Phone Number</dt>
                  <dd className="font-semibold text-slate-700 mt-1">{order.customerPhone}</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-400 uppercase">Shipping Address / Pickup Branch</dt>
                  <dd className="font-semibold text-slate-700 mt-1">{order.shippingAddress}</dd>
                </div>
              </dl>
            </div>

          </div>

          {/* Payment & Status Sidebar */}
          <aside className="space-y-6">
            
            {/* Real PostgreSQL Payment Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-base font-bold text-slate-900">Payment Verification</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.paymentStatus === 'failed'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>

              <dl className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <dt className="font-bold text-slate-400 uppercase">Payment Method</dt>
                  <dd className="font-extrabold text-brand-700 bg-brand-50 px-2.5 py-1 rounded border border-brand-100 uppercase">
                    {order.paymentMethod || 'cash'}
                  </dd>
                </div>

                {/* Submitted Transaction ID */}
                <div>
                  <dt className="font-bold text-slate-400 uppercase flex items-center justify-between">
                    <span>Transaction / Ref ID</span>
                    {(order.transactionId || payment?.providerTransactionId) && (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Submitted by Customer
                      </span>
                    )}
                  </dt>
                  <dd className="mt-1 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                    <span className="font-mono font-black text-sm text-slate-900 truncate">
                      {order.transactionId || payment?.providerTransactionId || 'Not provided yet'}
                    </span>
                    {(order.transactionId || payment?.providerTransactionId) && (
                      <button
                        type="button"
                        onClick={() => handleCopy(order.transactionId || payment?.providerTransactionId || '', 'txn')}
                        className="text-[10px] font-bold text-brand-600 hover:text-brand-800 bg-white border px-2 py-0.5 rounded ml-2 shrink-0"
                      >
                        {copiedField === 'txn' ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                  </dd>
                </div>

                {/* Uploaded Receipt Screenshot */}
                <div>
                  <dt className="font-bold text-slate-400 uppercase">Receipt Screenshot</dt>
                  <dd className="mt-1">
                    {(order.proofImage || payment?.proofImage) ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getMediaUrl(order.proofImage || payment?.proofImage)}
                            alt="Receipt proof"
                            className="w-12 h-12 rounded-lg object-cover border shrink-0 cursor-pointer hover:opacity-80"
                            onClick={() => setPreviewModalOpen(true)}
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 block text-[11px] truncate">
                              Customer Receipt Attached
                            </span>
                            <button
                              type="button"
                              onClick={() => setPreviewModalOpen(true)}
                              className="text-[11px] text-brand-600 font-bold hover:underline"
                            >
                              Click to view proof &rarr;
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewModalOpen(true)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 shrink-0"
                        >
                          Enlarge
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-center text-xs">
                        No receipt screenshot uploaded
                      </div>
                    )}
                  </dd>
                </div>

                {payment?.paymentNumber && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <dt className="font-bold text-slate-400 uppercase text-[10px]">Internal Reference</dt>
                    <dd className="font-mono text-slate-600 text-[11px]">{payment.paymentNumber}</dd>
                  </div>
                )}

                {payment?.paidAt && (
                  <div className="flex justify-between items-center">
                    <dt className="font-bold text-slate-400 uppercase text-[10px]">Paid Timestamp</dt>
                    <dd className="font-mono text-slate-600 text-[11px]">{new Date(payment.paidAt).toLocaleString()}</dd>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between items-center text-slate-900 font-extrabold text-sm">
                  <span>Total Order Amount</span>
                  <span className="font-mono text-emerald-600">{Number(order.total).toFixed(2)} ETB</span>
                </div>
              </dl>

              {/* Admin Payment Approval / Rejection Actions */}
              {order.paymentStatus !== 'paid' ? (
                <div className="pt-2 border-t space-y-2">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <p className="font-bold">Manual Verification Required</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Cross-check the customer Transaction ID above with your Telebirr merchant portal or CBE Birr account statement.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdminApprove}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs transition shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Approving Payment & Issuing Receipt...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Approve Payment & Issue Receipt</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs transition active:scale-95"
                  >
                    Reject Payment Proof
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <span className="text-base">✅</span>
                  <div>
                    <strong className="block font-bold">Payment Verified & Approved</strong>
                    <span className="text-[11px] text-emerald-700">Official digital receipt has been issued and stock deducted.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Generated Digital Receipt */}
            {receipt && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
                <div className="flex justify-between items-center border-b pb-2">
                  <h2 className="text-base font-bold text-slate-900">Official Digital Receipt</h2>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] uppercase">
                    ISSUED
                  </span>
                </div>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-slate-400 font-bold uppercase text-[10px]">Receipt Number</dt>
                    <dd className="font-mono font-extrabold text-emerald-700">{receipt.receiptNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-bold uppercase text-[10px]">Date Issued</dt>
                    <dd className="font-mono text-slate-700">{receipt.issuedAt ? new Date(receipt.issuedAt).toLocaleString() : new Date().toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-bold uppercase text-[10px]">Total Received</dt>
                    <dd className="font-mono font-extrabold text-slate-900">{Number(receipt.total || 0).toFixed(2)} {receipt.currency || 'ETB'}</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
              <h2 className="text-base font-bold text-slate-900 border-b pb-2">Order Milestones</h2>
              <ul className="space-y-2 text-slate-600">
                <li className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-mono text-slate-800">{new Date(order.createdAt).toLocaleString()}</span>
                </li>
                {order.approvedAt && (
                  <li className="flex justify-between text-emerald-700">
                    <span>Approved & Confirmed:</span>
                    <span className="font-mono">{new Date(order.approvedAt).toLocaleString()}</span>
                  </li>
                )}
                {order.shippedAt && (
                  <li className="flex justify-between text-purple-700">
                    <span>Dispatched / Shipped:</span>
                    <span className="font-mono">{new Date(order.shippedAt).toLocaleString()}</span>
                  </li>
                )}
                {order.completedAt && (
                  <li className="flex justify-between text-emerald-800 font-bold">
                    <span>Completed:</span>
                    <span className="font-mono">{new Date(order.completedAt).toLocaleString()}</span>
                  </li>
                )}
              </ul>
            </div>

          </aside>

        </div>

        {/* Modal: Full Receipt Screenshot Preview */}
        {previewModalOpen && (order.proofImage || payment?.proofImage) && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Customer Payment Screenshot</h3>
                  <p className="text-xs text-slate-400">Order: {order.orderNumber} &bull; Txn ID: {order.transactionId || payment?.providerTransactionId || 'N/A'}</p>
                </div>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-base"
                >
                  &times;
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto rounded-xl flex items-center justify-center bg-slate-900 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMediaUrl(order.proofImage || payment?.proofImage)}
                  alt="Full receipt screenshot"
                  className="max-h-[65vh] object-contain rounded-lg shadow-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={getMediaUrl(order.proofImage || payment?.proofImage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-600 font-bold hover:underline"
                >
                  Open Original File &rarr;
                </a>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                  >
                    Close
                  </button>
                  {order.paymentStatus !== 'paid' && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewModalOpen(false);
                        setApproveModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                    >
                      Approve Payment Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Reject Payment Reason */}
        {rejectModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="font-black text-slate-900 text-base">Reject Payment Proof</h3>
              <p className="text-xs text-slate-500">
                Please specify why this payment proof is being rejected (e.g., Transaction ID not found, insufficient amount, unreadable screenshot).
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Transaction reference FT2409... was not found on CBE Birr account statement."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdminReject}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Verify & Approve Payment */}
        {approveModalOpen && order && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-slate-900 text-lg">Verify & Approve Payment</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Order <span className="font-bold text-slate-800">{order.orderNumber}</span> &bull; Customer: <span className="font-bold text-slate-800">{order.customerName}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setApproveModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition"
                >
                  &times;
                </button>
              </div>

              {/* Order payment summary pill */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Amount:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{Number(order.total || 0).toFixed(2)} ETB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Selected Method:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 uppercase text-[10px]">
                    {order.paymentMethod || 'Telebirr / CBE'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transaction Reference:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {order.transactionId || payment?.providerTransactionId || 'Provided via receipt'}
                  </span>
                </div>
              </div>

              {/* Action notice */}
              <div className="space-y-1.5 text-xs text-slate-600 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Confirming this action will automatically:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-900 pl-1">
                  <li>Mark this order status as <strong>PAID & APPROVED</strong></li>
                  <li>Decrement ordered medicine quantities from branch inventory</li>
                  <li>Issue an official <strong>digital pharmacy receipt & tax invoice</strong></li>
                </ul>
              </div>

              {/* Dialog buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApproveModalOpen(false)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 active:scale-95 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeAdminApprove}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing Approval...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Yes, Approve & Issue Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
  );
}
