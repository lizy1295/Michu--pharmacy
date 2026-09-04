/**
 * apiClient — a thin fetch wrapper that:
 *  1. Attaches the stored access token as Bearer on every request.
 *  2. On 401, attempts a silent refresh exactly once using the refresh token.
 *  3. On successful refresh, retries the original request with the new token.
 *  4. On refresh failure, clears tokens so the UI falls back to "not logged in".
 *
 * Use this instead of raw fetch() for any authenticated storefront API calls.
 */

import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

let refreshInFlight: Promise<string | null> | null = null;

async function silentRefresh(): Promise<string | null> {
  // Deduplicate concurrent refresh attempts
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const data = await res.json();
      const newAccess: string = data?.tokens?.accessToken;
      const newRefresh: string = data?.tokens?.refreshToken;
      if (!newAccess || !newRefresh) {
        clearTokens();
        return null;
      }
      setTokens(newAccess, newRefresh);
      return newAccess;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const makeRequest = (token: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> ?? {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(`${API_URL}${path}`, { ...options, headers });
  };

  let response = await makeRequest(getAccessToken());

  // Silent-refresh on 401 and retry once
  if (response.status === 401) {
    const newToken = await silentRefresh();
    if (newToken) {
      response = await makeRequest(newToken);
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = (body as any).message ?? `Request failed (${response.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
