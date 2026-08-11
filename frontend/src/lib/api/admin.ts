import { getAccessToken } from '../auth/tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string | null;
  category: string | null;
  prescriptionRequired: boolean;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  attributes: Record<string, any> | null;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalRevenue: number;
  todayOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalPrescriptions: number;
  pendingOrders: number;
  outOfStock: number;
  monthlySales: number;
  productsSold: number;
  averageOrderValue: number;
}

export interface TopProduct {
  id: number;
  name: string;
  brand: string;
  sold: number;
  revenue: number;
}

export interface RecentCustomer {
  id: number;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joinedAt: string;
}

export interface BusinessSettings {
  websiteName: string;
  logo?: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  deliveryFee: number;
  freeDeliveryThreshold?: number;
  currency: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
    twitter?: string;
  };
  businessHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
}

export async function getProductsFiltered(params: {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  prescriptionRequired?: boolean;
  page?: number;
  limit?: number;
}): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.brand) query.set('brand', params.brand);
  if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
  if (params.status) query.set('status', params.status);
  if (params.prescriptionRequired !== undefined) query.set('prescriptionRequired', String(params.prescriptionRequired));
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  return request<ProductListResponse>(`/products${qs ? `?${qs}` : ''}`);
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  return request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  return request<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/products/${id}`, {
    method: 'DELETE',
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/dashboard/stats');
}

export async function getRevenue(period?: string): Promise<{ labels: string[]; values: number[] }> {
  return request<{ labels: string[]; values: number[] }>(`/dashboard/revenue${period ? `?period=${period}` : ''}`);
}

export async function getOrdersChart(): Promise<{ labels: string[]; values: number[] }> {
  return request<{ labels: string[]; values: number[] }>('/dashboard/orders-chart');
}

export async function getTopProducts(limit = 10): Promise<TopProduct[]> {
  return request<TopProduct[]>(`/dashboard/top-products?limit=${limit}`);
}

export async function getRecentCustomers(limit = 10): Promise<RecentCustomer[]> {
  return request<RecentCustomer[]>(`/dashboard/recent-customers?limit=${limit}`);
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  return request<BusinessSettings>('/settings/business');
}

export async function updateBusinessSettings(data: Partial<BusinessSettings>): Promise<BusinessSettings> {
  return request<BusinessSettings>('/settings/business', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getCategories(): Promise<{ id: number; name: string; slug: string; productCount: number; status: string }[]> {
  return request('/categories');
}

export async function createCategory(data: { name: string; slug: string; description?: string; status?: string; displayOrder?: number }): Promise<any> {
  return request('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: number, data: { name?: string; slug?: string; description?: string; status?: string; displayOrder?: number }): Promise<any> {
  return request(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: number): Promise<{ message: string }> {
  return request(`/categories/${id}`, {
    method: 'DELETE',
  });
}
