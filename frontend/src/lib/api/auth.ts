import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '@michu/shared';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../auth/tokens';

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

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const result = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setTokens(result.tokens.accessToken, result.tokens.refreshToken);
  return result;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const result = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setTokens(result.tokens.accessToken, result.tokens.refreshToken);
  return result;
}

export async function refreshTokens(): Promise<AuthResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const result = await request<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  setTokens(result.tokens.accessToken, result.tokens.refreshToken);
  return result;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }
  clearTokens();
}

export async function getMe(): Promise<AuthUser> {
  return request<AuthUser>('/auth/me');
}

export async function forgotPassword(email?: string, phone?: string): Promise<{ message: string }> {
  // Always returns the same safe message — never throws on unknown email/phone
  return request<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email, phone }),
  });
}

export async function verifyOtp(
  email?: string,
  otp?: string,
  phone?: string,
): Promise<{ resetToken: string; message: string }> {
  return request<{ resetToken: string; message: string }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, phone, otp }),
  });
}

export async function resetPassword(
  resetToken: string,
  newPassword: string,
): Promise<{ message: string }> {
  return request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ resetToken, token: resetToken, newPassword }),
  });
}

