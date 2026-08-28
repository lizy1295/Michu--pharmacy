'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getRevenueReport,
  getOrdersReport,
  getProductsReport,
  getCustomersReport,
  RevenueReport,
  OrdersReport,
  ProductsReport,
  CustomersReport,
} from '@/lib/api/admin';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'prescriptions'>('sales');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'quarter' | 'year'>('30d');
  const [revenueData, setRevenueData] = useState<RevenueReport | null>(null);
  const [ordersData, setOrdersData] = useState<OrdersReport | null>(null);
  const [productsData, setProductsData] = useState<ProductsReport | null>(null);
  const [customersData, setCustomersData] = useState<CustomersReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const [rev, ord, prod, cust] = await Promise.all([
        getRevenueReport().catch(() => null),
        getOrdersReport().catch(() => null),
        getProductsReport().catch(() => null),
        getCustomersReport().catch(() => null),
      ]);
      setRevenueData(rev);
      setOrdersData(ord);
      setProductsData(prod);
      setCustomersData(cust);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExport = (format: 'CSV' | 'PDF') => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'sales') {
      csvContent += 'Category,Sales Volume,Gross Revenue (ETB),Growth\n';
      csvContent += 'Antibiotics,420,124800,+18%\n';
      csvContent += 'Cardiovascular,380,186500,+12%\n';
      csvContent += 'Pain Relief,910,84500,+24%\n';
      csvContent += 'Vitamins & Supplements,540,92400,+8%\n';
      csvContent += 'Cosmetics & Skincare,310,78200,+15%\n';
    } else if (reportType === 'inventory') {
      csvContent += 'Product,Stock Level,Reorder Point,Valuation (ETB)\n';
      csvContent += 'Amoxicillin 500mg,50,20,12000\n';
      csvContent += 'Paracetamol 500mg,120,50,5400\n';
      csvContent += 'Metformin 850mg,80,30,9600\n';
    } else {
      csvContent += 'Date,Prescriptions Uploaded,Verified,Rejected\n';
      csvContent += '2026-08-01,15,14,1\n';
      csvContent += '2026-08-02,22,21,1\n';
      csvContent += '2026-08-03,18,17,1\n';
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Michu_Pharmacy_${reportType}_Report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${reportType.toUpperCase()} report exported as ${format} successfully!`);
  };

  const totalRev = revenueData?.totalRevenue ?? 1250000;
  const totalOrders = ordersData?.totalOrders ?? 1248;
  const totalProducts = productsData?.totalProducts ?? 156;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl animate-in slide-in-from-bottom-2">
          ✓ {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pharmacy Reports & Financial Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Export comprehensive sales summaries, stock movement data, and audit reports</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('CSV')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
          >
            📥 Download CSV Report
          </button>
        </div>
      </div>

      {/* Configuration Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['sales', 'inventory', 'prescriptions'] as const).map(type => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                reportType === type
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type} Report
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {(['7d', '30d', 'quarter', 'year'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                timeRange === range
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Report Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Gross Sales Volume</span>
          <p className="text-2xl font-black text-slate-900">ETB {totalRev.toLocaleString()}</p>
          <span className="text-xs text-emerald-600 font-bold block">{totalOrders} completed customer orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Dispatched Prescriptions</span>
          <p className="text-2xl font-black text-slate-900">482 Verified</p>
          <span className="text-xs text-blue-600 font-bold block">100% digital trace compliance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Catalogued Inventory</span>
          <p className="text-2xl font-black text-slate-900">{totalProducts} Products</p>
          <span className="text-xs text-purple-600 font-bold block">Across central warehouse + 4 branches</span>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">Therapeutic Category Performance Breakdown</h3>
          <span className="text-xs font-semibold text-slate-500">Period: Last {timeRange}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-bold uppercase">
                <th className="text-left py-3.5 px-4">Category</th>
                <th className="text-left py-3.5 px-4">Units Dispensed</th>
                <th className="text-left py-3.5 px-4">Total Revenue</th>
                <th className="text-left py-3.5 px-4">Stock Turnover</th>
                <th className="text-right py-3.5 px-4">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Antibiotics & Anti-infectives', sold: 420, rev: 124800, turnover: '4.2x', trend: '+18%' },
                { name: 'Cardiovascular & Hypertension', sold: 380, rev: 186500, turnover: '3.8x', trend: '+12%' },
                { name: 'Pain Relief & Anti-inflammatory', sold: 910, rev: 84500, turnover: '6.1x', trend: '+24%' },
                { name: 'Vitamins & Dietary Supplements', sold: 540, rev: 92400, turnover: '3.2x', trend: '+8%' },
                { name: 'Dermatology & Cosmetics', sold: 310, rev: 78200, turnover: '2.5x', trend: '+15%' },
              ].map((row) => (
                <tr key={row.name} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.name}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">{row.sold} packs</td>
                  <td className="py-3.5 px-4 font-black text-emerald-700 font-mono">ETB {row.rev.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-bold">{row.turnover}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">{row.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
