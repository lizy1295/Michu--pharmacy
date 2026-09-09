'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders, Order } from '@/lib/api/orders';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const paymentColors: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600 border-slate-200',
  payment_initiated: 'bg-sky-50 text-sky-700 border-sky-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  refunded: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // `search` is intentionally excluded from the dependency array: it is applied
  // only on form submit, not on every keystroke — adding it would refetch on every char.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await getOrders({
          status: statusFilter || undefined,
          search: search || undefined,
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        setLoading(true);
        const res = await getOrders({
          status: statusFilter || undefined,
          search: search || undefined,
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    })();
  };

  const formatProductsSummary = (items: any[]) => {
    if (!Array.isArray(items) || items.length === 0) return 'No items';
    return items.map((i) => `${i.name} x${i.quantity || 1}`).join(', ');
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Orders Management</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage live customer prescription & product orders</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
              {orders.length} Total Orders
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search orders by ref or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 transition"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-medium transition"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Orders Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <svg className="animate-spin h-6 w-6 text-emerald-600 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-xs font-semibold">Loading orders from PostgreSQL...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="text-left py-3.5 px-4">Order Ref</th>
                    <th className="text-left py-3.5 px-4">Customer</th>
                    <th className="text-left py-3.5 px-4 hidden md:table-cell">Products</th>
                    <th className="text-left py-3.5 px-4">Order Status</th>
                    <th className="text-left py-3.5 px-4">Payment Method</th>
                    <th className="text-left py-3.5 px-4">Payment Status</th>
                    <th className="text-left py-3.5 px-4">Total Amount</th>
                    <th className="text-left py-3.5 px-4 hidden sm:table-cell">Date</th>
                    <th className="text-right py-3.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 font-mono text-xs">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200/60 shrink-0 uppercase">
                            {order.customerName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{order.customerName}</p>
                            <p className="text-xs text-slate-400 font-medium">{order.customerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell">
                        <p className="line-clamp-1 text-xs font-medium">{formatProductsSummary(order.items)}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${statusColors[order.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {order.paymentMethod || 'cash'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${paymentColors[order.paymentStatus] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {order.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 font-mono">
                        ETB {Number(order.total).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-500 hidden sm:table-cell">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/orders/${order.id}`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition" title="View Order Details">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No orders found in PostgreSQL database.</p>
            </div>
          )}
        </div>
      </div>
  );
}
