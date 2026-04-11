'use client'
import { useCallback, useEffect, useState } from 'react'
import { solicitudesService }               from '../infrastructure/solicitudes.service'
import { useToast }                         from '@/hooks/useToast'
import { REQUEST_STATUS }                   from '@/config/status'
import type { SolicitudViewModel, StatusFilter } from '../domain/types'

interface Options {
  /** Called after each load with the number of pending solicitudes */
  onCountChange?: (n: number) => void
}

export function useSolicitudes({ onCountChange }: Options = {}) {
  const { showToast } = useToast()

  const [items,       setItems]       = useState<SolicitudViewModel[]>([])
  const [filter,      setFilter]      = useState<StatusFilter>('pending')
  const [processing,  setProcessing]  = useState<string | null>(null)
  const [confirmItem, setConfirmItem] = useState<SolicitudViewModel | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await solicitudesService.getAll()
      setItems(data)
      onCountChange?.(data.filter(s => s.status === REQUEST_STATUS.PENDING).length)
    } catch {
      // Silent — badge count failure should not block the UI
    }
  }, [onCountChange])

  useEffect(() => { load() }, [load])

  const handle = useCallback(async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id)
    try {
      const { message } = await solicitudesService.process(id, status)
      showToast(message, status === REQUEST_STATUS.APPROVED)
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error processing request', false)
    } finally {
      setProcessing(null)
    }
  }, [showToast, load])

  const confirmApprove = useCallback(async () => {
    if (!confirmItem) return
    await handle(confirmItem.id, 'approved')
    setConfirmItem(null)
  }, [confirmItem, handle])

  const visible = filter === REQUEST_STATUS.PENDING
    ? items.filter(i => i.status === REQUEST_STATUS.PENDING)
    : items

  return {
    visible, filter, processing, confirmItem,
    handlers: {
      setFilter,
      reject:         (id: string) => handle(id, 'rejected'),
      requestApprove: setConfirmItem,
      confirmApprove,
      cancelApprove:  () => setConfirmItem(null),
    },
  }
}
