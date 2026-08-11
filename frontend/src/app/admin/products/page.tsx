'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { getProductsFiltered, deleteProduct, Product } from '@/lib/api/admin';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('table');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProductsFiltered({
        search,
        category: categoryFilter,
        status: statusFilter,
        page,
        limit: 20,
      });
      setProducts(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Products Catalog</h1>
            <p className="text-sm text-slate-500 mt-1">Manage pharmacy medicines, supplements, cosmetics, and medical inventory</p>
          </div>
          <Link href="/admin/products/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:from-emerald-700 hover:to-emerald-800 transition shadow-md shadow-emerald-600/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Add New Product
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name or brand..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 transition"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-medium">
              <option value="">All Categories</option>
              <option value="Medicine">Medicine</option>
              <option value="Supplement">Supplement</option>
              <option value="Cosmetic">Cosmetic</option>
              <option value="Medical Devices">Medical Devices</option>
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-medium">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-0.5">
              <button type="button" onClick={() => setView('table')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${view === 'table' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>Table</button>
              <button type="button" onClick={() => setView('grid')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${view === 'grid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>Grid</button>
            </div>
            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition shadow-xs">Search</button>
          </form>
        </div>

        {view === 'table' ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="text-left py-3.5 px-4">Product Name</th>
                    <th className="text-left py-3.5 px-4">Brand</th>
                    <th className="text-left py-3.5 px-4">Category</th>
                    <th className="text-left py-3.5 px-4">Price</th>
                    <th className="text-left py-3.5 px-4">Stock</th>
                    <th className="text-left py-3.5 px-4">Status</th>
                    <th className="text-right py-3.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100">
                            💊
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-400 font-medium">SKU ID: #{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{product.brand || 'N/A'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                          {product.category || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">ETB {parseFloat(product.price).toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${product.stock < 10 ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100' : 'text-slate-700'}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${product.status === 'active' || !product.status ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {product.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/products/${product.id}`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition" title="View Details">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </Link>
                          <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition" title="Edit Product">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Link>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition" title="Delete Product">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {products.length === 0 && !loading && (
              <div className="p-12 text-center text-slate-500">
                <p className="font-semibold text-slate-700">No products match your filters.</p>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50 shadow-xs"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-slate-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50 shadow-xs"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="aspect-video rounded-xl bg-slate-50 mb-3 flex items-center justify-center text-3xl border border-slate-100 overflow-hidden relative">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : '💊'}
                  </div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{product.brand || 'Michu Pharmacy'}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-extrabold text-emerald-700 text-base">ETB {parseFloat(product.price).toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${product.status === 'active' || !product.status ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {product.status || 'active'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <Link href={`/admin/products/${product.id}`} className="flex-1 text-center py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">View</Link>
                  <Link href={`/admin/products/${product.id}/edit`} className="flex-1 text-center py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
