'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders, Order } from '@/lib/api/orders';
import { getAccessToken } from '@/lib/auth/tokens';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchOrders = async () => {
    // 1. Proactively check if an admin token exists before making network request
    const token = getAccessToken();
    if (!token) {
      setIsAuthError(true);
      setErrorMessage('Administrator authorization required. Please sign in with an admin account to view live orders.');
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setIsAuthError(false);

      const res = await getOrders({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setOrders(res.data || []);
      setLastRefreshed(new Date());
    } catch (err: any) {
      const isUnauthorized =
        err?.status === 401 ||
        err?.status === 403 ||
        err?.message?.includes('401') ||
        err?.message?.includes('403') ||
        err?.message?.toLowerCase().includes('unauthorized') ||
        err?.message?.toLowerCase().includes('forbidden');

      if (isUnauthorized) {
        setIsAuthError(true);
        setErrorMessage('Administrator authorization required. Please sign in with an admin account to view live orders.');
      } else {
        setErrorMessage(err?.message || 'Unable to load orders from PostgreSQL database.');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // `search` is intentionally excluded from the dependency array: it is applied
  // only on form submit, not on every keystroke — adding it would refetch on every char.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTimeout(() => {
      fetchOrders();
    }, 0);
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition disabled:opacity-50"
            title="Refresh Orders"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Refreshing...' : 'Refresh Orders'}</span>
          </button>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
            {orders.length} Orders Loaded
          </span>
        </div>
      </div>

      {/* Auth Error Banner */}
      {isAuthError && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-extrabold text-amber-900 text-sm">Administrator Session Required</h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                You are not currently logged in as an administrator (or your admin session expired after using the customer storefront). Sign in to view and verify live PostgreSQL orders.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Link
              href="/admin/login"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition"
            >
              Sign In to Admin Portal
            </Link>
          </div>
        </div>
      )}

      {/* Generic Error Banner */}
      {errorMessage && !isAuthError && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center justify-between gap-4 text-xs font-semibold text-rose-800">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={fetchOrders}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg font-bold text-[11px] transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders by ref (e.g. ORD-0008) or customer name..."
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
            Filter
          </button>
          {(search || statusFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
            >
              Reset
            </button>
          )}
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
            <p className="text-xs font-semibold">Querying live orders from PostgreSQL database...</p>
          </div>
        ) : orders.length > 0 ? (
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
                          {order.customerName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{order.customerName}</p>
                          <p className="text-xs text-slate-400 font-medium">{order.customerEmail || order.customerPhone || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell">
                      <p className="line-clamp-1 text-xs font-medium">{formatProductsSummary(order.items)}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          statusColors[order.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {order.paymentMethod || 'cash'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                            paymentColors[order.paymentStatus] || 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {order.paymentStatus.replace('_', ' ')}
                        </span>
                        {order.paymentStatus !== 'paid' && (order.transactionId || order.proofImage) && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                            📸 Proof Uploaded
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 font-mono">
                      ETB {Number(order.total).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-500 hidden sm:table-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200/80 transition"
                          title="View Order Details & Verify Payment"
                        >
                          <span>Review</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !isAuthError ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-bold text-slate-700">No matching orders found.</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter
                ? 'Try clearing the search query or status filter to see all records.'
                : 'Customer orders placed on the storefront will appear here automatically.'}
            </p>
            {(search || statusFilter) && (
              <button
                onClick={handleResetFilters}
                className="mt-3 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
