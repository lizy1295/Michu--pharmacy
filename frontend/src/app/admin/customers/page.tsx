'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getCustomers, getCustomerStats, updateCustomer, deleteCustomer, Customer, CustomerStats } from '@/lib/api/admin';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [error, setError] = useState('');

  const fetchCustomersData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [list, statsData] = await Promise.all([
        getCustomers(),
        getCustomerStats().catch(() => null),
      ]);
      setCustomers(list || []);
      if (statsData) setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomersData();
  }, [fetchCustomersData]);

  const handleToggleStatus = async (customer: Customer) => {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    try {
      await updateCustomer(customer.id, { status: newStatus });
      setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, status: newStatus } : c));
    } catch (err: any) {
      alert(err.message || 'Failed to update customer status');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    try {
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete customer');
    }
  };

  const filtered = customers.filter(c => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Customer Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage registered pharmacy patients, customer profiles & account status</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl border border-emerald-100">
            👥
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Customers</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.total ?? customers.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl border border-teal-100">
            ✅
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Accounts</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {stats?.active ?? customers.filter(c => c.status === 'active').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl border border-blue-100">
            ✨
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">New This Month</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.newThisMonth ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 transition"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'active', 'inactive'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="text-left py-3.5 px-4">Customer</th>
                  <th className="text-left py-3.5 px-4">Contact</th>
                  <th className="text-left py-3.5 px-4">Joined Date</th>
                  <th className="text-left py-3.5 px-4">Status</th>
                  <th className="text-right py-3.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {customer.name ? customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{customer.name || 'Unnamed User'}</p>
                          <p className="text-xs text-slate-400 font-mono">ID: #{customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-800 font-medium text-xs">{customer.email}</p>
                      <p className="text-xs text-slate-400">{customer.phone || 'No phone'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(customer)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border transition ${
                          customer.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {customer.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Customer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <p className="font-semibold text-slate-700">No customers found.</p>
            <p className="text-xs text-slate-400 mt-1">When users register on the mobile app or web shop, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
