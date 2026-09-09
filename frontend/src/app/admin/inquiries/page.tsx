'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getInquiries, replyToInquiry, Inquiry } from '@/lib/api/inquiries';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'answered'>('all');
  const [replyTexts, setReplyTexts] = useState<{ [id: number]: string }>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);


  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInquiries(statusFilter === 'all' ? undefined : statusFilter);
        setInquiries(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load inquiries.');
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, [statusFilter]);

  const handleReplySubmit = async (id: number) => {
    const text = replyTexts[id];
    if (!text || !text.trim()) return;

    setSubmittingId(id);
    setSuccessMsg(null);
    try {
      const updated = await replyToInquiry(id, { staffReply: text.trim() });
      setInquiries((prev) => prev.map((inq) => (inq.id === id ? updated : inq)));
      setSuccessMsg(`Replied to question #${id} successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to submit staff reply.');
    } finally {
      setSubmittingId(null);
    }
  };

  const openCount = inquiries.filter((i) => i.status === 'open').length;
  const answeredCount = inquiries.filter((i) => i.status === 'answered').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white border p-6 rounded-2xl shadow-xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>💬</span>
              <span>Customer Inquiries & Questions</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review questions submitted by patients and issue clinical responses.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
              {openCount} Open Questions
            </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
              {answeredCount} Answered
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-200 gap-2">
          {(['all', 'open', 'answered'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`py-2.5 px-4 text-xs font-bold border-b-2 transition uppercase tracking-wider ${
                statusFilter === st
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {st} Inquiries
            </button>
          ))}
        </div>

        {/* Inquiries List */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <svg className="animate-spin h-6 w-6 text-brand-600 mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xs font-semibold">Loading inquiries...</p>
          </div>
        ) : inquiries.length > 0 ? (
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div key={inq.id} className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
                
                {/* Header line */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{inq.customerName}</span>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        inq.status === 'answered'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📧 {inq.customerEmail} {inq.customerPhone ? `| 📞 ${inq.customerPhone}` : ''}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Submitted: {new Date(inq.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Question Message */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Question:</p>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">{inq.message}</p>
                </div>

                {/* Staff Reply Section */}
                {inq.status === 'answered' ? (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center text-emerald-900 font-bold">
                      <span>Staff Reply ({inq.repliedBy || 'Pharmacist'}):</span>
                      {inq.repliedAt && <span className="font-mono text-[10px] text-emerald-700">{new Date(inq.repliedAt).toLocaleString()}</span>}
                    </div>
                    <p className="text-slate-800 text-sm leading-relaxed">{inq.staffReply}</p>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Write Staff Answer / Clinical Advice
                    </label>
                    <textarea
                      rows={3}
                      value={replyTexts[inq.id] ?? ''}
                      onChange={(e) => setReplyTexts({ ...replyTexts, [inq.id]: e.target.value })}
                      placeholder="Type official response to customer..."
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-brand-500 focus:outline-none bg-slate-50/40"
                    />
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        disabled={submittingId === inq.id || !replyTexts[inq.id]?.trim()}
                        onClick={() => handleReplySubmit(inq.id)}
                        className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        {submittingId === inq.id ? 'Sending Reply...' : 'Send Answer & Resolve ✉️'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border">
            <p className="text-sm font-bold">No customer inquiries found for filter &quot;{statusFilter}&quot;.</p>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
