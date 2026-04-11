'use client'
import { useCallback } from 'react'
import { useUiStore }  from '@/store/ui.store'
import { TOAST_MS }    from '@/config/ui'

export function useToast() {
  const addToast    = useUiStore(s => s.addToast)
  const removeToast = useUiStore(s => s.removeToast)

  const showToast = useCallback((message: string, success = true) => {
    const id = addToast(message, success)
    // Auto-dismiss after TOAST_MS — prevents stale toasts accumulating
    setTimeout(() => removeToast(id), TOAST_MS)
  }, [addToast, removeToast])

  return { showToast }
}
