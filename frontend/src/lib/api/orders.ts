import { getAccessToken } from '../auth/tokens';
import { apiFetch } from '../auth/apiClient';

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
    const err = new Error(Array.isArray(message) ? message.join(', ') : message) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  prescriptionRequired?: boolean;
  imageType?: string;
}

export interface CreateOrderPayload {
  customerId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  deliveryFee?: number;
  notes?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'approved' | 'shipped' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'payment_initiated' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  transactionId?: string | null;
  proofImage?: string | null;
  notes?: string;
  approvedAt?: string;
  shippedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOrders(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<OrderListResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  // Uses apiFetch (auto token-refresh on 401) for admin-only endpoint
  return apiFetch<OrderListResponse>(`/orders${qs ? `?${qs}` : ''}`);
}

export async function getOrderById(id: number): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}

export async function getOrdersByCustomer(params: {
  email?: string;
  customerId?: number;
}): Promise<Order[]> {
  const query = new URLSearchParams();
  if (params.email) query.set('email', params.email);
  if (params.customerId) query.set('customerId', String(params.customerId));

  const qs = query.toString();
  return apiFetch<Order[]>(`/orders/customer${qs ? `?${qs}` : ''}`);
}

export async function updateOrderStatus(
  id: number,
  status: 'pending' | 'approved' | 'shipped' | 'completed' | 'cancelled',
): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
