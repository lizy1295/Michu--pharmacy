'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { getDoctors, deleteDoctor, Doctor, getImageUrl } from '@/lib/api/admin';

function AdminDoctorsContent() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await deleteDoctor(id);
      setDoctors(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete doctor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Doctors</h1>
          <p className="text-sm text-slate-500 mt-1">Manage doctors for consultations</p>
        </div>
        <Link href="/admin/doctors/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:from-emerald-700 hover:to-emerald-800 transition shadow-md shadow-emerald-600/20">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Add New Doctor
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-semibold">Loading doctors...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between shadow-xs">
              <div>
                <div className="aspect-square rounded-xl bg-slate-50 mb-4 flex items-center justify-center text-3xl border border-slate-100 overflow-hidden relative">
                  {doctor.imageUrl ? (
                    <img src={getImageUrl(doctor.imageUrl) as string} alt={`${doctor.firstName} ${doctor.lastName}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-slate-300">👨‍⚕️</span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Dr. {doctor.firstName} {doctor.lastName}</h3>
                <p className="text-sm text-emerald-600 font-semibold mb-2">{doctor.specialization}</p>
                {doctor.certifications && doctor.certifications.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {doctor.certifications.map((cert, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                        <span>✓</span> {cert}
                      </span>
                    ))}
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {doctor.contactEmail}
                  </p>
                  {doctor.contactPhone && (
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {doctor.contactPhone}
                    </p>
                  )}
                </div>
                {doctor.languages && doctor.languages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {doctor.languages.map((lang, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                        {lang}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                <Link href={`/admin/doctors/${doctor.id}/edit`} className="flex-1 text-center py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs">Edit</Link>
                <button onClick={() => handleDelete(doctor.id)} className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition">Delete</button>
              </div>
            </div>
          ))}
          {doctors.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="font-semibold text-slate-700">No doctors added yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-semibold">Loading doctors...</div>}>
      <AdminDoctorsContent />
    </Suspense>
  );
}
