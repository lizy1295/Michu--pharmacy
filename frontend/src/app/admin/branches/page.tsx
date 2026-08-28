'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBranches, createBranch, updateBranch, deleteBranch, Branch } from '@/lib/api/admin';

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    manager: '',
    openingHours: '8:00 AM - 10:00 PM',
    status: 'active' as 'active' | 'inactive',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchBranchesList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBranches();
      setBranches(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load pharmacy branches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranchesList();
  }, [fetchBranchesList]);

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        location: branch.location || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        manager: branch.manager || '',
        openingHours: branch.openingHours || '8:00 AM - 10:00 PM',
        status: branch.status || 'active',
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name: '',
        location: 'Addis Ababa',
        address: '',
        phone: '',
        email: '',
        manager: '',
        openingHours: '8:00 AM - 10:00 PM',
        status: 'active',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBranch) {
        const updated = await updateBranch(editingBranch.id, formData);
        setBranches(prev => prev.map(b => b.id === editingBranch.id ? updated : b));
      } else {
        const created = await createBranch(formData);
        setBranches(prev => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save branch');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete branch "${name}"?`)) return;
    try {
      await deleteBranch(id);
      setBranches(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete branch');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Pharmacy Branches & Locations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage physical pharmacy dispensary locations, managers, and hours</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition shadow-md shadow-emerald-600/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Add New Branch
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Branch Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition">
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-100">
                      🏥
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{branch.name}</h3>
                      <p className="text-xs text-slate-400">{branch.location}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase border ${
                    branch.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {branch.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📍</span>
                    <span className="truncate">{branch.address || 'Address not listed'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📞</span>
                    <span>{branch.phone || 'Phone not listed'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">👤</span>
                    <span>Manager: <strong>{branch.manager || 'Lead Pharmacist'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">⏰</span>
                    <span>{branch.openingHours || '8:00 AM - 10:00 PM'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(branch)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => handleDelete(branch.id, branch.name)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                  title="Delete Branch"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
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
                {editingBranch ? 'Edit Pharmacy Branch' : 'Add New Branch'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Bole Medhanialem Branch"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">City / Region</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Addis Ababa"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Contact</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+251 11 123 4567"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Physical Address / Landmark</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. Bole Road, Next to Edna Mall"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Branch Manager</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={e => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                    placeholder="e.g. Pharmacist Kebede"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Opening Hours</label>
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={e => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                    placeholder="8:00 AM - 10:00 PM"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none text-slate-800 bg-white"
                >
                  <option value="active">Active (Open)</option>
                  <option value="inactive">Inactive (Closed / Renovation)</option>
                </select>
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
                  {saving ? 'Saving...' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
