'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCategoryById, updateCategory } from '@/lib/api/admin';

export default function AdminCategoriesEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active',
    displayOrder: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategoryById(Number(id));
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          status: data.status || 'active',
          displayOrder: data.displayOrder || 0,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch category');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await updateCategory(Number(id), formData);
      router.push('/admin/categories');
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-700/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Category</h1>
          <p className="text-sm text-slate-500 mt-0.5">Update category information for #{id}</p>
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
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
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
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 resize-none"
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
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50 shadow-md shadow-emerald-600/20"
          >
            {saving ? 'Saving...' : 'Update Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
