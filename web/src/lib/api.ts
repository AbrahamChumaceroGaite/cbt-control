import type { IApiResponse } from '@control-aula/shared'

/**
 * Wraps fetch() and unwraps IApiResponse<T>.
 * Throws if status !== 'success' or if the HTTP request fails.
 */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res  = await fetch(url, init)
  const body = await res.json() as IApiResponse<T>

  if (!res.ok || body.status !== 'success') {
    throw new Error(body.message ?? `Error ${res.status}`)
  }

  return body.data as T
}
