'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  uploadAdvertisementMedia,
  getMediaUrl,
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
  thumbnailUrl?: string | null;
  productName: string;
  productPrice: string;
  startDate: string;
  endDate: string;
  clicks: number;
  views: number;
  createdAt: string;
}

/* ── Helpers ────────────────────────────────────────────── */
function getEmbedVideoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // YouTube watch?v= or youtu.be/ or youtube.com/embed/
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
  }
  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return null;
}

function isDirectVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mov') ||
    clean.includes('/uploads/advertisements/')
  );
}

/* ── Seed data ──────────────────────────────────────────── */
const SEED_ADS: Advertisement[] = [
  {
    id: 1,
    title: 'Clinical Video Guide: Modern Respiratory & Asthma Management Protocol',
    description: 'Watch our clinical pharmacist team explain the 3-step preventive therapy for bronchial asthma, spacer usage, and when to seek instant nebulization at Michu branches.',
    type: 'banner',
    status: 'active',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    mediaType: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    productName: 'Nebulizers & Spacers',
    productPrice: 'EFDA Approved',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    clicks: 1420,
    views: 9800,
    createdAt: '2026-08-01',
  },
  {
    id: 2,
    title: 'የቴሌብር እና ሲቢኢ ብር የክፍያ ቅናሽ',
    description: 'በቴሌብር ወይም በንግድ ባንክ ሲቢኢ ብር ሲከፍሉ 15% ቅናሽ ያግኙ! ፈጣን እና አስተማማኝ የክፍያ አማራጭ።',
    type: 'banner',
    status: 'active',
    mediaUrl: null,
    mediaType: 'image',
    productName: 'ሁሉም ምርቶች',
    productPrice: '15% ቅናሽ',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    clicks: 1240,
    views: 8900,
    createdAt: '2026-08-01',
  },
  {
    id: 3,
    title: 'አዲስ! ቪታሚን ሲ 1000mg',
    description: 'የበሽታ መከላከያ ያጠናክሩ — ልዩ የምርት ማስተዋወቂያ እና ነፃ የማማከር አገልግሎት።',
    type: 'product_highlight',
    status: 'active',
    mediaUrl: null,
    mediaType: 'image',
    productName: 'Vitamin C 1000mg (60 tabs)',
    productPrice: 'ETB 450',
    startDate: '2026-08-10',
    endDate: '2026-09-10',
    clicks: 560,
    views: 3200,
    createdAt: '2026-08-10',
  },
];

const AD_TYPE_LABELS: Record<AdType, string> = {
  banner: 'Banner',
  popup: 'Pop-up',
  story: 'Story',
  product_highlight: 'Product Highlight',
};

const STATUS_COLORS: Record<AdStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  ended: 'bg-slate-100 text-slate-500 border-slate-200',
  expired: 'bg-rose-50 text-rose-700 border-rose-200',
};

/* ── Upload & Media Manager Component ─────────────────────── */
function MediaManagerZone({
  mediaUrl,
  mediaType,
  thumbnailUrl,
  onChange,
}: {
  mediaUrl: string | null;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string | null;
  onChange: (data: {
    mediaUrl: string | null;
    mediaType: 'image' | 'video';
    thumbnailUrl?: string | null;
  }) => void;
}) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(mediaUrl || '');
  const [thumbInput, setThumbInput] = useState(thumbnailUrl || '');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const embedUrl = getEmbedVideoUrl(mediaUrl);

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      const res = await uploadAdvertisementMedia(file);
      const detectedType = res.type === 'video' ? 'video' : 'image';
      onChange({
        mediaUrl: res.url,
        mediaType: detectedType,
        thumbnailUrl,
      });
      setUrlInput(res.url);
    } catch (err: any) {
      console.error('Ad media upload failed:', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleThumbUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const res = await uploadAdvertisementMedia(file);
      setThumbInput(res.url);
      onChange({
        mediaUrl,
        mediaType,
        thumbnailUrl: res.url,
      });
    } catch (err: any) {
      console.error('Thumb upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const applyUrl = (rawUrl: string, explicitType?: 'image' | 'video') => {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      onChange({ mediaUrl: null, mediaType, thumbnailUrl });
      return;
    }

    const isVideo =
      explicitType === 'video' ||
      getEmbedVideoUrl(trimmed) !== null ||
      isDirectVideoUrl(trimmed) ||
      trimmed.includes('youtube') ||
      trimmed.includes('vimeo');

    onChange({
      mediaUrl: trimmed,
      mediaType: isVideo ? 'video' : explicitType || 'image',
      thumbnailUrl: thumbInput.trim() || thumbnailUrl,
    });
  };

  return (
    <div className="space-y-4">
      {/* Media Type Selector */}
      <div className="flex items-center justify-between gap-3 bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => {
            onChange({ mediaUrl, mediaType: 'video', thumbnailUrl });
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mediaType === 'video'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🎥 Video Advertisement</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onChange({ mediaUrl, mediaType: 'image', thumbnailUrl });
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mediaType === 'image'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🖼️ Image Advertisement</span>
        </button>
      </div>

      {/* Input Mode Tabs: Upload vs URL */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'upload'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Direct File Upload (.mp4, .webm, .jpg, .png)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'url'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          External Video / Media URL (YouTube, Vimeo, MP4)
        </button>
      </div>

      {/* Active Preview if media exists */}
      {mediaUrl && (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 bg-slate-950 shadow-inner">
          <div className="relative w-full max-h-64 flex items-center justify-center bg-black">
            {mediaType === 'video' ? (
              embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="Video Preview"
                  className="w-full aspect-video max-h-64 border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={getMediaUrl(mediaUrl) as string}
                  poster={thumbnailUrl ? (getMediaUrl(thumbnailUrl) as string) : undefined}
                  controls
                  className="w-full max-h-64 object-contain"
                />
              )
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={getMediaUrl(mediaUrl) as string}
                alt="Ad preview"
                className="w-full max-h-64 object-contain"
              />
            )}
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => {
                onChange({ mediaUrl: null, mediaType, thumbnailUrl: null });
                setUrlInput('');
              }}
              className="px-2.5 py-1 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-bold transition shadow-lg flex items-center gap-1"
            >
              <span>✕ Remove Media</span>
            </button>
          </div>

          <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/80 text-white text-[10px] font-mono tracking-wider border border-white/20">
            {mediaType.toUpperCase()} • {embedUrl ? 'EMBED' : 'DIRECT / LOCAL'}
          </div>
        </div>
      )}

      {/* File Upload Zone */}
      {activeTab === 'upload' && (
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
              cursor-pointer transition-all py-8 px-4 text-center
              ${
                dragging
                  ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/40'
              }
              ${isUploading ? 'opacity-60 pointer-events-none' : ''}
            `}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-emerald-700">Uploading media to server...</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
                  {mediaType === 'video' ? '🎥' : '🖼️'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Click or drag {mediaType === 'video' ? 'video (.mp4, .webm, .mov)' : 'image'} to upload
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Up to 100MB for video • Saved directly to Michu Pharmacy storage
                  </p>
                </div>
                <span className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm">
                  Browse Computer
                </span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={
                mediaType === 'video'
                  ? 'video/mp4,video/webm,video/ogg,video/quicktime,video/*'
                  : 'image/jpeg,image/png,image/webp,image/gif,image/*'
              }
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>

          {uploadError && (
            <p className="text-xs font-bold text-rose-600 mt-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              ⚠️ {uploadError}
            </p>
          )}
        </div>
      )}

      {/* URL Input Zone */}
      {activeTab === 'url' && (
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Direct Video or Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  applyUrl(e.target.value);
                }}
                placeholder="https://... (.mp4, YouTube, Vimeo, or image link)"
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 bg-white"
              />
              <button
                type="button"
                onClick={() => applyUrl(urlInput)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              >
                Apply URL
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Supports direct MP4 links, YouTube (`youtube.com/watch?v=...`), and Vimeo links.
            </p>
          </div>
        </div>
      )}

      {/* Optional Video Poster / Thumbnail */}
      {mediaType === 'video' && (
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Video Thumbnail / Poster Image (Optional)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={thumbInput}
              onChange={(e) => {
                setThumbInput(e.target.value);
                onChange({ mediaUrl, mediaType, thumbnailUrl: e.target.value });
              }}
              placeholder="e.g. /uploads/... or image URL for video preview"
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 bg-slate-50 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => thumbInputRef.current?.click()}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition shrink-0"
            >
              Upload Poster
            </button>
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleThumbUpload(file);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Create/Edit Modal ───────────────────────────────────── */
function AdModal({
  ad,
  onClose,
  onSave,
}: {
  ad: Advertisement | null;
  onClose: () => void;
  onSave: (data: Partial<Advertisement>) => void;
}) {
  const isEdit = !!ad;
  const [title, setTitle] = useState(ad?.title ?? '');
  const [description, setDescription] = useState(ad?.description ?? '');
  const [type, setType] = useState<AdType>(ad?.type ?? 'banner');
  const [productName, setProductName] = useState(ad?.productName ?? '');
  const [productPrice, setProductPrice] = useState(ad?.productPrice ?? '');
  const [startDate, setStartDate] = useState(ad?.startDate ?? '');
  const [endDate, setEndDate] = useState(ad?.endDate ?? '');
  const [mediaUrl, setMediaUrl] = useState<string | null>(ad?.mediaUrl ?? null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>(
    (ad?.mediaType as 'image' | 'video') || 'video',
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(ad?.thumbnailUrl ?? null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      type,
      productName,
      productPrice,
      startDate,
      endDate,
      mediaUrl: mediaUrl || null,
      mediaType,
      thumbnailUrl: thumbnailUrl || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
              {mediaType === 'video' ? '🎥' : '📢'}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-none">
                {isEdit ? 'Edit Advertisement' : 'Create Advertisement'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure banner, disease solution, or clinical promotional video
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Media manager */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Ad Media (Video or Image) *
            </label>
            <MediaManagerZone
              mediaUrl={mediaUrl}
              mediaType={mediaType}
              thumbnailUrl={thumbnailUrl}
              onChange={({ mediaUrl: mUrl, mediaType: mType, thumbnailUrl: tUrl }) => {
                setMediaUrl(mUrl);
                setMediaType(mType);
                if (tUrl !== undefined) setThumbnailUrl(tUrl);
              }}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ad Title (Amharic or English) *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clinical Video Guide: Asthma Inhalation Protocol"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description & Clinical Message
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed explanation, dosage instructions, or promotion information..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition bg-slate-50 focus:bg-white resize-none"
            />
          </div>

          {/* Product info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Related Product / Topic
              </label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Respiratory & Asthma Care"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Offer / Highlight Tag
              </label>
              <input
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="e.g. Free Consultation / EFDA Certified"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Type + dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ad Display Format
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AdType)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
              >
                {Object.entries(AD_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20"
            >
              {isEdit ? 'Save Advertisement Changes' : 'Create Advertisement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Fullscreen Video Modal for Preview ──────────────────── */
function VideoPreviewModal({
  ad,
  onClose,
}: {
  ad: Advertisement;
  onClose: () => void;
}) {
  const embedUrl = getEmbedVideoUrl(ad.mediaUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎥</span>
            <div>
              <h3 className="text-base font-extrabold truncate max-w-md">{ad.title}</h3>
              <p className="text-xs text-slate-400">Video Advertisement Preview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="relative aspect-video bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={ad.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={getMediaUrl(ad.mediaUrl) as string}
              poster={ad.thumbnailUrl ? (getMediaUrl(ad.thumbnailUrl) as string) : undefined}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <div className="p-5 bg-slate-900 border-t border-slate-800 text-slate-300">
          <p className="text-xs leading-relaxed">{ad.description}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function AdminAdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>(SEED_ADS);
  const [loading, setLoading] = useState(true);
  const [modalAd, setModalAd] = useState<Advertisement | 'new' | null>(null);
  const [previewVideoAd, setPreviewVideoAd] = useState<Advertisement | null>(null);
  const [deleteId, setDeleteId] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<AdStatus | 'all'>('all');

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdvertisements();
      if (Array.isArray(data) && data.length > 0) {
        setAds(
          data.map((a: any) => ({
            id: a.id,
            title: a.title,
            description: a.description || '',
            type: (a.position === 'hero_banner' ? 'banner' : a.type || 'banner') as AdType,
            status: (a.status === 'published' ? 'active' : a.status || 'active') as AdStatus,
            mediaUrl: a.mediaUrl || null,
            mediaType: (a.mediaType || (isDirectVideoUrl(a.mediaUrl) ? 'video' : 'image')) as
              | 'image'
              | 'video',
            thumbnailUrl: a.thumbnailUrl || null,
            productName: a.targetPage || 'Clinical Health Service',
            productPrice: a.position || 'Special Notice',
            startDate: a.startDate || '',
            endDate: a.endDate || '',
            clicks: a.clicks || 0,
            views: a.views || 0,
            createdAt: a.createdAt || new Date().toISOString(),
          })),
        );
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

  const filtered = ads.filter((a) => filterStatus === 'all' || a.status === filterStatus);

  const handleSave = async (data: Partial<Advertisement>) => {
    if (modalAd === 'new') {
      try {
        const created = await createAdvertisement({
          title: data.title,
          description: data.description,
          mediaUrl: data.mediaUrl || '',
          mediaType: data.mediaType || 'video',
          thumbnailUrl: data.thumbnailUrl || undefined,
          targetUrl: '/products',
          targetPage: data.productName || 'homepage',
          position: data.type || 'disease_solution',
          startDate: data.startDate || new Date().toISOString().slice(0, 10),
          endDate:
            data.endDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          status: 'published',
        });
        const newAd: Advertisement = {
          id: created.id,
          title: created.title,
          description: created.description || '',
          type: (data.type ?? 'banner') as AdType,
          status: 'active',
          mediaUrl: created.mediaUrl || null,
          mediaType: created.mediaType || 'video',
          thumbnailUrl: created.thumbnailUrl || null,
          productName: data.productName ?? '',
          productPrice: data.productPrice ?? '',
          startDate: created.startDate || '',
          endDate: created.endDate || '',
          clicks: 0,
          views: 0,
          createdAt: created.createdAt || new Date().toISOString(),
        };
        setAds((prev) => [newAd, ...prev]);
      } catch {
        // Fallback local state
        const newAd: Advertisement = {
          id: 'ad-' + Date.now(),
          title: data.title ?? '',
          description: data.description ?? '',
          type: data.type ?? 'banner',
          status: 'active',
          mediaUrl: data.mediaUrl ?? null,
          mediaType: data.mediaType ?? 'video',
          thumbnailUrl: data.thumbnailUrl ?? null,
          productName: data.productName ?? '',
          productPrice: data.productPrice ?? '',
          startDate: data.startDate ?? '',
          endDate: data.endDate ?? '',
          clicks: 0,
          views: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setAds((prev) => [newAd, ...prev]);
      }
    } else if (modalAd) {
      const current = modalAd as Advertisement;
      if (typeof current.id === 'number') {
        try {
          await updateAdvertisement(current.id, {
            title: data.title,
            description: data.description,
            mediaUrl: data.mediaUrl || undefined,
            mediaType: data.mediaType || 'video',
            thumbnailUrl: data.thumbnailUrl || undefined,
          });
        } catch (err) {
          console.error(err);
        }
      }
      setAds((prev) => (prev.map((a) => (a.id === current.id ? { ...a, ...data } : a))));
    }
    setModalAd(null);
  };

  const toggleStatus = async (id: any) => {
    const target = ads.find((a) => a.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'paused' : 'active';
    if (typeof id === 'number') {
      try {
        await updateAdvertisement(id, { status: newStatus as any });
      } catch (err) {
        console.error(err);
      }
    }
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
  };

  const confirmDelete = async (id: any) => {
    if (typeof id === 'number') {
      try {
        await deleteAdvertisement(id);
      } catch (err) {
        console.error(err);
      }
    }
    setAds((prev) => prev.filter((a) => a.id !== id));
    setDeleteId(null);
  };

  const totalViews = ads.reduce((s, a) => s + (a.views || 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (a.clicks || 0), 0);
  const activeCount = ads.filter((a) => a.status === 'active').length;
  const videoCount = ads.filter((a) => a.mediaType === 'video').length;
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span>📢</span>
            <span>Healthcare Announcements & Video Ads</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Advertisements & Video Banners</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create, upload, and manage pharmacy promotions with videos, posters, and interactive media.
          </p>
        </div>
        <button
          onClick={() => setModalAd('new')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition shadow-md shadow-emerald-600/20 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Video / Image Ad
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Ads',
            value: ads.length,
            icon: '📢',
            color: 'text-blue-700 bg-blue-50 border-blue-100',
          },
          {
            label: 'Video Ads',
            value: videoCount,
            icon: '🎥',
            color: 'text-purple-700 bg-purple-50 border-purple-100',
          },
          {
            label: 'Active Now',
            value: activeCount,
            icon: '✅',
            color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
          },
          {
            label: 'Avg. CTR',
            value: `${ctr}%`,
            icon: '🎯',
            color: 'text-amber-700 bg-amber-50 border-amber-100',
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border p-4 flex items-center gap-3 ${s.color}`}
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xl font-extrabold leading-none">{s.value}</p>
              <p className="text-xs font-semibold mt-0.5 opacity-80">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'paused', 'scheduled', 'ended'] as const).map((s) => (
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
      </div>

      {/* Ad grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((ad) => {
          const isVideo = ad.mediaType === 'video';
          const embedUrl = getEmbedVideoUrl(ad.mediaUrl);
          const fullMediaUrl = getMediaUrl(ad.mediaUrl);

          return (
            <div
              key={ad.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Media preview */}
                <div className="relative h-48 bg-slate-950 flex items-center justify-center overflow-hidden">
                  {fullMediaUrl && !isVideo && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={fullMediaUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  )}

                  {fullMediaUrl && isVideo && (
                    <div className="relative w-full h-full flex items-center justify-center bg-black group/video">
                      {ad.thumbnailUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={getMediaUrl(ad.thumbnailUrl) as string}
                          alt={ad.title}
                          className="w-full h-full object-cover opacity-80 group-hover/video:opacity-95 transition"
                        />
                      ) : (
                        <video
                          src={fullMediaUrl}
                          className="w-full h-full object-cover opacity-80"
                          muted
                          playsInline
                        />
                      )}

                      {/* Play overlay button */}
                      <button
                        type="button"
                        onClick={() => setPreviewVideoAd(ad)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/video:bg-black/20 transition"
                      >
                        <span className="w-12 h-12 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center justify-center text-lg shadow-xl shadow-emerald-950/40 transform group-hover/video:scale-110 transition">
                          ▶
                        </span>
                      </button>
                    </div>
                  )}

                  {!fullMediaUrl && (
                    <div className="flex flex-col items-center gap-2 text-slate-500 bg-slate-900 w-full h-full justify-center">
                      <span className="text-3xl">📢</span>
                      <span className="text-xs font-semibold text-slate-400">No media uploaded</span>
                    </div>
                  )}

                  {/* Media Type badge */}
                  <span
                    className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-1 ${
                      isVideo
                        ? 'bg-purple-900/80 text-purple-200 border border-purple-400/30'
                        : 'bg-black/60 text-white border border-white/20'
                    }`}
                  >
                    <span>{isVideo ? '🎥 Video' : '🖼️ Image'}</span>
                  </span>

                  {/* Status badge */}
                  <span
                    className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      STATUS_COLORS[ad.status]
                    }`}
                  >
                    {ad.status}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-emerald-700 transition line-clamp-2">
                    {ad.title}
                  </h3>
                  {ad.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {ad.description}
                    </p>
                  )}

                  {/* Product Tag */}
                  {ad.productName && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {ad.productName}
                      </span>
                      {ad.productPrice && (
                        <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md shrink-0">
                          {ad.productPrice}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions & Stats */}
              <div className="p-4 pt-0">
                <div className="flex items-center gap-4 text-[11px] text-slate-400 py-2 border-t border-slate-100">
                  <span>👁 {ad.views.toLocaleString()} views</span>
                  <span>🖱 {ad.clicks.toLocaleString()} clicks</span>
                  {isVideo && fullMediaUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewVideoAd(ad)}
                      className="ml-auto text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>Preview Video</span>
                      <span>&rarr;</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
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
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 gap-3 bg-white rounded-3xl border border-dashed border-slate-200">
            <span className="text-4xl">🎥</span>
            <p className="text-sm font-semibold text-slate-600">No advertisements found</p>
            <p className="text-xs text-slate-400">
              Create your first clinical promotional video or banner advertisement.
            </p>
            <button
              onClick={() => setModalAd('new')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
            >
              Create Advertisement
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

      {/* Full Video Modal */}
      {previewVideoAd && (
        <VideoPreviewModal
          ad={previewVideoAd}
          onClose={() => setPreviewVideoAd(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-900">Delete this advertisement?</p>
            <p className="text-xs text-slate-500">
              This action will remove the advertisement from the home page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
