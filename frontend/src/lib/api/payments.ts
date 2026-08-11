import { getAccessToken } from '../auth/tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

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

export interface InitiatePaymentParams {
  orderId: number;
  paymentMethod: 'telebirr' | 'cbe';
  returnUrl?: string;
}

export interface InitiatePaymentResult {
  paymentId: number;
  paymentNumber: string;
  paymentMethod: 'telebirr' | 'cbe';
  amount: number;
  checkoutUrl?: string;
  providerReference?: string;
  status: string;
}

export interface PaymentDetails {
  id: number;
  paymentNumber: string;
  orderId: number;
  paymentMethod: 'telebirr' | 'cbe';
  amount: number;
  currency: string;
  providerTransactionId?: string;
  providerReference?: string;
  status: 'PENDING' | 'PAYMENT_INITIATED' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  checkoutUrl?: string;
  errorMessage?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  status: 'PENDING' | 'PAYMENT_INITIATED' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  payment: PaymentDetails;
  message?: string;
}

export async function initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
  return request<InitiatePaymentResult>('/payments/initiate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getPaymentStatus(paymentId: number): Promise<PaymentDetails> {
  return request<PaymentDetails>(`/payments/${paymentId}`);
}

export async function getPaymentByOrderId(orderId: number): Promise<PaymentDetails | null> {
  return request<PaymentDetails>(`/payments/order/${orderId}`).catch(() => null);
}

export async function verifyPayment(paymentId: number): Promise<VerifyPaymentResult> {
  return request<VerifyPaymentResult>(`/payments/${paymentId}/verify`, {
    method: 'POST',
  });
}
