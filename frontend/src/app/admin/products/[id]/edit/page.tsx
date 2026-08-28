'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProductById, updateProduct, uploadProductImage, getImageUrl } from '@/lib/api/admin';

export default function AdminProductsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await getProductById(Number(id));
        setFormData({
          name: product.name || '',
          brand: product.brand || '',
          category: product.category || '',
          description: product.description || '',
          price: String(product.price ?? ''),
          stock: String(product.stock ?? ''),
          prescriptionRequired: product.prescriptionRequired ?? false,
          status: product.status || 'active',
          imageUrl: product.imageUrl || '',
          expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load product for editing');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid image type. Only JPG, JPEG, PNG, and WEBP are allowed.');
      return;
    }

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
    setSaving(true);
    setError('');

    try {
      await updateProduct(Number(id), {
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
      router.push(`/admin/products/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/products/${id}`} className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Product</h1>
          <p className="text-sm text-slate-500 mt-0.5">Update catalog details for #{id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Paracetamol 500mg Tablets"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Brand / Manufacturer</label>
              <input
                type="text"
                value={formData.brand}
                onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="e.g. GSK, Bayer, Novartis"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 bg-white"
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
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Dosage instructions, indications, package contents..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Pricing & Inventory</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Price (ETB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 bg-white"
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 bg-white"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="relative flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.prescriptionRequired}
                  onChange={e => setFormData(prev => ({ ...prev, prescriptionRequired: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-700">Prescription Required (Rx)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Product Image</h2>

          {formData.imageUrl ? (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <img src={getImageUrl(formData.imageUrl) as string} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-white" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">{formData.imageUrl}</p>
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-emerald-500 transition cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20">
                <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-semibold text-slate-700">
                  {uploading ? 'Uploading image...' : 'Click to upload or drag & drop image'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, or WEBP up to 5 MB</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`/admin/products/${id}`}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {saving ? 'Saving changes...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
