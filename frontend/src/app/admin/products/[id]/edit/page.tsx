'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_CATEGORIES } from '@/lib/admin/mock-data';

export default function AdminProductEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    prescriptionRequired: false,
    status: 'active',
    imageUrl: '',
    gallery: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || '',
            brand: data.brand || '',
            category: data.category || '',
            description: data.description || '',
            price: data.price || '',
            stock: data.stock?.toString() || '',
            prescriptionRequired: data.prescriptionRequired || false,
            status: data.status || 'active',
            imageUrl: data.imageUrl || '',
            gallery: data.gallery || [],
          });
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          gallery: [...prev.gallery, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          stock: parseInt(formData.stock) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      router.push(`/admin/products/${params.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-emerald-700/30 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/admin/products/${params.id}`} className="p-2 rounded-xl border border-emerald-700/30 text-emerald-400 hover:bg-emerald-800/30 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Product</h1>
            <p className="text-sm text-emerald-300/80 mt-1">Update product information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-emerald-700/30 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-emerald-700/30 pb-3">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-emerald-700/50 bg-slate-900/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full rounded-xl border border-emerald-700/50 bg-slate-900/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-emerald-700/50 bg-slate-900/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-emerald-500 outline-none text-emerald-200"
                >
                  <option value="">Select category</option>
                  {MOCK_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">Price (ETB) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-emerald-700/50 bg-slate-900/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full rounded-xl border border-emerald-700/50 bg-slate-900/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white"
                />
              </div>

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
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.prescriptionRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, prescriptionRequired: e.target.checked }))}
                  className="rounded border-emerald-600 text-emerald-500 focus:ring-emerald-500 w-5 h-5"
                />
                <span className="text-sm font-medium text-emerald-200">Prescription Required</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-emerald-700/50 bg-slate-900/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white resize-none"
              />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-emerald-700/30 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-emerald-700/30 pb-3">Media</h3>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">Product Image</label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-emerald-700/50 flex items-center justify-center overflow-hidden bg-slate-900/50">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-emerald-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/admin/products/${params.id}`}
              className="px-6 py-2.5 rounded-xl border border-emerald-700/30 text-emerald-300 text-sm font-medium hover:bg-emerald-800/30 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition disabled:opacity-50 shadow-lg shadow-emerald-900/50"
            >
              {saving ? 'Saving...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
