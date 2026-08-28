'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin, AdminAccount } from '@/lib/api/admin';

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentAdminEmail, setCurrentAdminEmail] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('admin');
  const [formPhone, setFormPhone] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdmins();
      setAdmins(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentAdminEmail(parsed.email || '');
      }
    } catch {
      // ignore
    }
    fetchAdmins();
  }, [fetchAdmins]);

  const handleOpenCreate = () => {
    setEditingAdmin(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('admin');
    setFormPhone('');
    setFormActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (admin: AdminAccount) => {
    setEditingAdmin(admin);
    setFormName(admin.name || '');
    setFormEmail(admin.email || '');
    setFormPassword('');
    setFormRole(admin.role || 'staff');
    setFormPhone(admin.phone || '');
    setFormActive(admin.isActive !== false);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAdmin) {
        // Update
        const payload: any = {
          name: formName,
          role: formRole,
          phone: formPhone,
          isActive: formActive,
        };
        if (formPassword.trim()) {
          payload.password = formPassword;
        }
        await updateAdmin(editingAdmin.id, payload);
        showToast(`Admin account "${formName}" updated successfully.`);
      } else {
        // Create
        if (!formPassword) {
          throw new Error('Password is required for new accounts');
        }
        await createAdmin({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          phone: formPhone,
        });
        showToast(`Admin account "${formName}" created successfully.`);
      }
      setModalOpen(false);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Failed to save admin account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove administrator "${name}"?`)) return;
    try {
      await deleteAdmin(id);
      setAdmins(prev => prev.filter(a => a.id !== id));
      showToast(`Admin account "${name}" removed.`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete admin');
    }
  };

  const filteredAdmins = admins.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.role?.toLowerCase().includes(search.toLowerCase())
  );

  const formatRole = (role?: string) => {
    if (!role) return 'Admin';
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'admin') return 'Administrator';
    if (role === 'pharmacist') return 'Pharmacist';
    if (role === 'manager') return 'Manager';
    if (role === 'staff') return 'Staff';
    return role.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Admin & Staff Accounts</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
              Super Admin Control
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage pharmacy management team members, roles, and administrative access permissions.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:from-emerald-700 hover:to-teal-800 transition shadow-md shadow-emerald-600/20 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Admin Account
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
          ✓ {toastMessage}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Filter & Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-medium focus:border-emerald-500 outline-none text-slate-800"
            />
            <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            Total Accounts: <span className="text-slate-900 font-bold">{admins.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
            Loading admin accounts...
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <p className="text-sm font-bold text-slate-800">No admin accounts found</p>
            <p className="text-xs text-slate-400 mt-1">Create an account to invite colleagues.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Admin Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAdmins.map((admin) => {
                  const isCurrent = admin.email.toLowerCase() === currentAdminEmail.toLowerCase();
                  const isSuper = admin.role === 'super_admin';

                  return (
                    <tr key={admin.id} className={`hover:bg-slate-50/70 transition ${isCurrent ? 'bg-emerald-50/40' : ''}`}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-xs ${
                            isSuper ? 'bg-gradient-to-tr from-emerald-600 to-teal-600' : 'bg-slate-700'
                          }`}>
                            {(admin.name || admin.email).substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{admin.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                  You (Active)
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-mono">{admin.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold inline-flex items-center gap-1.5 border ${
                          admin.role === 'super_admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : admin.role === 'admin'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : admin.role === 'pharmacist'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {formatRole(admin.role)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        {admin.phone || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          admin.isActive !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {admin.isActive !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(admin)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-emerald-700 transition"
                            title="Edit Account"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {!isCurrent && (
                            <button
                              onClick={() => handleDelete(admin.id, admin.name)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                              title="Delete Account"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base border border-emerald-100">
                  👤
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingAdmin ? 'Edit Admin Account' : 'New Admin Account'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Pharmacy staff credentials & roles</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Dr. Yohannes Alemu"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingAdmin}
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="admin@michupharmacy.com"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {editingAdmin ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingAdmin}
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Role *
                  </label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-white focus:border-emerald-500 outline-none"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Administrator</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="+251-911-000000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {editingAdmin && (
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={e => setFormActive(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Account is Active</span>
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingAdmin ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
