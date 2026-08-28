'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVideos, createVideo, updateVideo, deleteVideo, Video } from '@/lib/api/admin';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    category: 'Medication Usage',
    duration: '3:45',
    status: 'published' as 'draft' | 'published',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchVideosList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getVideos();
      setVideos(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideosList();
  }, [fetchVideosList]);

  const handleOpenModal = (video?: Video) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        description: video.description || '',
        videoUrl: video.videoUrl || '',
        category: video.category || 'Medication Usage',
        duration: video.duration || '3:45',
        status: video.status || 'published',
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        category: 'Medication Usage',
        duration: '3:45',
        status: 'published',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingVideo) {
        const updated = await updateVideo(editingVideo.id, formData);
        setVideos(prev => prev.map(v => v.id === editingVideo.id ? updated : v));
      } else {
        const created = await createVideo(formData);
        setVideos(prev => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save video');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete video "${title}"?`)) return;
    try {
      await deleteVideo(id);
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete video');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Health Video Education</h1>
          <p className="text-sm text-slate-500 mt-1">Manage pharmacist video demonstrations, inhaler guides, and health tutorials</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition shadow-md shadow-emerald-600/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Add Educational Video
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Video Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl mx-auto mb-3">
            🎬
          </div>
          <p className="font-bold text-slate-800 text-sm">No educational videos added yet.</p>
          <p className="text-xs text-slate-400 mt-1">Add YouTube or MP4 demonstration links for patient guidance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col justify-between hover:border-emerald-400 transition">
              <div>
                <div className="aspect-video bg-slate-900 text-white flex items-center justify-center relative">
                  <span className="text-4xl opacity-80">▶️</span>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {video.duration || 'Video'}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                      {video.category || 'Health'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${video.status === 'published' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {video.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{video.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{video.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                <span className="text-xs text-slate-400">
                  {video.views ? `${video.views} views` : 'New'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(video)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video.id, video.title)}
                    className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                    title="Delete Video"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingVideo ? 'Edit Educational Video' : 'Add Educational Video'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Video Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. How to use an Asthma Inhaler correctly"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Video URL (YouTube or MP4) *</label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={e => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none text-slate-800 bg-white"
                  >
                    <option value="Medication Usage">Medication Usage</option>
                    <option value="First Aid & Emergency">First Aid & Emergency</option>
                    <option value="Diabetes Management">Diabetes Management</option>
                    <option value="Infant Healthcare">Infant Healthcare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Estimated Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="3:45"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Video overview and clinical key points..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none text-slate-800 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
