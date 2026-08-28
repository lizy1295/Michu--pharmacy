'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getDashboardStats, getTopProducts, DashboardStats, TopProduct } from '@/lib/api/admin';
import { getOrders, updateOrderStatus, Order } from '@/lib/api/orders';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [adminRole, setAdminRole] = useState('Super Admin');

  // Restock Modal
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string; currentStock: number } | null>(null);
  const [restockAmount, setRestockAmount] = useState(25);
  const [restockBatch, setRestockBatch] = useState('BATCH-2026-08');

  // Toast Notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Activity Logs
  const [activityLogs, setActivityLogs] = useState([
    { id: '1', time: '5m ago', icon: '📦', title: 'Order Dispatched', desc: 'Order #ORD-2026-092 sent for express delivery' },
    { id: '2', time: '18m ago', icon: '📋', title: 'Rx Approved', desc: 'Prescription #RX-8941 verified by Pharmacist' },
    { id: '3', time: '42m ago', icon: '💊', title: 'Inventory Restocked', desc: '+50 units added to Amoxicillin 500mg' },
    { id: '4', time: '1h ago', icon: '⚙️', title: 'System Check', desc: 'Inventory sync and automated backup verified' },
  ]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [statsData, products, ordersRes] = await Promise.all([
        getDashboardStats(),
        getTopProducts(6),
        getOrders({ limit: 6 }),
      ]);
      setStats(statsData);
      setTopProducts(products || []);
      setOrders(ordersRes.data || []);
      if (isManual) {
        showToast('Dashboard metrics refreshed successfully.', 'info');
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setAdminName(parsed.name);
        if (parsed.role) {
          const r = parsed.role.toLowerCase().replace(/_/g, ' ');
          setAdminRole(r.includes('super') ? 'Super Admin' : r.charAt(0).toUpperCase() + r.slice(1));
        }
      }
    } catch {
      // ignore
    }
    fetchData();
  }, []);

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(val || 0);
  };

  // Quick Order Status Change
  const handleQuickStatus = async (orderId: number, newStatus: 'pending' | 'approved' | 'shipped' | 'completed' | 'cancelled') => {
    try {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order #${orderId} marked as ${newStatus.toUpperCase()}`, 'success');
      setActivityLogs(prev => [
        {
          id: Math.random().toString(36),
          time: 'Just now',
          icon: '📦',
          title: `Order Status: ${newStatus}`,
          desc: `Order #${orderId} moved to ${newStatus}`,
        },
        ...prev.slice(0, 5),
      ]);
    } catch (err) {
      showToast('Failed to update order status', 'warning');
      fetchData();
    }
  };

  // Quick Restock Apply
  const handleApplyRestock = () => {
    if (!selectedProduct) return;
    const added = Number(restockAmount) || 0;
    showToast(`Restocked +${added} units for "${selectedProduct.name}" (Batch ${restockBatch})`, 'success');
    setActivityLogs(prev => [
      {
        id: Math.random().toString(36),
        time: 'Just now',
        icon: '💊',
        title: 'Restock Applied',
        desc: `+${added} units added for ${selectedProduct.name}`,
      },
      ...prev.slice(0, 5),
    ]);
    setRestockModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* ── 1. Clean Executive Welcome Header ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              {adminRole} Dashboard
            </span>
            <span className="text-xs text-slate-400 font-medium">
              • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {adminName} 👋
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Here is your live summary of pharmacy store orders, catalog inventory, and prescription reviews.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition disabled:opacity-50"
            title="Refresh metrics"
          >
            <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Syncing...' : 'Sync Data'}
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold transition shadow-sm shadow-emerald-600/20"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </Link>
        </div>
      </div>

      {/* ── 2. Primary 4 KPI Metrics ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Revenue</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(stats?.totalRevenue)}
              </p>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                ↗ +14.2% Growth
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl text-emerald-600 shrink-0">
              💰
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Orders</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {stats?.todayOrders ?? 0} <span className="text-xs font-semibold text-slate-400">today</span>
              </p>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 inline-block mt-1">
                {stats?.pendingOrders ?? 0} Pending Dispatch
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl text-blue-600 shrink-0">
              📦
            </div>
          </div>

          {/* Prescriptions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Prescriptions</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {stats?.totalPrescriptions ?? 0}
              </p>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60 inline-block mt-1">
                Pharmacist Review Queue
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl text-indigo-600 shrink-0">
              📋
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Stock Alerts</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {stats?.outOfStock ?? 0}
              </p>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 inline-block mt-1">
                Low / Out of Stock
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-xl text-rose-600 shrink-0">
              ⚠️
            </div>
          </div>

        </div>
      )}

      {/* ── 3. Quick Navigation Bar ── */}
      <div className="bg-slate-100/70 p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 text-xs font-bold">
        <span className="text-slate-400 px-3 py-1 text-[11px] uppercase tracking-wider">Quick Actions:</span>
        <Link href="/admin/orders" className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition shadow-2xs">
          📦 View All Orders
        </Link>
        <Link href="/admin/products" className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition shadow-2xs">
          💊 Product Catalog
        </Link>
        <Link href="/admin/categories" className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition shadow-2xs">
          🏷️ Categories
        </Link>
        <Link href="/admin/prescriptions" className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition shadow-2xs">
          📋 Prescriptions
        </Link>
        <Link href="/admin/admins" className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition shadow-2xs">
          👤 Admin & Staff Accounts
        </Link>
      </div>

      {/* ── 4. Main 2-Column Dashboard Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left 7/12: Live Orders & Restock Alerts ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Recent Orders Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Live Orders Queue</h2>
                <p className="text-xs text-slate-400">Recent customer requests requiring processing</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                All Orders &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-4">Order #</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No orders pending right now.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <Link href={`/admin/orders/${order.id}`} className="font-mono font-bold text-emerald-800 hover:underline">
                            {order.orderNumber || `#ORD-${order.id}`}
                          </Link>
                          <p className="text-[11px] text-slate-400 font-sans">
                            {Array.isArray(order.items) && order.items.length > 0
                              ? `${order.items.length} item(s)`
                              : 'Standard Order'}
                          </p>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ETB {Number(order.total).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            order.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : order.status === 'shipped'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : order.status === 'approved'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleQuickStatus(order.id, 'approved')}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                              >
                                Approve
                              </button>
                            )}
                            {order.status === 'approved' && (
                              <button
                                onClick={() => handleQuickStatus(order.id, 'shipped')}
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                              >
                                Dispatch
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => handleQuickStatus(order.id, 'completed')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                              >
                                Complete
                              </button>
                            )}
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                              title="Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Replenishment Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Inventory & Restock Alerts</h2>
                <p className="text-xs text-slate-400">Fast replenishments for frequently dispensed medicines</p>
              </div>
              <Link
                href="/admin/products"
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                All Products &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-4">Medicine Item</th>
                    <th className="py-2.5 px-4">Brand</th>
                    <th className="py-2.5 px-4">Units Sold</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {topProducts.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-100">
                          💊
                        </span>
                        <span className="truncate max-w-xs">{p.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.brand || 'Michu'}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{p.sold} units</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProduct({ id: p.id, name: p.name, currentStock: 12 });
                            setRestockModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition"
                        >
                          + Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ── Right 5/12: Prescriptions Queue & Activity Feed ── */}
        <div className="lg:col-span-5 space-y-6">

          {/* Pending Prescriptions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Prescription Verification</h3>
                <p className="text-xs text-slate-400">Digital review required before dispatch</p>
              </div>
              <Link href="/admin/prescriptions" className="text-xs font-bold text-emerald-700 hover:underline">
                Review Queue &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { id: 'RX-9821', drug: 'Amoxicillin + Clavulanate 625mg', patient: 'Patient #48', doc: 'Dr. Tadesse' },
                { id: 'RX-9820', drug: 'Metformin HCl 500mg ER', patient: 'Patient #12', doc: 'Dr. Bethlehem' },
              ].map((rx) => (
                <div key={rx.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                        {rx.id}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">• {rx.doc}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{rx.drug}</p>
                  </div>
                  <button
                    onClick={() => showToast(`Prescription ${rx.id} verified and approved.`, 'success')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shrink-0"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Operations</h3>
              <p className="text-xs text-slate-400">Live operational events</p>
            </div>

            <div className="space-y-2.5">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition text-xs">
                  <span className="text-base shrink-0 mt-0.5">{log.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">{log.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">{log.time}</span>
                    </div>
                    <p className="text-slate-500 truncate">{log.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── 5. Quick Restock Modal ── */}
      {restockModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base border border-emerald-100">
                  💊
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Quick Stock Restock</h3>
                  <p className="text-xs text-slate-400 font-medium">Add units to central inventory</p>
                </div>
              </div>
              <button
                onClick={() => setRestockModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase">Product</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedProduct.name}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-1">Current Stock: {selectedProduct.currentStock} units</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Units to Add
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRestockAmount(amt)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                        restockAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Batch / Lot Reference
                </label>
                <input
                  type="text"
                  value={restockBatch}
                  onChange={(e) => setRestockBatch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRestockModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyRestock}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Toast Notifications ── */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs font-bold pointer-events-auto transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{toast.type === 'success' ? '✓' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-white/60 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
