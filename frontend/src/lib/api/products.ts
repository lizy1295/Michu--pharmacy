import { getAccessToken } from '../auth/tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const BASE_URL = API_URL.replace('/api/v1', '');

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

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
  price: string | number; // supports string from Postgres decimal or numeric representation
  brand: string | null;
  category: string | null;
  prescriptionRequired: boolean;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  attributes: Record<string, any> | null;
  status?: string | null;
  expiryDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

// In-memory cache for getProducts to eliminate network lag across layout & page renders
let cachedProducts: Product[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds TTL

export async function getProducts(forceRefresh = false): Promise<Product[]> {
  const now = Date.now();
  if (!forceRefresh && cachedProducts && (now - cacheTimestamp < CACHE_TTL)) {
    return cachedProducts;
  }

  try {
    const res = await request<any>('/products?limit=100');
    let items: Product[] = [];
    if (Array.isArray(res)) {
      items = res;
    } else if (res && Array.isArray(res.data)) {
      items = res.data;
    }
    if (items.length > 0) {
      cachedProducts = items;
      cacheTimestamp = now;
    }
    return items;
  } catch (err) {
    console.warn('Failed to fetch products from backend API, returning available cache if present:', err);
    return cachedProducts || [];
  }
}

export async function getProductById(id: number): Promise<Product> {
  try {
    return await request<Product>(`/products/${id}`);
  } catch (err) {
    // If cache has this product, fallback to cached instance
    if (cachedProducts) {
      const match = cachedProducts.find((p) => p.id === id);
      if (match) return match;
    }
    throw err;
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const res = await request<any>(`/products/category/${encodeURIComponent(category)}`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  } catch (err) {
    console.warn('getProductsByCategory API fallback:', err);
    const all = await getProducts();
    return all.filter((p) => (p.category ?? '').toLowerCase() === category.toLowerCase());
  }
}

export async function getProductsByBrand(brand: string): Promise<Product[]> {
  try {
    const res = await request<any>(`/products/brand/${encodeURIComponent(brand)}`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  } catch (err) {
    console.warn('getProductsByBrand API fallback:', err);
    const all = await getProducts();
    return all.filter((p) => (p.brand ?? '').toLowerCase() === brand.toLowerCase());
  }
}

// Invalidate cache helper (e.g. after adding/editing products)
export function clearProductsCache(): void {
  cachedProducts = null;
  cacheTimestamp = 0;
}
