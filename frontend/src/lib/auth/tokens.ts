const ACCESS_TOKEN_KEY = 'michu_access_token';
const REFRESH_TOKEN_KEY = 'michu_refresh_token';
const ADMIN_ACCESS_TOKEN_KEY = 'admin_access_token';
const ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  // If on admin routes, strictly use admin-specific token
  if (window.location.pathname.startsWith('/admin')) {
    return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAdminAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  if (window.location.pathname.startsWith('/admin')) {
    const adminRefresh = localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
    if (adminRefresh) return adminRefresh;
  }
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function setAdminTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearAdminTokens(): void {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
  localStorage.removeItem('admin_data');
}

