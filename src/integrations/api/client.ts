/**
 * Cliente API para el backend PostgreSQL (Railway).
 * Sustituye al cliente Supabase: las llamadas van a tu API Express + Postgres.
 *
 * Uso:
 *   import { api } from "@/integrations/api/client";
 *   const data = await api.get("/api/health");
 */

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '') || '';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = unknown>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T = unknown>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = unknown>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};

/** Comprueba si el backend está configurado (misma origen o VITE_API_URL). */
export function isApiConfigured(): boolean {
  return true;
}
