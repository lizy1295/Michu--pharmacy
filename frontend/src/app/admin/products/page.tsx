'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getProductsFiltered, deleteProduct, Product, getImageUrl, getCategories } from '@/lib/api/admin';

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([
    'Medicines',
    'Cosmetics',
    'Supplements',
    'Medical Devices',
    'Personal Care',
    'Baby Care',
  ]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [prescriptionFilter, setPrescriptionFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories()
      .then(cats => {
        if (cats && cats.length > 0) {
          const names = cats.map(c => c.name);
          setCategoriesList(prev => Array.from(new Set([...prev, ...names])));
        }
      })
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProductsFiltered({
        search: search || undefined,
        brand: brandFilter || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        prescriptionRequired: prescriptionFilter === 'true' ? true : prescriptionFilter === 'false' ? false : undefined,
        page,
        limit: 20,
      });
      let items = data.data;
      // Client-side sorting since the API doesn't support sort params
      if (sortBy) {
        items = [...items].sort((a, b) => {
          let valA: any, valB: any;
          switch (sortBy) {
            case 'name':
              valA = a.name?.toLowerCase() ?? '';
              valB = b.name?.toLowerCase() ?? '';
              break;
            case 'price':
              valA = parseFloat(String(a.price)) || 0;
              valB = parseFloat(String(b.price)) || 0;
              break;
            case 'stock':
              valA = a.stock || 0;
              valB = b.stock || 0;
              break;
            case 'createdAt':
            default:
              valA = new Date(a.createdAt).getTime() || 0;
              valB = new Date(b.createdAt).getTime() || 0;
              break;
          }
          if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }
      // Client-side stock filter
      if (stockFilter === 'in-stock') {
        items = items.filter(p => p.stock > 0);
      } else if (stockFilter === 'out-of-stock') {
        items = items.filter(p => p.stock === 0);
      } else if (stockFilter === 'low-stock') {
        items = items.filter(p => p.stock > 0 && p.stock < 10);
      }
      setProducts(items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [search, brandFilter, categoryFilter, statusFilter, prescriptionFilter, stockFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const totalPages = Math.ceil(total / 20);

  const SortIcon = ({ field }: { field: string }) => (
    <span className="inline-flex ml-1">
      {sortBy === field ? (
        sortOrder === 'asc' ? '↑' : '↓'
      ) : (
        <span className="text-slate-300">↕</span>
      )}
    </span>
  );

  return (
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

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 transition"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              value={brandFilter}
              onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
              placeholder="Search by brand..."
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-medium transition"
            />
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-medium">
              <option value="">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-medium">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-medium">
              <option value="">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock {'<10'}</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <select value={prescriptionFilter} onChange={(e) => { setPrescriptionFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-medium">
              <option value="">All Prescriptions</option>
              <option value="true">Rx Required</option>
              <option value="false">No Rx</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-700 font-medium">
              <option value="createdAt">Sort: Date</option>
              <option value="name">Sort: Name</option>
              <option value="price">Sort: Price</option>
              <option value="stock">Sort: Stock</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition"
              title="Toggle sort order"
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
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
                    <th className="text-left py-3.5 px-4">Product</th>
                    <th className="text-left py-3.5 px-4 cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('name')}>Name <SortIcon field="name" /></th>
                    <th className="text-left py-3.5 px-4">Brand</th>
                    <th className="text-left py-3.5 px-4">Category</th>
                    <th className="text-left py-3.5 px-4 cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('price')}>Price <SortIcon field="price" /></th>
                    <th className="text-left py-3.5 px-4 cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('stock')}>Stock <SortIcon field="stock" /></th>
                    <th className="text-left py-3.5 px-4">Rx</th>
                    <th className="text-left py-3.5 px-4">Status</th>
                    <th className="text-left py-3.5 px-4 cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('createdAt')}>Created <SortIcon field="createdAt" /></th>
                    <th className="text-right py-3.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          {product.imageUrl ? (
                            <img src={getImageUrl(product.imageUrl) as string} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">💊</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-400 font-medium">ID: #{product.id}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{product.brand || 'N/A'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                          {product.category || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">ETB {parseFloat(String(product.price)).toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${product.stock === 0 ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100' : product.stock < 10 ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100' : 'text-slate-700'}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {product.prescriptionRequired ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">Rx</span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">No</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${product.status === 'active' || !product.status ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {product.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                        {new Date(product.createdAt).toLocaleDateString()}
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
                    {product.imageUrl ? <img src={getImageUrl(product.imageUrl) as string} alt={product.name} className="w-full h-full object-cover" /> : '💊'}
                    {product.prescriptionRequired && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">Rx</span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{product.brand || 'Michu Pharmacy'}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-extrabold text-emerald-700 text-base">ETB {parseFloat(String(product.price)).toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${product.status === 'active' || !product.status ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {product.status || 'active'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className={`font-bold ${product.stock === 0 ? 'text-rose-600' : product.stock < 10 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {product.stock} units
                    </span>
                    <span className="text-slate-400">{new Date(product.createdAt).toLocaleDateString()}</span>
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
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-semibold">Loading products catalog...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}