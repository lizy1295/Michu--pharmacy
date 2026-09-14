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
  /**
   * Payment method to use.
   * Do NOT include an `amount` field — the backend reads it from the database.
   */
  paymentMethod: 'telebirr' | 'cbe';
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
  proofImage?: string;
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
  // Send ONLY orderId + paymentMethod.
  // Amount is always determined server-side from the database — never from the frontend.
  return request<InitiatePaymentResult>('/payments/initialize', {
    method: 'POST',
    body: JSON.stringify({
      orderId: params.orderId,
      paymentMethod: params.paymentMethod,
    }),
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

export interface ReceiptItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  prescriptionRequired?: boolean;
  imageType?: string;
}

export interface ReceiptDetails {
  id: number;
  receiptNumber: string;
  orderId: number;
  paymentId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}

export async function getReceiptByOrderId(orderId: number): Promise<ReceiptDetails | null> {
  return request<ReceiptDetails>(`/receipts/order/${orderId}`).catch(() => null);
}

export async function uploadPaymentProof(file: File): Promise<{ message: string; url: string; filename: string }> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/payments/upload-proof`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body.message ?? `Upload failed (${response.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return response.json();
}

export interface SubmitPaymentProofParams {
  orderId: number;
  paymentMethod: string;
  transactionId?: string;
  proofImage?: string;
}

export async function submitPaymentProof(params: SubmitPaymentProofParams) {
  return request<{
    paymentId: number;
    paymentNumber: string;
    orderNumber: string;
    transactionId?: string;
    proofImage?: string;
    status: string;
  }>('/payments/submit-proof', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function adminApprovePayment(orderId: number) {
  return request<{
    success: boolean;
    payment: any;
    receipt: any;
    message: string;
  }>(`/payments/order/${orderId}/admin-approve`, {
    method: 'POST',
  });
}

export async function adminRejectPayment(orderId: number, reason?: string) {
  return request<{
    success: boolean;
    message: string;
  }>(`/payments/order/${orderId}/admin-reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
