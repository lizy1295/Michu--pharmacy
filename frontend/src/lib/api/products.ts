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
  price: string; // serialized as string from decimal in Postgres
  brand: string | null;
  category: string | null;
  prescriptionRequired: boolean;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  attributes: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export async function getProducts(): Promise<Product[]> {
  const res = await request<any>('/products');
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function getProductById(id: number): Promise<Product> {
  return request<Product>(`/products/${id}`);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const res = await request<any>(`/products/category/${encodeURIComponent(category)}`);
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function getProductsByBrand(brand: string): Promise<Product[]> {
  const res = await request<any>(`/products/brand/${encodeURIComponent(brand)}`);
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

