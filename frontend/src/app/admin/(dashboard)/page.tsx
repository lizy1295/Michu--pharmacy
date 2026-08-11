'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { getDashboardStats, getTopProducts, getRecentCustomers, getRevenue, DashboardStats, TopProduct, RecentCustomer } from '@/lib/api/admin';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [revenueData, setRevenueData] = useState<{ labels: string[]; values: number[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, products, customers, revenue] = await Promise.all([
          getDashboardStats(),
          getTopProducts(5),
          getRecentCustomers(5),
          getRevenue(),
        ]);
        setStats(statsData);
        setTopProducts(products);
        setRecentCustomers(customers);
        setRevenueData(revenue);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header section with quick welcome banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-700/15 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-emerald-100 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              Live Pharmacy Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back, Super Admin</h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              Here is your daily pharmacy operations overview. Track orders, manage inventory, and monitor revenue in real time.
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800/40 hover:bg-emerald-800/60 border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition backdrop-blur-md"
            >
              Manage Orders
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse shadow-xs">
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-slate-100 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : stats && (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: '💰', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', trend: '+14.2% vs last mo' },
                { label: "Today's Orders", value: stats.todayOrders.toString(), icon: '📦', color: 'bg-blue-50 text-blue-700 border-blue-100', trend: 'Active today' },
                { label: 'Total Products', value: stats.totalProducts.toString(), icon: '💊', color: 'bg-purple-50 text-purple-700 border-purple-100', trend: 'In catalog' },
                { label: 'Registered Customers', value: stats.totalCustomers.toString(), icon: '👥', color: 'bg-teal-50 text-teal-700 border-teal-100', trend: '+8 new this week' },
                { label: 'Prescriptions', value: stats.totalPrescriptions.toString(), icon: '📋', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', trend: 'Awaiting review' },
                { label: 'Pending Orders', value: stats.pendingOrders.toString(), icon: '⏳', color: 'bg-amber-50 text-amber-700 border-amber-100', trend: 'Needs dispatch' },
                { label: 'Out of Stock', value: stats.outOfStock.toString(), icon: '⚠️', color: 'bg-rose-50 text-rose-700 border-rose-100', trend: 'Requires restock' },
                { label: 'Products Sold', value: stats.productsSold.toLocaleString(), icon: '🛒', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', trend: 'Total volume' },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{card.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${card.color} shadow-xs shrink-0`}>
                      {card.icon}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{card.trend}</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      Details &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Revenue Overview</h3>
                    <p className="text-xs text-slate-500">Monthly revenue growth trend</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                    2026 Financial Year
                  </span>
                </div>
                {revenueData && (
                  <div className="h-60 flex items-end gap-2.5 pt-4">
                    {revenueData.values.map((value, idx) => {
                      const max = Math.max(...revenueData.values);
                      const height = (value / max) * 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            {(value / 1000).toFixed(0)}k
                          </div>
                          <div className="w-full bg-emerald-50 rounded-t-xl relative overflow-hidden" style={{ height: `${height}%`, minHeight: '8px' }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl group-hover:from-emerald-700 group-hover:to-emerald-500 transition-colors"></div>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500">{revenueData.labels[idx]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                    <span className="text-slate-600 font-medium">Total Accumulated Revenue:</span>
                  </div>
                  <span className="text-slate-900 font-extrabold text-sm">{formatCurrency(stats.totalRevenue)}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Orders Traffic This Week</h3>
                    <p className="text-xs text-slate-500">Daily processed orders volume</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                    Weekly Activity
                  </span>
                </div>
                <div className="h-60 flex items-end gap-3 pt-4">
                  {[
                    { day: 'Mon', value: 65 },
                    { day: 'Tue', value: 59 },
                    { day: 'Wed', value: 80 },
                    { day: 'Thu', value: 81 },
                    { day: 'Fri', value: 56 },
                    { day: 'Sat', value: 95 },
                    { day: 'Sun', value: 70 },
                  ].map((item) => {
                    const max = 100;
                    const height = (item.value / max) * 100;
                    return (
                      <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.value}
                        </div>
                        <div className="w-full bg-blue-50 rounded-t-xl relative overflow-hidden" style={{ height: `${height}%`, minHeight: '8px' }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-teal-400 rounded-t-xl group-hover:from-blue-700 group-hover:to-teal-500 transition-colors"></div>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">{item.day}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    <span className="text-slate-600 font-medium">Average Daily Orders:</span>
                  </div>
                  <span className="text-slate-900 font-extrabold text-sm">72 Orders/day</span>
                </div>
              </div>
            </div>

            {/* Tables & Recent Customers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Best Selling Products */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Best-Selling Products</h3>
                    <p className="text-xs text-slate-500">Top revenue generating medicines & items</p>
                  </div>
                  <Link href="/admin/products" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                    View Catalog &rarr;
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold">
                        <th className="text-left py-3 px-4 rounded-l-xl">Product</th>
                        <th className="text-left py-3 px-4">Brand</th>
                        <th className="text-left py-3 px-4">Sold</th>
                        <th className="text-right py-3 px-4 rounded-r-xl">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-100">
                              💊
                            </div>
                            <span>{product.name}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">{product.brand}</td>
                          <td className="py-3 px-4 text-slate-700 font-semibold">{product.sold} units</td>
                          <td className="py-3 px-4 text-right font-extrabold text-emerald-700">{formatCurrency(product.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Customers */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Top Customers</h3>
                    <p className="text-xs text-slate-500">Highest value accounts</p>
                  </div>
                  <Link href="/admin/customers" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                    View All &rarr;
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200/60 shrink-0 shadow-xs">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{customer.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{customer.orders} orders placed</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-900 block">{formatCurrency(customer.spent)}</span>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">VIP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
