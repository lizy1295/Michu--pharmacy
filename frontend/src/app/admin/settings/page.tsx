'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getBusinessSettings, updateBusinessSettings, BusinessSettings } from '@/lib/api/admin';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getBusinessSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage('');

    try {
      await updateBusinessSettings(settings);
      setMessage('Settings saved successfully');
    } catch (err: any) {
      setMessage(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateDayHours = (day: string, field: 'open' | 'close', value: string) => {
    setSettings(prev => prev ? {
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: { ...prev.businessHours[day], [field]: value }
      }
    } : null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-emerald-700/30 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <p className="text-emerald-400">Failed to load settings</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Store Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure business operating info, delivery rules, and contact details</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border ${message.includes('success') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'} text-sm font-semibold`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">General Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pharmacy Name *</label>
                <input
                  type="text"
                  value={settings.websiteName}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, websiteName: e.target.value } : null)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Logo URL</label>
                <input
                  type="text"
                  value={settings.logo || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, logo: e.target.value } : null)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Contact Email *</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, contactEmail: e.target.value } : null)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Contact Phone *</label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, contactPhone: e.target.value } : null)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Address</label>
                <textarea
                  value={settings.address || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, address: e.target.value } : null)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 resize-none transition"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Delivery & Payment Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Standard Delivery Fee (ETB)</label>
                <input
                  type="number"
                  value={settings.deliveryFee}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, deliveryFee: parseFloat(e.target.value) || 0 } : null)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Free Delivery Threshold (ETB)</label>
                <input
                  type="number"
                  value={settings.freeDeliveryThreshold || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, freeDeliveryThreshold: parseFloat(e.target.value) || 0 } : null)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 transition"
                  placeholder="Minimum order for free delivery"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, currency: e.target.value } : null)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800 font-medium transition"
                >
                  <option value="ETB">ETB - Ethiopian Birr</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Social Media Links</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Facebook</label>
                <input
                  type="url"
                  value={settings.socialMedia?.facebook || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, socialMedia: { ...prev.socialMedia, facebook: e.target.value } } : null)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800 transition"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Instagram</label>
                <input
                  type="url"
                  value={settings.socialMedia?.instagram || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, socialMedia: { ...prev.socialMedia, instagram: e.target.value } } : null)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800 transition"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Telegram</label>
                <input
                  type="url"
                  value={settings.socialMedia?.telegram || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, socialMedia: { ...prev.socialMedia, telegram: e.target.value } } : null)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800 transition"
                  placeholder="https://t.me/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Twitter / X</label>
                <input
                  type="url"
                  value={settings.socialMedia?.twitter || ''}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, socialMedia: { ...prev.socialMedia, twitter: e.target.value } } : null)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800 transition"
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Business Hours</h3>

            <div className="space-y-3">
              {DAYS.map((day) => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                  <div className="w-28">
                    <span className="text-xs font-bold text-slate-800 capitalize">{day}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="time"
                      value={settings.businessHours[day]?.open || ''}
                      onChange={(e) => updateDayHours(day, 'open', e.target.value)}
                      disabled={settings.businessHours[day]?.closed}
                      className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold focus:bg-white focus:border-emerald-500 outline-none text-slate-800 disabled:opacity-40"
                    />
                    <span className="text-xs text-slate-400 font-semibold">to</span>
                    <input
                      type="time"
                      value={settings.businessHours[day]?.close || ''}
                      onChange={(e) => updateDayHours(day, 'close', e.target.value)}
                      disabled={settings.businessHours[day]?.closed}
                      className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold focus:bg-white focus:border-emerald-500 outline-none text-slate-800 disabled:opacity-40"
                    />
                    <label className="flex items-center gap-2 cursor-pointer ml-2">
                      <input
                        type="checkbox"
                        checked={settings.businessHours[day]?.closed || false}
                        onChange={(e) => {
                          setSettings(prev => prev ? {
                            ...prev,
                            businessHours: {
                              ...prev.businessHours,
                              [day]: { ...prev.businessHours[day], closed: e.target.checked }
                            }
                          } : null);
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-semibold text-rose-600">Closed</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50 shadow-md shadow-emerald-600/20"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
