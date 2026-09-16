import { getAccessToken, getAdminAccessToken, clearAdminTokens } from '../auth/tokens';
import { clearProductsCache } from './products';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const BASE_URL = API_URL.replace('/api/v1', '');

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function getMediaUrl(path: string | null | undefined): string | null {
  return getImageUrl(path);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAdminAccessToken() || getAccessToken();
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
    if ((response.status === 401 || response.status === 403) && typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/admin/login')) {
      clearAdminTokens();
      window.location.href = '/admin/login';
    }
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
  price: string | number;
  brand: string | null;
  category: string | null;
  prescriptionRequired: boolean;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  attributes: Record<string, any> | null;
  status?: string;
  expiryDate?: string | null;
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

export async function getProductById(id: number): Promise<Product> {
  return request<Product>(`/products/${id}`);
}

export async function uploadProductImage(file: File): Promise<{ url: string; filename: string; message: string }> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/products/upload`, {
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

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const result = await request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  clearProductsCache();
  return result;
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  const result = await request<Product>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  clearProductsCache();
  return result;
}

export async function deleteProduct(id: number): Promise<{ message: string }> {
  const result = await request<{ message: string }>(`/products/${id}`, {
    method: 'DELETE',
  });
  clearProductsCache();
  return result;
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

export async function getCategoryById(id: number): Promise<{ id: number; name: string; slug: string; description?: string; productCount: number; status: string; displayOrder: number }> {
  return request(`/categories/${id}`);
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

/* ── Prescriptions ─────────────────────────────────────── */
export interface PrescriptionItem {
  id: number | string;
  patientName?: string;
  patientPhone?: string;
  user?: { firstName?: string; lastName?: string; email?: string; phone?: string };
  fileUrl?: string;
  imageUrl?: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  drugRequested?: string;
  doctorName?: string;
  notes?: string;
  pharmacistNotes?: string;
  createdAt: string;
}

export async function getPrescriptions(): Promise<PrescriptionItem[]> {
  return request<PrescriptionItem[]>('/prescriptions');
}

export async function getPrescriptionById(id: number | string): Promise<PrescriptionItem> {
  return request<PrescriptionItem>(`/prescriptions/${id}`);
}

export async function updatePrescriptionStatus(
  id: number | string,
  data: { status: 'pending' | 'verified' | 'approved' | 'rejected'; notes?: string; pharmacistNotes?: string },
): Promise<PrescriptionItem> {
  return request<PrescriptionItem>(`/prescriptions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/* ── Customers ─────────────────────────────────────────── */
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  status: 'active' | 'inactive';
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastLogin: string | null;
  emailVerified: boolean;
}

export interface CustomerStats {
  total: number;
  active: number;
  newThisMonth: number;
}

export async function getCustomers(): Promise<Customer[]> {
  return request<Customer[]>('/customers');
}

export async function getCustomerStats(): Promise<CustomerStats> {
  return request<CustomerStats>('/customers/stats');
}

export async function getCustomerById(id: number | string): Promise<Customer> {
  return request<Customer>(`/customers/${id}`);
}

export async function updateCustomer(id: number | string, data: Partial<Customer>): Promise<Customer> {
  return request<Customer>(`/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(id: number | string): Promise<{ message: string }> {
  return request<{ message: string }>(`/customers/${id}`, {
    method: 'DELETE',
  });
}

/* ── Advertisements ────────────────────────────────────── */
export interface Advertisement {
  id: number;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  targetUrl: string;
  targetPage: string;
  position: string;
  displayOrder: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published' | 'active' | 'paused' | 'expired';
  createdBy?: string;
  clicks?: number;
  views?: number;
  createdAt: string;
  updatedAt: string;
}

export async function getAdvertisements(): Promise<Advertisement[]> {
  return request<Advertisement[]>('/advertisements');
}

export async function getAdvertisementById(id: number): Promise<Advertisement> {
  return request<Advertisement>(`/advertisements/${id}`);
}

export async function createAdvertisement(data: Partial<Advertisement>): Promise<Advertisement> {
  return request<Advertisement>('/advertisements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdvertisement(id: number, data: Partial<Advertisement>): Promise<Advertisement> {
  return request<Advertisement>(`/advertisements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteAdvertisement(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/advertisements/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadAdvertisementMedia(file: File): Promise<{
  url: string;
  type: 'image' | 'video';
  message: string;
  filename: string;
}> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/advertisements/upload`, {
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

/* ── Articles ──────────────────────────────────────────── */
export interface Article {
  id: number;
  title: string;
  slug?: string;
  content: string;
  summary?: string;
  category: string;
  author: string;
  imageUrl?: string;
  status: 'draft' | 'published';
  views?: number;
  createdAt: string;
  updatedAt: string;
}

export async function getArticles(): Promise<Article[]> {
  return request<Article[]>('/articles');
}

export async function getArticleById(id: number): Promise<Article> {
  return request<Article>(`/articles/${id}`);
}

export async function createArticle(data: Partial<Article>): Promise<Article> {
  return request<Article>('/articles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateArticle(id: number, data: Partial<Article>): Promise<Article> {
  return request<Article>(`/articles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteArticle(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/articles/${id}`, {
    method: 'DELETE',
  });
}

/* ── Branches ──────────────────────────────────────────── */
export interface Branch {
  id: number;
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  openingHours: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export async function getBranches(): Promise<Branch[]> {
  return request<Branch[]>('/branches');
}

export async function getBranchById(id: number): Promise<Branch> {
  return request<Branch>(`/branches/${id}`);
}

export async function createBranch(data: Partial<Branch>): Promise<Branch> {
  return request<Branch>('/branches', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBranch(id: number, data: Partial<Branch>): Promise<Branch> {
  return request<Branch>(`/branches/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteBranch(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/branches/${id}`, {
    method: 'DELETE',
  });
}

/* ── Videos ────────────────────────────────────────────── */
export interface Video {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: string;
  duration?: string;
  views?: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export async function getVideos(): Promise<Video[]> {
  return request<Video[]>('/videos');
}

export async function getVideoById(id: number): Promise<Video> {
  return request<Video>(`/videos/${id}`);
}

export async function createVideo(data: Partial<Video>): Promise<Video> {
  return request<Video>('/videos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVideo(id: number, data: Partial<Video>): Promise<Video> {
  return request<Video>(`/videos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteVideo(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/videos/${id}`, {
    method: 'DELETE',
  });
}

/* ── Reports ───────────────────────────────────────────── */
export interface RevenueReport {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: { name: string; revenue: number }[];
}

export interface OrdersReport {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  ordersByStatus: { status: string; count: number }[];
}

export interface ProductsReport {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  topSelling: { name: string; sold: number }[];
}

export interface CustomersReport {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  topCustomers: { name: string; orders: number; spent: number }[];
}

export async function getRevenueReport(startDate?: string, endDate?: string): Promise<RevenueReport> {
  const qs = new URLSearchParams();
  if (startDate) qs.set('startDate', startDate);
  if (endDate) qs.set('endDate', endDate);
  const q = qs.toString();
  return request<RevenueReport>(`/reports/revenue${q ? `?${q}` : ''}`);
}

export async function getOrdersReport(): Promise<OrdersReport> {
  return request<OrdersReport>('/reports/orders');
}

export async function getProductsReport(): Promise<ProductsReport> {
  return request<ProductsReport>('/reports/products');
}

export async function getCustomersReport(): Promise<CustomersReport> {
  return request<CustomersReport>('/reports/customers');
}

export async function getInventoryReport(): Promise<any> {
  return request('/reports/inventory');
}

/* ── Doctors ───────────────────────────────────────────── */
export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  experienceYears: number;
  contactEmail: string;
  contactPhone?: string;
  bio?: string;
  languages?: string[];
  certifications?: string[];
  imageUrl?: string;
  status: string;
  availableForConsultation: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getDoctors(): Promise<Doctor[]> {
  return request<Doctor[]>('/doctors');
}

export async function getDoctorById(id: number | string): Promise<Doctor> {
  return request<Doctor>(`/doctors/${id}`);
}

export async function createDoctor(data: Partial<Doctor>): Promise<Doctor> {
  return request<Doctor>('/doctors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDoctor(id: number | string, data: Partial<Doctor>): Promise<Doctor> {
  return request<Doctor>(`/doctors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteDoctor(id: number | string): Promise<{ message: string }> {
  return request<{ message: string }>(`/doctors/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadDoctorImage(file: File): Promise<{ url: string; message: string }> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/doctors/upload`, {
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

/* ── Admin Accounts Management ────────────────────────────── */
export interface AdminAccount {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff' | string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAdmins(): Promise<AdminAccount[]> {
  return request<AdminAccount[]>('/admins');
}

export async function getAdminById(id: number | string): Promise<AdminAccount> {
  return request<AdminAccount>(`/admins/${id}`);
}

export async function createAdmin(data: { email: string; password: string; name: string; role?: string; phone?: string }): Promise<AdminAccount> {
  return request<AdminAccount>('/admins', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdmin(id: number | string, data: Partial<{ email: string; name: string; role: string; phone: string; isActive: boolean; password?: string }>): Promise<AdminAccount> {
  return request<AdminAccount>(`/admins/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteAdmin(id: number | string): Promise<{ message: string }> {
  return request<{ message: string }>(`/admins/${id}`, {
    method: 'DELETE',
  });
}

/* ── Partners ─────────────────────────────────────────────── */
export interface Partner {
  id: number;
  name: string;
  category: 'manufacturer' | 'regulatory' | 'fintech' | 'health_system';
  badge: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export async function getPartners(): Promise<Partner[]> {
  return request<Partner[]>('/partners');
}

export async function getPartnerById(id: number | string): Promise<Partner> {
  return request<Partner>(`/partners/${id}`);
}

export async function createPartner(data: Partial<Partner>): Promise<Partner> {
  return request<Partner>('/partners', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePartner(id: number | string, data: Partial<Partner>): Promise<Partner> {
  return request<Partner>(`/partners/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deletePartner(id: number | string): Promise<{ message: string }> {
  return request<{ message: string }>(`/partners/${id}`, {
    method: 'DELETE',
  });
}


