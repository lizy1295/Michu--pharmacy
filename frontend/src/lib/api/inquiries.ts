import { getAccessToken } from '../auth/tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export type InquiryStatus = 'open' | 'answered';

export interface Inquiry {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message: string;
  status: InquiryStatus;
  staffReply?: string;
  repliedBy?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInquiryPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message: string;
}

export interface ReplyInquiryPayload {
  staffReply: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body.message ?? `Request failed (${response.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return response.json();
}

export async function submitInquiry(payload: CreateInquiryPayload): Promise<Inquiry> {
  return request<Inquiry>('/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getInquiries(status?: string): Promise<Inquiry[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return request<Inquiry[]>(`/inquiries${query}`);
}

export async function replyToInquiry(id: number | string, payload: ReplyInquiryPayload): Promise<Inquiry> {
  return request<Inquiry>(`/inquiries/${id}/reply`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
