'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getProductsFiltered, updateProduct, Product } from '@/lib/api/admin';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out' | 'rx'>('all');
  const [search, setSearch] = useState('');
  const [restockModalProduct, setRestockModalProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(20);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProductsFiltered({ limit: 50, search: search || undefined });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const filteredProducts = products.filter(p => {
    if (filter === 'low') return p.stock > 0 && p.stock < 10;
    if (filter === 'out') return p.stock === 0;
    if (filter === 'rx') return p.prescriptionRequired;
    return true;
  });

  const handleApplyRestock = async () => {
    if (!restockModalProduct) return;
    const newStock = Number(restockModalProduct.stock || 0) + Number(restockQty);
    try {
      await updateProduct(restockModalProduct.id, { stock: newStock });
      setProducts(prev => prev.map(p => p.id === restockModalProduct.id ? { ...p, stock: newStock } : p));
      showToast(`Added ${restockQty} units to ${restockModalProduct.name}. Total: ${newStock} units.`);
      setRestockModalProduct(null);
    } catch (err) {
      showToast('Failed to update stock on server');
    }
  };

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Pharmacy Inventory & Stock Controls</h1>
            <p className="text-sm text-slate-500 mt-1">Track medicine stock quantities, expiration thresholds, and execute batch restocks</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
            >
              + Add Catalog Item
            </Link>
          </div>
        </div>

        {/* Quick Inventory Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <button
            onClick={() => setFilter('all')}
            className={`p-5 rounded-2xl border text-left transition ${filter === 'all' ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/30' : 'bg-white border-slate-200/80'}`}
          >
            <span className="text-xs font-bold uppercase text-slate-500">Total Units in Stock</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalStockUnits.toLocaleString()} units</p>
            <span className="text-xs text-emerald-700 font-semibold mt-2 block">Across {products.length} catalog items</span>
          </button>

          <button
            onClick={() => setFilter('low')}
            className={`p-5 rounded-2xl border text-left transition ${filter === 'low' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30' : 'bg-white border-slate-200/80'}`}
          >
            <span className="text-xs font-bold uppercase text-amber-700">Low Stock Alert (&lt;10)</span>
            <p className="text-2xl font-black text-amber-900 mt-1">{lowStockCount} items</p>
            <span className="text-xs text-amber-700 font-semibold mt-2 block">Requires replenishment order</span>
          </button>

          <button
            onClick={() => setFilter('out')}
            className={`p-5 rounded-2xl border text-left transition ${filter === 'out' ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/30' : 'bg-white border-slate-200/80'}`}
          >
            <span className="text-xs font-bold uppercase text-rose-700">Out of Stock (0 Units)</span>
            <p className="text-2xl font-black text-rose-900 mt-1">{outOfStockCount} items</p>
            <span className="text-xs text-rose-700 font-semibold mt-2 block">Temporarily unavailable for buyers</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search inventory by medicine name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {(['all', 'low', 'out', 'rx'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                  filter === t
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'all' ? 'All Items' : t === 'low' ? 'Low Stock' : t === 'out' ? 'Out of Stock' : 'Rx Required'}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-semibold">Loading live inventory database...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="text-left py-3.5 px-4">Medicine SKU</th>
                    <th className="text-left py-3.5 px-4">Category</th>
                    <th className="text-left py-3.5 px-4">Price (ETB)</th>
                    <th className="text-left py-3.5 px-4">Current Stock</th>
                    <th className="text-left py-3.5 px-4">Status</th>
                    <th className="text-right py-3.5 px-4">Interactive Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No products found matching active filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                              💊
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{product.name}</p>
                              <p className="text-xs text-slate-400">{product.brand || 'Michu Health'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">{product.category || 'General'}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">ETB {Number(product.price).toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                            product.stock === 0
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : product.stock < 10
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {product.prescriptionRequired ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Rx Controlled
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                              OTC Standard
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setRestockModalProduct(product);
                                setRestockQty(25);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                            >
                              + Quick Restock
                            </button>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                              title="Edit item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Interactive Restock Modal */}
        {restockModalProduct && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base">Restock Inventory</h3>
                <button onClick={() => setRestockModalProduct(null)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-800">{restockModalProduct.name}</p>
                <p className="text-xs text-slate-500">Current Stock: {restockModalProduct.stock} units</p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Units to Add</label>
                  <div className="flex gap-2 mb-3">
                    {[10, 25, 50, 100].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setRestockQty(amt)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                          restockQty === amt ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRestockModalProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyRestock}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Confirm & Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl animate-in slide-in-from-bottom-2">
            ✓ {toastMessage}
          </div>
        )}
      </div>
  );
}
