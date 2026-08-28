'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getPrescriptions, updatePrescriptionStatus, PrescriptionItem } from '@/lib/api/admin';

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [selectedRx, setSelectedRx] = useState<PrescriptionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchPrescriptionsList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPrescriptions();
      setPrescriptions(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptionsList();
  }, [fetchPrescriptionsList]);

  const handleUpdateStatus = async (id: number | string, newStatus: 'verified' | 'rejected') => {
    try {
      await updatePrescriptionStatus(id, { status: newStatus });
      setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      showToast(`Prescription #${id} marked as ${newStatus.toUpperCase()}`);
      if (selectedRx && selectedRx.id === id) {
        setSelectedRx(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update prescription status');
    }
  };

  const filteredList = prescriptions.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'verified') return p.status === 'verified' || p.status === 'approved';
    return p.status === filter;
  });

  const pendingCount = prescriptions.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-sm font-semibold flex items-center gap-2 animate-bounce">
          <span>🔔</span>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Digital Prescription Review Console</h1>
          <p className="text-sm text-slate-500 mt-1">Pharmacist digital verification workflow for Rx-controlled medications</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
            {pendingCount} Pending Pharmacist Review
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        {(['all', 'pending', 'verified', 'rejected'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
              filter === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab} {tab === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Prescription List Cards */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/80">
              <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
              <p className="font-semibold text-xs text-slate-600">Loading prescription queue...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl mx-auto mb-3">
                📋
              </div>
              <p className="font-bold text-slate-800 text-sm">No prescriptions found</p>
              <p className="text-xs text-slate-400 mt-1">Prescriptions submitted by customers during checkout or upload will appear here.</p>
            </div>
          ) : (
            filteredList.map((rx) => {
              const pName = rx.patientName || (rx.user ? `${rx.user.firstName || ''} ${rx.user.lastName || ''}`.trim() : 'Patient');
              const isSelected = selectedRx?.id === rx.id;
              return (
                <div
                  key={rx.id}
                  onClick={() => setSelectedRx(rx)}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition cursor-pointer hover:border-emerald-400 ${
                    isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-100">
                        Rx
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{pName}</h3>
                        <p className="text-xs text-slate-400 font-mono">ID: #{rx.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${
                        rx.status === 'verified' || rx.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rx.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {rx.status}
                      </span>
                      <Link
                        href={`/admin/prescriptions/${rx.id}`}
                        className="text-xs text-slate-500 hover:text-emerald-600 font-semibold px-2 py-1 rounded-md hover:bg-slate-50"
                      >
                        Details &rarr;
                      </Link>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[10px]">Medication / Request</p>
                      <p className="text-slate-800 font-medium mt-0.5">{rx.drugRequested || 'Prescription Upload Document'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[10px]">Doctor / Clinic</p>
                      <p className="text-slate-700 mt-0.5">{rx.doctorName || 'Verified Clinical Partner'}</p>
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      Uploaded {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      {rx.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(rx.id, 'verified')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                          >
                            Approve Rx
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(rx.id, 'rejected')}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Prescription Quick Inspector Sidebar */}
        <aside className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs h-fit space-y-5 lg:sticky lg:top-24">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>🔬</span> Prescription Inspector
          </h2>

          {selectedRx ? (
            <div className="space-y-4 text-xs">
              <div>
                <p className="text-slate-400 uppercase font-bold text-[10px]">Patient Name</p>
                <p className="text-slate-900 font-bold text-sm mt-0.5">
                  {selectedRx.patientName || (selectedRx.user ? `${selectedRx.user.firstName || ''} ${selectedRx.user.lastName || ''}`.trim() : 'Patient')}
                </p>
              </div>

              <div>
                <p className="text-slate-400 uppercase font-bold text-[10px]">Status</p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${
                  selectedRx.status === 'verified' || selectedRx.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedRx.status === 'rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {selectedRx.status}
                </span>
              </div>

              {selectedRx.notes && (
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Clinical Instructions / Notes</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 mt-1 leading-relaxed">
                    {selectedRx.notes}
                  </p>
                </div>
              )}

              {(selectedRx.fileUrl || selectedRx.imageUrl) && (
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[10px] mb-1.5">Document Attachment</p>
                  <a
                    href={selectedRx.fileUrl || selectedRx.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-center hover:bg-emerald-100 transition"
                  >
                    📄 View Full Prescription Document
                  </a>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href={`/admin/prescriptions/${selectedRx.id}`}
                  className="w-full text-center py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition shadow-xs"
                >
                  Open Full Review Page
                </Link>
                {selectedRx.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateStatus(selectedRx.id, 'verified')}
                      className="py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRx.id, 'rejected')}
                      className="py-2 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <p>Select any prescription card to inspect and review clinical instructions.</p>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}
