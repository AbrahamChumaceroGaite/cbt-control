import type { IApiResponse } from '@control-aula/shared'
import { API_ROUTES, APP_ROUTES } from '@/config/routes'

/**
 * Single HTTP function for all API calls.
 * Always returns { data, message } — hooks destructure what they need.
 * Throws an Error with the backend message on failure.
 * Handles 401 by attempting a token refresh once, then redirecting to login.
 */

let isRefreshing = false

async function doFetch<T>(url: string, options?: RequestInit): Promise<{ data: T; message: string }> {
  const res  = await fetch(url, options)
  const body = await res.json() as IApiResponse<T>

  if (!res.ok || body.status !== 'success') {
    throw new Error(body.message ?? `HTTP ${res.status}`)
  }

  return { data: body.data as T, message: body.message ?? 'OK' }
}

export async function api<T>(
  url: string,
  options?: RequestInit,
): Promise<{ data: T; message: string }> {
  try {
    return await doFetch<T>(url, options)
  } catch (err: unknown) {
    const isUnauth = err instanceof Error && err.message.startsWith('HTTP 401')
    const isRefreshEndpoint = url === API_ROUTES.AUTH.REFRESH

    if (isUnauth && !isRefreshing && !isRefreshEndpoint) {
      isRefreshing = true
      try {
        await doFetch<unknown>(API_ROUTES.AUTH.REFRESH, { method: 'POST' })
        isRefreshing = false
        // Retry original request once with the new cookie
        return await doFetch<T>(url, options)
      } catch {
        isRefreshing = false
        window.location.href = APP_ROUTES.LOGIN
        // Throw to prevent the original hook from processing stale state
        throw new Error('Session expired')
      }
    }

    throw err
  }
}
