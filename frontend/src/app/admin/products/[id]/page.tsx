'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/api/admin';
import { MOCK_CATEGORIES } from '@/lib/admin/mock-data';

export default function AdminProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${params.id}`, { method: 'DELETE' });
      router.push('/admin/products');
    } catch (err) {
      console.error('Failed to delete product:', err);
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

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <p className="text-emerald-400">Product not found</p>
          <Link href="/admin/products" className="text-emerald-500 hover:underline mt-4 inline-block">Back to Products</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 rounded-xl border border-emerald-700/30 text-emerald-400 hover:bg-emerald-800/30 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{product.name}</h1>
              <p className="text-sm text-emerald-300/80 mt-1">Product Details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/50"
            >
              Edit Product
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-emerald-700/30 overflow-hidden">
          <div className="aspect-video bg-slate-900/50 flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-8" />
            ) : (
              <div className="text-6xl">💊</div>
            )}
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">Product Name</p>
                <p className="text-white font-medium">{product.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">Brand</p>
                <p className="text-white font-medium">{product.brand || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">Category</p>
                <p className="text-white font-medium">{product.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">Price</p>
                <p className="text-white font-medium text-lg">ETB {parseFloat(product.price).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">Stock</p>
                <p className={`font-medium ${product.stock < 10 ? 'text-red-400' : 'text-white'}`}>{product.stock} units</p>
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">Status</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${product.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-700/50 text-slate-300 border-slate-600/30'}`}>
                  {product.status || 'active'}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">Prescription Required</p>
                <p className="text-white font-medium">{product.prescriptionRequired ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">Created At</p>
                <p className="text-white font-medium">{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {product.description && (
              <div>
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">Description</p>
                <p className="text-emerald-200 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div>
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">Attributes</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.attributes).map(([key, val]) => (
                    <div key={key} className="bg-slate-900/50 rounded-xl p-3 border border-emerald-700/20">
                      <p className="text-xs text-emerald-400">{key.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="text-white text-sm font-medium">{String(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
