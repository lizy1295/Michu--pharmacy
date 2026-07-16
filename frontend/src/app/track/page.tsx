'use client';

import { useState } from 'react';
import Link from 'next/link';

const MOCK_ORDERS: Record<string, {
  id: string;
  date: string;
  status: 'Processing' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Ready for Pickup';
  items: { name: string; qty: number; price: number }[];
  total: number;
  deliveryMethod: 'Home Delivery' | 'Store Pickup';
  branch?: string;
  timeline: { status: string; date: string; note: string }[];
}> = {
  'MPH-998-1002': {
    id: 'MPH-998-1002',
    date: 'July 10, 2026',
    status: 'Out for Delivery',
    deliveryMethod: 'Home Delivery',
    total: 1127.00,
    items: [
      { name: '3D white charcoal whitening Tp', qty: 1, price: 500 },
      { name: '(Exedexe) Dextromethorphan syrup', qty: 2, price: 240 },
    ],
    timeline: [
      { status: 'Order Placed', date: 'July 10, 10:30 AM', note: 'Order received and confirmed via SMS.' },
      { status: 'Payment Verified', date: 'July 10, 10:32 AM', note: 'Payment confirmed via CBE Birr.' },
      { status: 'Packed', date: 'July 10, 11:15 AM', note: 'Order packed at Ayat Branch warehouse.' },
      { status: 'Out for Delivery', date: 'July 10, 12:00 PM', note: 'Rider dispatched. ETA: 1.5 hours.' },
    ],
  },
  'MPH-872-9112': {
    id: 'MPH-872-9112',
    date: 'June 18, 2026',
    status: 'Delivered',
    deliveryMethod: 'Store Pickup',
    branch: 'Ayat Branch',
    total: 402.50,
    items: [
      { name: 'Michu Daily Multi-Vitamin', qty: 1, price: 350 },
    ],
    timeline: [
      { status: 'Order Placed', date: 'June 18, 09:00 AM', note: 'Order placed via website.' },
      { status: 'Packed', date: 'June 18, 09:45 AM', note: 'Ready for pickup at Ayat Branch.' },
      { status: 'Ready for Pickup', date: 'June 18, 10:00 AM', note: 'Customer notified via SMS.' },
      { status: 'Delivered', date: 'June 18, 02:30 PM', note: 'Picked up by customer.' },
    ],
  },
};

const STATUS_COLORS: Record<string, string> = {
  'Processing': 'bg-gray-100 text-gray-700 border-gray-200',
  'Packed': 'bg-brand-50 text-brand-700 border-brand-100',
  'Out for Delivery': 'bg-blue-50 text-blue-700 border-blue-100',
  'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Ready for Pickup': 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function TrackPage() {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<(typeof MOCK_ORDERS)[string] | null>(null);
  const [error, setError] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    const trimmed = orderId.trim().toUpperCase();
    if (MOCK_ORDERS[trimmed]) {
      setResult(MOCK_ORDERS[trimmed]);
    } else {
      setError('Order not found. Please check your order ID and try again. Try MPH-998-1002 for a demo.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-brand-600 text-xs font-bold uppercase tracking-wider">Track Your Order</span>
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mt-2">Order Status</h1>
        <p className="text-sm text-neutral-500 mt-3">Enter your order ID to see real-time updates on your delivery or pickup status.</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleTrack} className="bg-white border rounded-3xl p-6 shadow-sm mb-8">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Order ID</label>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. MPH-998-1002"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
          <button type="submit" className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3 text-sm transition shadow-sm">
            Track
          </button>
        </div>
        {error && <p className="text-red-600 text-xs font-medium mt-2">{error}</p>}
      </form>

      {/* Result */}
      {result && (
        <div className="bg-white border rounded-3xl p-6 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b mb-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">{result.id}</h2>
              <p className="text-xs text-gray-500">Placed on {result.date}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${STATUS_COLORS[result.status]}`}>
              {result.status}
            </span>
          </div>

          {/* Timeline */}
          <div className="space-y-4 mb-6">
            {result.timeline.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${idx === result.timeline.length - 1 ? 'bg-brand-600 border-brand-600' : 'bg-gray-200 border-gray-300'}`}></div>
                  {idx < result.timeline.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-bold text-neutral-800">{step.status}</p>
                  <p className="text-xs text-gray-500">{step.date}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{step.note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Items */}
          <div className="border-t pt-4 space-y-2">
            {result.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name} &times; {item.qty}</span>
                <span className="font-bold text-neutral-800">{item.price.toFixed(2)} ETB</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t">
              <span>Total</span>
              <span>{result.total.toFixed(2)} ETB</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/products" className="rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 text-sm transition">
              Continue Shopping
            </Link>
            <Link href="/account" className="rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 text-sm transition">
              View All Orders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
