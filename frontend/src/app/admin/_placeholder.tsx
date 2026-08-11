'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';

export default function AdminPlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Admin Module Overview
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500 mt-1">{description || 'Pharmacy administrative management hub.'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              &larr; Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100">
              📊
            </div>
            <h3 className="text-sm font-bold text-slate-900">Module Metrics</h3>
            <p className="text-xs text-slate-500">Automated tracking, live status reporting, and export controls for {title.toLowerCase()}.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
              ⚡
            </div>
            <h3 className="text-sm font-bold text-slate-900">Fast Operations</h3>
            <p className="text-xs text-slate-500">Quick action buttons, filter options, and bulk edit shortcuts designed for pharmacy staff.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg border border-purple-100">
              🔒
            </div>
            <h3 className="text-sm font-bold text-slate-900">Role Permissions</h3>
            <p className="text-xs text-slate-500">Super Admin and Pharmacist level permission restrictions enforced on sensitive data.</p>
          </div>
        </div>

        {/* Mock Activity Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl mx-auto shadow-xs">
            🏥
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">{title} Management Suite</h3>
            <p className="text-xs text-slate-500">
              All backend endpoints for {title.toLowerCase()} are active and linked to Michu Pharmacy database.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm">
              Refresh Module Data
            </button>
            <Link href="/admin/settings" className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition">
              Module Settings
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
