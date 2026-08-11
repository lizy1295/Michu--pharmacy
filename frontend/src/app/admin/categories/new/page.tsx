'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

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
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories" className="p-2 rounded-xl border border-emerald-700/30 text-emerald-400 hover:bg-emerald-800/30 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Add Category</h1>
            <p className="text-sm text-emerald-300/80 mt-1">Create a new product category</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-emerald-700/30 p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-emerald-200 mb-2">Category Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }));
              }}
              required
              className="w-full rounded-xl border border-emerald-700/50 bg-slate-900/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white placeholder:text-emerald-400"
              placeholder="e.g. Medicine"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-200 mb-2">Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
              className="w-full rounded-xl border border-emerald-700/50 bg-slate-900/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white placeholder:text-emerald-400"
              placeholder="e.g. medicine"
            />
            <p className="text-xs text-emerald-400 mt-1">URL-friendly identifier</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-200 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-emerald-700/50 bg-slate-900/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white placeholder:text-emerald-400 resize-none"
              placeholder="Brief description of this category..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-xl border border-emerald-700/50 bg-slate-900/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-emerald-500 outline-none text-emerald-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-xl border border-emerald-700/50 bg-slate-900/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/admin/categories"
              className="px-6 py-2.5 rounded-xl border border-emerald-700/30 text-emerald-300 text-sm font-medium hover:bg-emerald-800/30 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition disabled:opacity-50 shadow-lg shadow-emerald-900/50"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
