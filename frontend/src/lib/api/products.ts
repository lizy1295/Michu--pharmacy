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

// Example function - update with actual Product type when available
export interface Product {
  id: string;
  name: string;
  price: number;
  [key: string]: any;
}

export async function getProducts(): Promise<Product[]> {
  return request<Product[]>('/products');
}

export async function getProductById(id: string): Promise<Product> {
  return request<Product>(`/products/${id}`);
}
