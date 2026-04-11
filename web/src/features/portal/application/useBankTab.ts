'use client'
// uses socket — subscribes to WS.TRANSACTION_UPDATED and WS.COINS_UPDATED
import { useCallback, useEffect, useState } from 'react'
import { portalService }   from '../infrastructure/portal.service'
import { useSocketEvent }  from '@/hooks/useSocketEvent'
import { WS }              from '@/ws/events'
import { BANK_TX_LIMIT }  from '@/config/ui'
import type { CoinTransactionResponse, WeeklyBankStatus } from '../domain/types'

interface UseBankTabOptions {
  studentId:     string
  studentCoins:  number
  onCoinsUpdate: (coins: number) => void
}

interface UseBankTabReturn {
  status:    WeeklyBankStatus
  txs:       CoinTransactionResponse[]
  loading:   boolean
  handleSent: (tx: CoinTransactionResponse) => void
}

export function useBankTab({ studentId, studentCoins, onCoinsUpdate }: UseBankTabOptions): UseBankTabReturn {
  const [status,  setStatus]  = useState<WeeklyBankStatus>({ used: 0, limit: BANK_TX_LIMIT, remaining: BANK_TX_LIMIT })
  const [txs,     setTxs]     = useState<CoinTransactionResponse[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, t] = await Promise.all([portalService.getBankStatus(), portalService.getMyTransactions()])
      setStatus(s)
      setTxs(t)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useSocketEvent(WS.TRANSACTION_UPDATED, () => { load() })
  useSocketEvent(WS.COINS_UPDATED, ({ studentId: sid, studentCoins: sc }: { studentId?: string; studentCoins?: number }) => {
    if (sid === studentId && sc !== undefined) onCoinsUpdate(sc)
  })

  const handleSent = (tx: CoinTransactionResponse) => {
    setTxs(prev => [tx, ...prev])
    setStatus(s => ({ ...s, used: s.used + 1, remaining: Math.max(0, s.remaining - 1) }))
    onCoinsUpdate(studentCoins - tx.amount - tx.tax)
  }

  return { status, txs, loading, handleSent }
}
