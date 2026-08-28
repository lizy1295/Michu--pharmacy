'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  Advertisement as ApiAdvertisement,
} from '@/lib/api/admin';

/* ── Types ──────────────────────────────────────────────── */
type AdType = 'banner' | 'popup' | 'story' | 'product_highlight';
type AdStatus = 'active' | 'paused' | 'scheduled' | 'ended' | 'published' | 'draft' | 'expired';

interface Advertisement {
  id: any;
  title: string;
  description: string;
  type: AdType;
  status: AdStatus;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  productName: string;
  productPrice: string;
  startDate: string;
  endDate: string;
  clicks: number;
  views: number;
  createdAt: string;
}

/* ── Seed data ──────────────────────────────────────────── */
const SEED_ADS: Advertisement[] = [
  {
    id: 'ad-1', title: 'የቴሌብር ክፍያ ቅናሽ', description: 'በቴሌብር ሲከፍሉ 15% ቅናሽ ያግኙ!',
    type: 'banner', status: 'active', mediaUrl: null, mediaType: null,
    productName: 'ሁሉም ምርቶች', productPrice: '15% ቅናሽ',
    startDate: '2026-08-01', endDate: '2026-08-31',
    clicks: 1240, views: 8900, createdAt: '2026-08-01',
  },
  {
    id: 'ad-2', title: 'አዲስ! ቪታሚን ሲ 1000mg', description: 'የበሽታ መከላከያ ያጠናክሩ — ልዩ የምርት ማስተዋወቂያ',
    type: 'product_highlight', status: 'active', mediaUrl: null, mediaType: null,
    productName: 'Vitamin C 1000mg (60 tabs)', productPrice: 'ETB 450',
    startDate: '2026-08-10', endDate: '2026-09-10',
    clicks: 560, views: 3200, createdAt: '2026-08-10',
  },
  {
    id: 'ad-3', title: 'ነፃ የደም ግፊት ምርመራ', description: 'በሚቹ ፋርማሲ ቅርንጫፎቻችን ነፃ ምርመራ ያግኙ',
    type: 'story', status: 'paused', mediaUrl: null, mediaType: null,
    productName: 'Health Service', productPrice: 'ነፃ',
    startDate: '2026-07-15', endDate: '2026-08-15',
    clicks: 220, views: 1500, createdAt: '2026-07-15',
  },
];

const AD_TYPE_LABELS: Record<AdType, string> = {
  banner: 'Banner',
  popup: 'Pop-up',
  story: 'Story',
  product_highlight: 'Product Highlight',
};

const STATUS_COLORS: Record<AdStatus, string> = {
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused:    'bg-amber-50 text-amber-700 border-amber-200',
  draft:     'bg-slate-100 text-slate-600 border-slate-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  ended:     'bg-slate-100 text-slate-500 border-slate-200',
  expired:   'bg-rose-50 text-rose-700 border-rose-200',
};

/* ── Upload zone ─────────────────────────────────────────── */
function UploadZone({
  value, onChange,
}: {
  value: { url: string; type: 'image' | 'video' } | null;
  onChange: (v: { url: string; type: 'image' | 'video' } | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    onChange({
      url,
      type: file.type.startsWith('video/') ? 'video' : 'image',
    });
  }, [onChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  if (value) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-200 bg-slate-50">
        {value.type === 'video' ? (
          <video src={value.url} controls className="w-full max-h-60 object-contain bg-black" />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={value.url} alt="Ad preview" className="w-full max-h-60 object-contain" />
        )}
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition shadow-lg"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold uppercase">
          {value.type}
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
        cursor-pointer transition-all py-10 px-4
        ${dragging ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/40'}
      `}
    >
      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-700">Drop image or video here</p>
        <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, GIF, MP4, MOV — up to 50MB</p>
      </div>
      <span className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition">
        Browse Files
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />
    </div>
  );
}

/* ── Create/Edit Modal ───────────────────────────────────── */
function AdModal({
  ad, onClose, onSave,
}: {
  ad: Advertisement | null;
  onClose: () => void;
  onSave: (data: Partial<Advertisement> & { mediaFile?: { url: string; type: 'image' | 'video' } | null }) => void;
}) {
  const isEdit = !!ad;
  const [title,       setTitle]       = useState(ad?.title ?? '');
  const [description, setDescription] = useState(ad?.description ?? '');
  const [type,        setType]        = useState<AdType>(ad?.type ?? 'banner');
  const [productName, setProductName] = useState(ad?.productName ?? '');
  const [productPrice,setProductPrice]= useState(ad?.productPrice ?? '');
  const [startDate,   setStartDate]   = useState(ad?.startDate ?? '');
  const [endDate,     setEndDate]     = useState(ad?.endDate ?? '');
  const [media,       setMedia]       = useState<{ url: string; type: 'image' | 'video' } | null>(
    ad?.mediaUrl && ad?.mediaType ? { url: ad.mediaUrl, type: ad.mediaType } : null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title, description, type, productName, productPrice,
      startDate, endDate,
      mediaUrl: media?.url ?? null,
      mediaType: media?.type ?? null,
      mediaFile: media,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="text-lg font-extrabold text-slate-900">
            {isEdit ? 'Edit Advertisement' : 'Create Advertisement'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Media upload — top priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Ad Media (Image or Video) *
            </label>
            <UploadZone value={media} onChange={setMedia} />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Ad Title (Amharic or English)</label>
            <input
              required
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. የቪታሚን ሲ ልዩ ቅናሽ"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              rows={2}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Short description of the promotion or product…"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition bg-slate-50 focus:bg-white resize-none"
            />
          </div>

          {/* Product info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Product / Service Name</label>
              <input
                value={productName} onChange={e => setProductName(e.target.value)}
                placeholder="e.g. Amoxicillin 500mg"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Price / Offer</label>
              <input
                value={productPrice} onChange={e => setProductPrice(e.target.value)}
                placeholder="e.g. ETB 120 or 20% OFF"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Type + dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Ad Type</label>
              <select
                value={type} onChange={e => setType(e.target.value as AdType)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
              >
                {Object.entries(AD_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20">
              {isEdit ? 'Save Changes' : 'Create Ad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function AdminAdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>(SEED_ADS);
  const [loading, setLoading] = useState(true);
  const [modalAd, setModalAd] = useState<Advertisement | 'new' | null>(null);
  const [deleteId, setDeleteId] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<AdStatus | 'all'>('all');

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdvertisements();
      if (Array.isArray(data) && data.length > 0) {
        setAds(data.map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description || '',
          type: (a.position === 'hero_banner' ? 'banner' : a.type || 'banner') as AdType,
          status: (a.status === 'published' ? 'active' : a.status || 'active') as AdStatus,
          mediaUrl: a.mediaUrl || null,
          mediaType: (a.mediaType || 'image') as 'image' | 'video',
          productName: a.targetPage || 'All Products',
          productPrice: a.position || 'Discount',
          startDate: a.startDate || '',
          endDate: a.endDate || '',
          clicks: a.clicks || 0,
          views: a.views || 0,
          createdAt: a.createdAt || new Date().toISOString(),
        })));
      }
    } catch (err) {
      console.error('Failed to fetch advertisements from backend, using seed data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const filtered = ads.filter(a => filterStatus === 'all' || a.status === filterStatus);

  const handleSave = async (data: Partial<Advertisement> & { mediaFile?: { url: string; type: 'image' | 'video' } | null }) => {
    if (modalAd === 'new') {
      try {
        const created = await createAdvertisement({
          title: data.title,
          description: data.description,
          mediaUrl: data.mediaUrl || '',
          mediaType: data.mediaType || 'image',
          targetUrl: '/products',
          targetPage: data.productName || 'homepage',
          position: data.type || 'banner',
          startDate: data.startDate || new Date().toISOString().slice(0, 10),
          endDate: data.endDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          status: 'published',
        });
        const newAd: Advertisement = {
          id: created.id,
          title: created.title,
          description: created.description || '',
          type: (data.type ?? 'banner') as AdType,
          status: 'active',
          mediaUrl: created.mediaUrl || null,
          mediaType: created.mediaType || 'image',
          productName: data.productName ?? '',
          productPrice: data.productPrice ?? '',
          startDate: created.startDate || '',
          endDate: created.endDate || '',
          clicks: 0,
          views: 0,
          createdAt: created.createdAt || new Date().toISOString(),
        };
        setAds(prev => [newAd, ...prev]);
      } catch {
        // Fallback local state
        const newAd: Advertisement = {
          id: 'ad-' + Date.now(),
          title: data.title ?? '',
          description: data.description ?? '',
          type: data.type ?? 'banner',
          status: 'active',
          mediaUrl: data.mediaUrl ?? null,
          mediaType: data.mediaType ?? null,
          productName: data.productName ?? '',
          productPrice: data.productPrice ?? '',
          startDate: data.startDate ?? '',
          endDate: data.endDate ?? '',
          clicks: 0,
          views: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setAds(prev => [newAd, ...prev]);
      }
    } else if (modalAd) {
      const current = modalAd as Advertisement;
      if (typeof current.id === 'number') {
        try {
          await updateAdvertisement(current.id, {
            title: data.title,
            description: data.description,
            mediaUrl: data.mediaUrl || undefined,
            mediaType: data.mediaType || 'image',
          });
        } catch (err) {
          console.error(err);
        }
      }
      setAds(prev => prev.map(a => a.id === current.id ? { ...a, ...data } : a));
    }
    setModalAd(null);
  };

  const toggleStatus = async (id: any) => {
    const target = ads.find(a => a.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'paused' : 'active';
    if (typeof id === 'number') {
      try {
        await updateAdvertisement(id, { status: newStatus as any });
      } catch (err) {
        console.error(err);
      }
    }
    setAds(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const confirmDelete = async (id: any) => {
    if (typeof id === 'number') {
      try {
        await deleteAdvertisement(id);
      } catch (err) {
        console.error(err);
      }
    }
    setAds(prev => prev.filter(a => a.id !== id));
    setDeleteId(null);
  };

  const totalViews  = ads.reduce((s, a) => s + (a.views || 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (a.clicks || 0), 0);
  const activeCount = ads.filter(a => a.status === 'active').length;
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Advertisements</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create and manage pharmacy promotions with images and videos</p>
        </div>
        <button
          onClick={() => setModalAd('new')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition shadow-md shadow-emerald-600/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Advertisement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Ads', value: ads.length, icon: '📢', color: 'text-blue-700 bg-blue-50 border-blue-100' },
          { label: 'Active Now', value: activeCount, icon: '✅', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: '👁️', color: 'text-violet-700 bg-violet-50 border-violet-100' },
          { label: 'CTR', value: `${ctr}%`, icon: '🎯', color: 'text-amber-700 bg-amber-50 border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 flex items-center gap-3 ${s.color}`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xl font-extrabold leading-none">{s.value}</p>
              <p className="text-xs font-semibold mt-0.5 opacity-80">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'paused', 'scheduled', 'ended'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
              filterStatus === s
                ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Ad grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(ad => (
          <div key={ad.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">

            {/* Media preview */}
            <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              {ad.mediaUrl && ad.mediaType === 'image' && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />
              )}
              {ad.mediaUrl && ad.mediaType === 'video' && (
                <video src={ad.mediaUrl} className="w-full h-full object-cover" muted loop />
              )}
              {!ad.mediaUrl && (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold">No media uploaded</span>
                </div>
              )}

              {/* Type badge */}
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-bold uppercase">
                {AD_TYPE_LABELS[ad.type]}
              </span>

              {/* Status badge */}
              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${STATUS_COLORS[ad.status]}`}>
                {ad.status}
              </span>
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm leading-tight">{ad.title}</h3>
              {ad.description && <p className="text-xs text-slate-500 leading-relaxed">{ad.description}</p>}

              {/* Product */}
              {ad.productName && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-slate-700">{ad.productName}</span>
                  {ad.productPrice && (
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">{ad.productPrice}</span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <span>👁 {ad.views.toLocaleString()} views</span>
                <span>🖱 {ad.clicks.toLocaleString()} clicks</span>
                <span className="ml-auto">{ad.startDate} → {ad.endDate || '—'}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => toggleStatus(ad.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                    ad.status === 'active'
                      ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {ad.status === 'active' ? '⏸ Pause' : '▶ Activate'}
                </button>
                <button
                  onClick={() => setModalAd(ad)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  ✏ Edit
                </button>
                <button
                  onClick={() => setDeleteId(ad.id)}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <p className="text-sm font-semibold">No advertisements found</p>
            <button onClick={() => setModalAd('new')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition">
              Create First Ad
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalAd !== null && (
        <AdModal
          ad={modalAd === 'new' ? null : modalAd}
          onClose={() => setModalAd(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-900">Delete this advertisement?</p>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={() => confirmDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
