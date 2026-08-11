'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { getOrderById, updateOrderStatus, Order } from '@/lib/api/orders';
import { getPaymentByOrderId, PaymentDetails } from '@/lib/api/payments';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const orderData = await getOrderById(Number(params.id));
      setOrder(orderData);

      const paymentData = await getPaymentByOrderId(orderData.id);
      setPayment(paymentData);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [params.id]);

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-16 text-center text-slate-500 flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-emerald-600 mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-semibold text-sm">Fetching order and payment record from PostgreSQL...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-12 text-center text-slate-500 space-y-4">
          <p className="text-lg font-bold text-slate-800">Order #{params.id} not found</p>
          <Link href="/admin/orders" className="text-emerald-600 font-bold text-xs hover:underline">
            &larr; Return to Orders Management
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
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
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs">
            {errorMessage}
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
              <h2 className="text-base font-bold text-slate-900 border-b pb-2">Payment Verification Record</h2>

              <dl className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <dt className="font-bold text-slate-400 uppercase">Payment Method</dt>
                  <dd className="font-extrabold text-brand-700 bg-brand-50 px-2.5 py-1 rounded border border-brand-100 uppercase">
                    {order.paymentMethod || 'cash'}
                  </dd>
                </div>

                <div className="flex justify-between items-center">
                  <dt className="font-bold text-slate-400 uppercase">Payment Status</dt>
                  <dd className="font-bold text-slate-800 uppercase">{order.paymentStatus}</dd>
                </div>

                {payment?.paymentNumber && (
                  <div>
                    <dt className="font-bold text-slate-400 uppercase">Payment Reference</dt>
                    <dd className="font-mono font-bold text-slate-800 mt-0.5">{payment.paymentNumber}</dd>
                  </div>
                )}

                {payment?.providerTransactionId && (
                  <div>
                    <dt className="font-bold text-slate-400 uppercase">Provider Txn ID</dt>
                    <dd className="font-mono font-bold text-emerald-700 mt-0.5">{payment.providerTransactionId}</dd>
                  </div>
                )}

                {payment?.paidAt && (
                  <div>
                    <dt className="font-bold text-slate-400 uppercase">Paid Timestamp</dt>
                    <dd className="font-semibold text-slate-700 mt-0.5">{new Date(payment.paidAt).toLocaleString()}</dd>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between items-center text-slate-900 font-extrabold text-sm">
                  <span>Amount Paid</span>
                  <span className="font-mono text-emerald-600">{Number(order.total).toFixed(2)} ETB</span>
                </div>
              </dl>
            </div>

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

      </div>
    </AdminLayout>
  );
}
