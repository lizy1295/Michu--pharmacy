'use client';

import { useState, useEffect } from 'react';
import { getPartners, createPartner, updatePartner, deletePartner, Partner } from '@/lib/api/admin';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'manufacturer' as Partner['category'],
    badge: 'Verified Partner',
    description: '',
    websiteUrl: '',
    displayOrder: 1,
    status: 'active' as 'active' | 'inactive',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await getPartners();
      setPartners(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const openAddModal = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      category: 'manufacturer',
      badge: 'Verified Partner',
      description: '',
      websiteUrl: '',
      displayOrder: partners.length + 1,
      status: 'active',
    });
    setShowModal(true);
  };

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      category: partner.category,
      badge: partner.badge,
      description: partner.description || '',
      websiteUrl: partner.websiteUrl || '',
      displayOrder: partner.displayOrder,
      status: partner.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPartner) {
        await updatePartner(editingPartner.id, formData);
        showToast(`Partner "${formData.name}" updated successfully!`);
      } else {
        await createPartner(formData);
        showToast(`New partner "${formData.name}" added successfully!`);
      }
      setShowModal(false);
      fetchPartners();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleDelete = async (partner: Partner) => {
    if (!confirm(`Are you sure you want to remove ${partner.name}?`)) return;
    try {
      await deletePartner(partner.id);
      showToast(`Partner "${partner.name}" removed`);
      fetchPartners();
    } catch (err: any) {
      alert(err.message || 'Failed to delete partner');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white rounded-xl shadow-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 border border-neutral-800 animate-in fade-in duration-200">
          <span className="text-emerald-400">✓</span>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Healthcare &amp; Strategic Partners</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage pharmaceutical manufacturers, health regulators, and payment partners displayed on the storefront.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition"
        >
          <span>＋</span> Add New Partner
        </button>
      </div>

      {/* Content list */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm">Loading partners...</div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 mb-6">{error}</div>
      ) : partners.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-2xl">
          <p className="text-slate-500 text-sm font-medium">No partners listed yet.</p>
          <button onClick={openAddModal} className="mt-3 text-emerald-600 font-bold text-sm hover:underline">
            Add your first partner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    partner.category === 'regulatory'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : partner.category === 'fintech'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {partner.category}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${partner.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>

                <h3 className="font-extrabold text-slate-900 text-base">{partner.name}</h3>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">{partner.badge}</p>
                {partner.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{partner.description}</p>
                )}
                {partner.websiteUrl && (
                  <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-sky-600 hover:underline mt-2 inline-block font-medium truncate max-w-full"
                  >
                    🔗 {partner.websiteUrl}
                  </a>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Order: #{partner.displayOrder}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(partner)}
                    className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(partner)}
                    className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4">
              {editingPartner ? 'Edit Partner' : 'Add New Partner'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Partner Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. EFDA, Cadila, Telebirr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="manufacturer">Manufacturer</option>
                    <option value="regulatory">Regulatory</option>
                    <option value="fintech">Fintech / Payment</option>
                    <option value="health_system">Health System</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Display Badge</label>
                  <input
                    type="text"
                    required
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. Certified WHO-GMP"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Website URL (Optional)</label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="Brief summary of collaboration..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                >
                  {editingPartner ? 'Save Changes' : 'Create Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
