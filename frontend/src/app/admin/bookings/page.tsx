'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAdminBookings,
  updateBookingStatus,
  Booking,
  BookingStatus,
} from '@/lib/api/bookings';
import { getAccessToken } from '@/lib/auth/tokens';

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBookings = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsAuthError(true);
      setErrorMessage('Administrator authorisation required. Please sign in to view bookings.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setIsAuthError(false);

      const res = await getAdminBookings({
        status: statusFilter as BookingStatus || undefined,
        search: search || undefined,
      });
      setBookings(res.data ?? []);
    } catch (err: any) {
      const isUnauth =
        err?.status === 401 ||
        err?.status === 403 ||
        err?.message?.toLowerCase().includes('unauthorized') ||
        err?.message?.toLowerCase().includes('forbidden');

      if (isUnauth) {
        setIsAuthError(true);
        setErrorMessage('Administrator authorisation required. Please sign in with an admin account.');
      } else {
        setErrorMessage(err?.message ?? 'Failed to load bookings.');
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (
    id: number,
    newStatus: 'confirmed' | 'cancelled' | 'completed',
  ) => {
    setActionLoading(id);
    try {
      await updateBookingStatus(id, newStatus);
      showToast(`Booking #${id} marked as ${newStatus}.`, 'success');
      await fetchBookings();
    } catch (err: any) {
      showToast(err?.message ?? 'Action failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-xl ${
            toast.type === 'success'
              ? 'bg-neutral-900 border-neutral-700 text-white'
              : 'bg-rose-900 border-rose-700 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.text}
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Consultation Bookings</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Review and manage incoming patient booking requests.</p>
        </div>
        <button
          id="refresh-bookings-btn"
          onClick={fetchBookings}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            id="booking-search-input"
            type="text"
            placeholder="Search patient name, email, or doctor..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition"
          >
            Search
          </button>
        </form>
        <select
          id="booking-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
          className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Auth error */}
      {isAuthError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-sm font-semibold text-amber-800">{errorMessage}</p>
        </div>
      )}

      {/* General error */}
      {errorMessage && !isAuthError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !errorMessage && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-200 p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-neutral-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-semibold text-neutral-500">No bookings found.</p>
          <p className="text-xs text-neutral-400 mt-1">Bookings submitted by patients will appear here.</p>
        </div>
      )}

      {/* Bookings table */}
      {!loading && bookings.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide">ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide">Date / Time</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-400">
                    BKG-{booking.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-neutral-900 text-xs">{booking.customerName}</p>
                    <p className="text-neutral-500 text-xs">{booking.customerEmail}</p>
                    {booking.customerPhone && (
                      <p className="text-neutral-400 text-xs">{booking.customerPhone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-700 max-w-[180px]">
                    {booking.doctorName}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-700 whitespace-nowrap">
                    <p className="font-medium">{booking.requestedDate}</p>
                    <p className="text-neutral-400">{booking.requestedTime}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600 max-w-[200px]">
                    <p className="line-clamp-2">{booking.reason}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[booking.status]}`}
                    >
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {booking.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          id={`confirm-booking-${booking.id}`}
                          disabled={actionLoading === booking.id}
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                          {actionLoading === booking.id ? '...' : 'Confirm'}
                        </button>
                        <button
                          id={`cancel-booking-${booking.id}`}
                          disabled={actionLoading === booking.id}
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        id={`complete-booking-${booking.id}`}
                        disabled={actionLoading === booking.id}
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                      >
                        {actionLoading === booking.id ? '...' : 'Mark Complete'}
                      </button>
                    )}
                    {(booking.status === 'cancelled' || booking.status === 'completed') && (
                      <span className="text-xs text-neutral-400 italic">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
