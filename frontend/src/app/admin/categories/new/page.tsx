'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createCategory } from '@/lib/api/admin';

export default function AdminCategoriesNewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active',
    displayOrder: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createCategory(formData);
      router.push('/admin/categories');
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Add New Category</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create a product classification group</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData(prev => ({ ...prev, name, slug: generateSlug(name) }));
            }}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400"
            placeholder="e.g. Antibiotics"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Slug *</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 font-mono text-xs"
            placeholder="e.g. antibiotics"
          />
          <p className="text-xs text-slate-400 mt-1">Unique URL-safe identifier for routing</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 resize-none"
            placeholder="Description of the pharmaceutical or wellness category..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Display Order</label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/categories"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50 shadow-md shadow-emerald-600/20"
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
