'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastLogin: string | null;
  emailVerified: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function formatDate(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString('en-ET', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(n: number): string {
  return `ETB ${n.toLocaleString()}`;
}

export default function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/customers/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error();
        setCustomer(await res.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm font-medium">Loading customer...</span>
        </div>
      </div>
    );
  }

  if (notFound || !customer) {
    return (
      <div className="space-y-4">
        <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          Back to Customers
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-400 font-semibold">Customer #{id} not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{customer.name}</h1>
          <p className="text-sm text-slate-500">Customer #{customer.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{customer.name}</p>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center justify-center gap-1">
              {customer.email}
              {customer.emailVerified && (
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              )}
            </p>
            {customer.phone && <p className="text-sm text-slate-500 mt-0.5">{customer.phone}</p>}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${customer.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            {customer.status === 'active' ? '● Active' : '⏸ Inactive'}
          </span>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Total Orders', value: customer.totalOrders, icon: '📦' },
            { label: 'Total Spent', value: formatCurrency(customer.totalSpent), icon: '💰' },
            { label: 'Member Since', value: formatDate(customer.createdAt), icon: '📅' },
            { label: 'Last Login', value: formatDate(customer.lastLogin), icon: '🔐' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-lg font-extrabold text-slate-900 leading-tight">{s.value}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order history placeholder */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Order History</h2>
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
          <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-sm font-semibold">
            {customer.totalOrders > 0 ? `${customer.totalOrders} orders — details coming soon` : 'No orders yet'}
          </p>
        </div>
      </div>
    </div>
  );
}
