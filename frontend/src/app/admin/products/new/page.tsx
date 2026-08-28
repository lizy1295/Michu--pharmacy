'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createProduct, uploadProductImage, getImageUrl } from '@/lib/api/admin';

export default function AdminProductsNewPage() {
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
    expiryDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid image type. Only JPG, JPEG, PNG, and WEBP are allowed.');
      return;
    }

    // Validate file size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const result = await uploadProductImage(file);
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createProduct({
        name: formData.name,
        brand: formData.brand || undefined,
        category: formData.category || undefined,
        description: formData.description || undefined,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        prescriptionRequired: formData.prescriptionRequired,
        status: formData.status as 'active' | 'inactive',
        imageUrl: formData.imageUrl || undefined,
        expiryDate: formData.expiryDate || undefined,
      });
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Add New Product</h1>
            <p className="text-sm text-slate-500 mt-0.5">Create a new item in your pharmacy catalog</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 transition"
                  placeholder="e.g. Panadol Extra 500mg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 transition"
                  placeholder="e.g. GSK Ethiopia"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
                >
                  <option value="">Select category...</option>
                  <option value="Medicines">Medicines</option>
                  <option value="Cosmetics">Cosmetics</option>
                  <option value="Supplements">Supplements</option>
                  <option value="Medical Devices">Medical Devices</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Baby Care">Baby Care</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Price (ETB) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 transition"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 transition"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800 font-medium transition"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/40 transition">
                <input
                  type="checkbox"
                  checked={formData.prescriptionRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, prescriptionRequired: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900">Prescription Required</span>
                  <p className="text-xs text-slate-500">Check if customers must upload a prescription to buy this product</p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 resize-none transition"
                placeholder="Enter detailed medicine usage, dosage, active ingredients..."
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Product Image</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Primary Product Image</label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
                  {formData.imageUrl ? (
                    <img src={getImageUrl(formData.imageUrl) as string} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition disabled:opacity-50"
                  />
                  <p className="text-xs text-slate-400">JPG, JPEG, PNG, or WEBP. Max 5 MB.</p>
                  {uploading && <p className="text-xs text-emerald-600 font-semibold">Uploading...</p>}
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition shadow-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50 shadow-md shadow-emerald-600/20"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
  );
}