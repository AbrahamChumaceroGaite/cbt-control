import type { IApiResponse } from '@control-aula/shared'

/**
 * Reads, unwraps IApiResponse<T> and returns only the data.
 * Use for GET (read) calls.
 */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res  = await fetch(url, init)
  const body = await res.json() as IApiResponse<T>

  if (!res.ok || body.status !== 'success') {
    throw new Error(body.message ?? `Error ${res.status}`)
  }

  return body.data as T
}

/**
 * Mutation variant — returns both data and the backend message.
 * Use for POST / PUT / PATCH / DELETE so the UI can show the exact API message.
 */
export async function apiFetchFull<T>(
  url: string,
  init?: RequestInit,
): Promise<{ data: T; message: string }> {
  const res  = await fetch(url, init)
  const body = await res.json() as IApiResponse<T>

  if (!res.ok || body.status !== 'success') {
    throw new Error(body.message ?? `Error ${res.status}`)
  }

  return { data: body.data as T, message: body.message ?? 'OK' }
}
