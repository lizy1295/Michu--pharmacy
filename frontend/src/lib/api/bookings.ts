import { apiFetch } from '../auth/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface CreateBookingPayload {
  doctorId?: number;
  doctorName: string;
  requestedDate: string;  // ISO date "YYYY-MM-DD"
  requestedTime: string;  // e.g. "10:00 AM"
  reason: string;
  customerPhone?: string;
  customerName?: string;  // from auth context
}

export interface Booking {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  doctorId?: number | null;
  doctorName: string;
  requestedDate: string;
  requestedTime: string;
  reason: string;
  status: BookingStatus;
  adminNotes?: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingListResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Submit a consultation booking request.
 * Requires an authenticated session (JWT).
 */
export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  return apiFetch<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Retrieve the authenticated customer's own bookings.
 */
export async function getMyBookings(): Promise<Booking[]> {
  return apiFetch<Booking[]>('/bookings/my');
}

/**
 * Admin: list all bookings with optional filtering.
 */
export async function getAdminBookings(params?: {
  status?: BookingStatus;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<BookingListResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiFetch<BookingListResponse>(`/bookings${qs ? `?${qs}` : ''}`);
}

/**
 * Admin: update a booking's status.
 */
export async function updateBookingStatus(
  id: number,
  status: 'confirmed' | 'cancelled' | 'completed',
  adminNotes?: string,
): Promise<Booking> {
  return apiFetch<Booking>(`/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNotes }),
  });
}

/**
 * Get a single booking by ID (authenticated, ownership enforced server-side).
 */
export async function getBookingById(id: number): Promise<Booking> {
  return apiFetch<Booking>(`/bookings/${id}`);
}
