'use client'
import { useEffect, useState } from 'react'
import { DEBOUNCE_MS }         from '@/config/ui'

/**
 * Returns a debounced copy of value that updates only after
 * the specified delay (defaults to DEBOUNCE_MS from config).
 */
export function useDebounce<T>(value: T, delay = DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
