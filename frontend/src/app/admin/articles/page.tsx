'use client';

import { useState, useEffect, useCallback } from 'react';
import { getArticles, createArticle, updateArticle, deleteArticle, Article } from '@/lib/api/admin';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Medication Guides',
    author: 'Pharmacist AU',
    summary: '',
    content: '',
    status: 'published' as 'draft' | 'published',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchArticlesList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getArticles();
      setArticles(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load health articles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticlesList();
  }, [fetchArticlesList]);

  const handleOpenModal = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        category: article.category || 'Medication Guides',
        author: article.author || 'Pharmacist AU',
        summary: article.summary || '',
        content: article.content || '',
        status: article.status || 'published',
      });
    } else {
      setEditingArticle(null);
      setFormData({
        title: '',
        category: 'Medication Guides',
        author: 'Pharmacist AU',
        summary: '',
        content: '',
        status: 'published',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingArticle) {
        const updated = await updateArticle(editingArticle.id, formData);
        setArticles(prev => prev.map(a => a.id === editingArticle.id ? updated : a));
      } else {
        const created = await createArticle(formData);
        setArticles(prev => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteArticle(id);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete article');
    }
  };

  const filtered = articles.filter(a =>
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Health Articles CMS</h1>
          <p className="text-sm text-slate-500 mt-1">Publish patient education guides, chronic disease management, and pharmacy news</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition shadow-md shadow-emerald-600/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Write New Article
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Filter / Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search articles by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 transition"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {/* Articles Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="text-left py-3.5 px-4">Article Title</th>
                  <th className="text-left py-3.5 px-4">Category</th>
                  <th className="text-left py-3.5 px-4">Author</th>
                  <th className="text-left py-3.5 px-4">Status</th>
                  <th className="text-right py-3.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{article.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{article.summary || article.content?.slice(0, 80)}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {article.category || 'General Health'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      {article.author || 'Pharmacist'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        article.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(article)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition"
                          title="Edit Article"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Article"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <p className="font-semibold text-slate-700">No health articles published yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click &quot;Write New Article&quot; to add health advice for Michu Pharmacy customers.</p>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingArticle ? 'Edit Health Article' : 'Write Health Article'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Article Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Managing Hypertension: Complete Guide"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
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
                    <option value="Medication Guides">Medication Guides</option>
                    <option value="Chronic Care">Chronic Care</option>
                    <option value="Nutrition & Diet">Nutrition & Diet</option>
                    <option value="Skincare & Beauty">Skincare & Beauty</option>
                    <option value="Pharmacy Updates">Pharmacy Updates</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Short Summary</label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief 1-2 sentence preview..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none text-slate-800 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Article Body Content *</label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Full clinical advice, dosage reminders, lifestyle tips..."
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
                  {saving ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
