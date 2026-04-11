'use client'
import { useEffect, useRef, useState } from 'react'
import { portalService }  from '../infrastructure/portal.service'
import { BANK_TAX, TOAST_MS, DEBOUNCE_MS } from '@/config/ui'
import type { CoinTransactionResponse, StudentSearchResult, SendState } from '../domain/types'

interface UseSendFormOptions {
  myCoins:   number
  remaining: number
  onSent:    (tx: CoinTransactionResponse) => void
}

interface UseSendFormReturn {
  courses:    { id: string; name: string }[]
  courseId:   string
  q:          string
  results:    StudentSearchResult[]
  searching:  boolean
  recipient:  StudentSearchResult | null
  amount:     number
  notes:      string
  state:      SendState
  errMsg:     string
  canSend:    boolean
  total:      number
  setCourseId: (id: string) => void
  setQ:        (q: string) => void
  setRecipient: (s: StudentSearchResult | null) => void
  setAmount:   (a: number) => void
  setNotes:    (n: string) => void
  clearSearch: () => void
  send:        () => Promise<void>
}

export function useSendForm({ myCoins, remaining, onSent }: UseSendFormOptions): UseSendFormReturn {
  const [courses,   setCourses]   = useState<{ id: string; name: string }[]>([])
  const [courseId,  setCourseId]  = useState('')
  const [q,         setQ]         = useState('')
  const [results,   setResults]   = useState<StudentSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [recipient, setRecipient] = useState<StudentSearchResult | null>(null)
  const [amount,    setAmount]    = useState(1)
  const [notes,     setNotes]     = useState('')
  const [state,     setState]     = useState<SendState>('idle')
  const [errMsg,    setErrMsg]    = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const total   = amount + BANK_TAX
  const canSend = !!recipient && amount >= 1 && myCoins >= total && remaining > 0

  useEffect(() => {
    portalService.getCourses().then(setCourses).catch(() => setCourses([]))
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!courseId || q.trim().length < 2) { setResults([]); return }
    setSearching(true)
    timerRef.current = setTimeout(async () => {
      try { const r = await portalService.searchStudents(q, courseId); setResults(r) }
      finally { setSearching(false) }
    }, DEBOUNCE_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [q, courseId])

  const clearSearch = () => { setQ(''); setResults([]) }

  const handleSetCourseId = (id: string) => { setCourseId(id); setQ(''); setResults([]) }

  const send = async () => {
    if (!recipient || !canSend) return
    setState('sending')
    try {
      const { data } = await portalService.createTransaction({ toStudentId: recipient.id, amount, notes: notes || undefined })
      setState('success')
      setTimeout(() => { setState('idle'); setRecipient(null); setAmount(1); setNotes('') }, 2500)
      if (data) onSent(data)
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : 'Error al enviar')
      setState('error')
      setTimeout(() => setState('idle'), TOAST_MS)
    }
  }

  return {
    courses, courseId, q, results, searching, recipient, amount, notes, state, errMsg,
    canSend, total,
    setCourseId: handleSetCourseId, setQ, setRecipient, setAmount, setNotes, clearSearch, send,
  }
}
