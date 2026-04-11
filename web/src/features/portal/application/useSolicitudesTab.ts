'use client'
import { useState }       from 'react'
import { portalService }  from '../infrastructure/portal.service'
import { useToast }       from '@/hooks/useToast'

export function useSolicitudesTab(onReload: () => void) {
  const { showToast }              = useToast()
  const [cancelling, setCancelling] = useState<string | null>(null)

  const doCancel = async (confirmId: string) => {
    setCancelling(confirmId)
    try {
      await portalService.cancelRedemption(confirmId)
      showToast('Solicitud cancelada')
      onReload()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error al cancelar', false)
    } finally { setCancelling(null) }
  }

  return { cancelling, doCancel }
}
