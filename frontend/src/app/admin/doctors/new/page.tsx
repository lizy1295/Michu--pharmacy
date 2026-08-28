'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createDoctor, uploadDoctorImage } from '@/lib/api/admin';

const AVAILABLE_LANGUAGES = [
  'Amharic',
  'English',
  'Tigrigna',
  'Oromic',
  'Afar',
  'Somalia'
];

export default function AdminDoctorsNewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    experienceYears: '',
    contactEmail: '',
    contactPhone: '',
    bio: '',
    languages: [] as string[],
    status: 'active',
    availableForConsultation: true,
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Invalid image type. Only JPG, PNG, and WEBP are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const result = await uploadDoctorImage(file);
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => setFormData(prev => ({ ...prev, imageUrl: '' }));

  const toggleLanguage = (lang: string) => {
    setFormData(prev => {
      if (prev.languages.includes(lang)) {
        return { ...prev, languages: prev.languages.filter(l => l !== lang) };
      }
      return { ...prev, languages: [...prev.languages, lang] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createDoctor({
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization,
        experienceYears: parseInt(formData.experienceYears) || 0,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        bio: formData.bio || undefined,
        languages: formData.languages,
        status: formData.status,
        availableForConsultation: formData.availableForConsultation,
        imageUrl: formData.imageUrl || undefined,
      });
      router.push('/admin/doctors');
    } catch (err: any) {
      setError(err.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/doctors" className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Add New Doctor</h1>
          <p className="text-sm text-slate-500 mt-0.5">Register a new doctor for consultations</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Specialization *</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800"
                placeholder="e.g. Cardiologist, General Physician"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Experience (Years) *</label>
              <input
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address *</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Languages Spoken</label>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_LANGUAGES.map(lang => (
                <label key={lang} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition ${formData.languages.includes(lang) ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600 font-medium hover:bg-slate-100'}`}>
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(lang)}
                    onChange={() => toggleLanguage(lang)}
                    className="hidden"
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bio / Description</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800 resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Doctor Profile Image</h3>
          <div className="flex items-start gap-4">
            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-slate-300">👨‍⚕️</span>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition"
              />
              {uploading && <p className="text-xs text-emerald-600 font-semibold">Uploading...</p>}
              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition"
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/doctors"
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Doctor'}
          </button>
        </div>
      </form>
    </div>
  );
}
