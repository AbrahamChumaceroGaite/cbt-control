import type { IApiResponse } from '@control-aula/shared'

/**
 * Single HTTP function for all API calls.
 * Always returns { data, message } — hooks destructure what they need.
 * Throws an Error with the backend message on failure.
 */
export async function api<T>(
  url: string,
  options?: RequestInit,
): Promise<{ data: T; message: string }> {
  const res  = await fetch(url, options)
  const body = await res.json() as IApiResponse<T>

  if (!res.ok || body.status !== 'success') {
    throw new Error(body.message ?? `HTTP ${res.status}`)
  }

  return { data: body.data as T, message: body.message ?? 'OK' }
}
