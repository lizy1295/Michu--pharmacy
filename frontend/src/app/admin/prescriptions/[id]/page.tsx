'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPrescriptionById, updatePrescriptionStatus, PrescriptionItem } from '@/lib/api/admin';

export default function AdminPrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [prescription, setPrescription] = useState<PrescriptionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchRx = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPrescriptionById(id);
        setPrescription(data);
        if (data.pharmacistNotes) setPharmacistNotes(data.pharmacistNotes);
      } catch (err: any) {
        setError(err.message || 'Failed to load prescription details');
      } finally {
        setLoading(false);
      }
    };
    fetchRx();
  }, [id]);

  const handleStatusUpdate = async (status: 'verified' | 'rejected') => {
    setUpdating(true);
    setError('');
    setMessage('');
    try {
      const updated = await updatePrescriptionStatus(id, {
        status,
        pharmacistNotes: pharmacistNotes || undefined,
      });
      setPrescription(updated);
      setMessage(`Prescription marked as ${status.toUpperCase()} successfully.`);
    } catch (err: any) {
      setError(err.message || 'Failed to update prescription status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-700/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <p className="text-slate-500">{error || `Prescription #${id} not found.`}</p>
        <Link href="/admin/prescriptions" className="text-emerald-600 font-bold hover:underline text-sm">
          &larr; Back to Prescriptions List
        </Link>
      </div>
    );
  }

  const patientName = prescription.patientName || (prescription.user ? `${prescription.user.firstName || ''} ${prescription.user.lastName || ''}`.trim() : 'Patient');
  const patientContact = prescription.patientPhone || prescription.user?.phone || prescription.user?.email || 'N/A';
  const docUrl = prescription.fileUrl || prescription.imageUrl;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button + title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/prescriptions" className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Prescription Verification</h1>
            <p className="text-sm text-slate-500 mt-0.5">Review #{prescription.id} &bull; {patientName}</p>
          </div>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
            prescription.status === 'verified' || prescription.status === 'approved'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : prescription.status === 'rejected'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {prescription.status}
          </span>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Patient & Medication Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Patient Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Full Name</p>
                <p className="text-slate-900 font-semibold mt-0.5">{patientName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Phone / Email</p>
                <p className="text-slate-900 font-medium mt-0.5">{patientContact}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload Timestamp</p>
                <p className="text-slate-700 mt-0.5">{prescription.createdAt ? new Date(prescription.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Clinical Instructions</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medications Requested</p>
                <p className="text-slate-800 font-medium mt-0.5">{prescription.drugRequested || 'As written on attached document'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescribing Doctor / Hospital</p>
                <p className="text-slate-800 font-medium mt-0.5">{prescription.doctorName || 'Clinical Partner'}</p>
              </div>
              {prescription.notes && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Upload Note</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 mt-1">{prescription.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Document Viewer & Pharmacist Decision */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Prescription Document</h2>
            {docUrl ? (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video flex items-center justify-center">
                  <img src={docUrl} alt="Prescription Attachment" className="w-full h-full object-contain" />
                </div>
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  🔍 Open Full Image in New Tab
                </a>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No image or document attached to this prescription.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Pharmacist Decision & Notes</h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Internal Pharmacist Notes / Reason
              </label>
              <textarea
                rows={3}
                value={pharmacistNotes}
                onChange={e => setPharmacistNotes(e.target.value)}
                placeholder="Add verification notes, dosage adjustments, or rejection explanation..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={updating}
                onClick={() => handleStatusUpdate('verified')}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {updating ? 'Updating...' : '✅ Approve Prescription'}
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => handleStatusUpdate('rejected')}
                className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition disabled:opacity-50"
              >
                {updating ? 'Updating...' : '❌ Reject Prescription'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
