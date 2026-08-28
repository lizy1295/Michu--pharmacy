'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProductById, deleteProduct, Product, getImageUrl } from '@/lib/api/admin';

export default function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(Number(id));
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(Number(id));
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-700/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">{error || 'Product not found'}</p>
        <Link href="/admin/products" className="text-emerald-600 hover:underline mt-4 inline-block">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{product.name}</h1>
              <p className="text-sm text-slate-500 mt-0.5">Product Details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
            >
              Edit Product
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="aspect-video bg-slate-50 flex items-center justify-center">
            {product.imageUrl ? (
              <img src={getImageUrl(product.imageUrl) as string} alt={product.name} className="w-full h-full object-contain p-8" />
            ) : (
              <div className="text-6xl">💊</div>
            )}
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Product Name</p>
                <p className="text-slate-900 font-medium">{product.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Brand</p>
                <p className="text-slate-900 font-medium">{product.brand || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</p>
                <p className="text-slate-900 font-medium">{product.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price</p>
                <p className="text-slate-900 font-medium text-lg">ETB {parseFloat(String(product.price)).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Stock</p>
                <p className={`font-medium ${product.stock < 10 ? 'text-rose-600' : 'text-slate-900'}`}>{product.stock} units</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${product.status === 'active' || !product.status ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {product.status || 'active'}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prescription Required</p>
                <p className="text-slate-900 font-medium">{product.prescriptionRequired ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry Date</p>
                <p className="text-slate-900 font-medium">{product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Created At</p>
                <p className="text-slate-900 font-medium">{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {product.description && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</p>
                <p className="text-slate-700 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attributes</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.attributes).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-xs text-slate-500">{key.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="text-slate-900 text-sm font-medium">{String(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}