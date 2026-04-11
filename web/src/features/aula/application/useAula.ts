'use client'
// uses socket — subscribes to WS.COINS_UPDATED

import { useState, useCallback, useEffect, useMemo } from 'react'
import { aulaService }    from '../infrastructure/aula.service'
import { useToast }       from '@/hooks/useToast'
import { useSocketEvent } from '@/hooks/useSocketEvent'
import { WS }             from '@/ws/events'
import type { CourseResponse, StudentResponse, ActionResponse, RewardResponse, CoinLogResponse } from '@control-aula/shared'
import type { AwardStep, TargetMode, ClaimState } from '../domain/types'

export function useAula() {
  const { showToast } = useToast()

  // Shared data
  const [courses,       setCourses]       = useState<CourseResponse[]>([])
  const [courseId,      setCourseIdState] = useState('')
  const [courseDetail,  setCourseDetail]  = useState<{ classCoins?: number } | null>(null)
  const [students,      setStudents]      = useState<StudentResponse[]>([])
  const [actions,       setActions]       = useState<ActionResponse[]>([])
  const [rewards,       setRewards]       = useState<RewardResponse[]>([])
  const [logs,          setLogs]          = useState<CoinLogResponse[]>([])

  // Award modal
  const [awardOpen,    setAwardOpen]    = useState(false)
  const [step,         setStep]         = useState<AwardStep>('recipients')
  const [targetMode,   setTargetMode]   = useState<TargetMode>('class')
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set())
  const [studentQuery, setStudentQuery] = useState('')
  const [chosenAction, setChosenAction] = useState<ActionResponse | null>(null)
  const [awarding,     setAwarding]     = useState(false)

  // Claim modal
  const [claimState, setClaimState] = useState<ClaimState | null>(null)

  const loadCourse = useCallback(async (id: string) => {
    const [s, detail] = await Promise.all([
      aulaService.getStudentsByCourse(id).catch(() => [] as StudentResponse[]),
      aulaService.getCourseDetail(id).catch(() => ({ coinLogs: [] as CoinLogResponse[], classCoins: 0 })),
    ])
    setStudents(s)
    setCourseDetail(detail)
    setLogs(Array.isArray(detail?.coinLogs) ? detail.coinLogs : [])
  }, [])

  const loadAll = useCallback(async () => {
    const [c, a, r] = await Promise.all([
      aulaService.getCourses().catch(() => [] as CourseResponse[]),
      aulaService.getActions().catch(() => [] as ActionResponse[]),
      aulaService.getRewards().catch(() => [] as RewardResponse[]),
    ])
    setCourses(c); setActions(a); setRewards(r)
    if (c.length && !courseId) {
      setCourseIdState(c[0].id)
      loadCourse(c[0].id)
    }
  }, [courseId, loadCourse])

  useEffect(() => { loadAll() }, [loadAll])
  useEffect(() => { if (courseId) loadCourse(courseId) }, [courseId, loadCourse])

  useSocketEvent(WS.COINS_UPDATED, ({ courseId: cid }) => {
    if (cid === courseId) loadCourse(courseId)
  }, [courseId, loadCourse])

  // Derived data
  const course         = useMemo(() => courses.find(c => c.id === courseId), [courses, courseId])
  const currentCoins   = courseDetail?.classCoins ?? 0
  const classRewards   = useMemo(() => rewards.filter(r => r.type === 'class' && r.isActive).sort((a, b) => a.coinsRequired - b.coinsRequired), [rewards])
  const indivRewards   = useMemo(() => rewards.filter(r => r.type === 'individual' && r.isActive).sort((a, b) => a.coinsRequired - b.coinsRequired), [rewards])
  const nextReward     = classRewards.find(r => r.coinsRequired > currentCoins)
  const activeActions  = useMemo(() => actions.filter(a => a.isActive), [actions])
  const applicable     = useMemo(() => activeActions.filter(a => targetMode === 'class' ? a.affectsClass : a.affectsStudent), [activeActions, targetMode])
  const filteredStu    = useMemo(() => students.filter(s => !studentQuery || s.name.toLowerCase().includes(studentQuery.toLowerCase()) || s.code.toLowerCase().includes(studentQuery.toLowerCase())), [students, studentQuery])
  const selectedStu    = useMemo(() => students.filter(s => selectedIds.has(s.id)), [students, selectedIds])

  function openAward() {
    setStep('recipients'); setTargetMode('class'); setSelectedIds(new Set()); setStudentQuery(''); setChosenAction(null)
    setAwardOpen(true)
  }

  function closeAward() {
    setAwardOpen(false)
    setTimeout(() => { setStep('recipients'); setTargetMode('class'); setSelectedIds(new Set()); setStudentQuery(''); setChosenAction(null) }, 300)
  }

  function toggleStudent(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  async function executeAward() {
    if (!chosenAction || !course) return
    setAwarding(true)
    try {
      const base = { courseId: course.id, actionId: chosenAction.id, coins: chosenAction.coins, reason: chosenAction.name }
      if (targetMode === 'class') {
        await aulaService.award(base)
      } else {
        await Promise.all(Array.from(selectedIds).map(sid => aulaService.award({ ...base, studentId: sid })))
      }
      showToast(`Coins awarded: ${chosenAction.name}`, chosenAction.coins >= 0)
      closeAward(); loadCourse(courseId)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error awarding coins', false)
    } finally { setAwarding(false) }
  }

  async function claimReward() {
    if (!claimState || !course) return
    try {
      const { reward, student: s } = claimState
      const { message } = await aulaService.award({ courseId: course.id, ...(s ? { studentId: s.id } : {}), coins: 0, reason: `Redeemed: ${reward.name}` })
      showToast(message); setClaimState(null); loadCourse(courseId)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error redeeming reward', false)
    }
  }

  const setCourseId = useCallback((id: string) => { setCourseIdState(id) }, [])

  return {
    courses, course, courseId, setCourseId,
    students, logs, classRewards, indivRewards, currentCoins, nextReward,
    awardOpen, step, setStep, targetMode, setTargetMode,
    selectedIds, toggleStudent, studentQuery, setStudentQuery,
    chosenAction, setChosenAction, awarding,
    applicable, filteredStu, selectedStu,
    canProceed: targetMode === 'class' || selectedIds.size > 0,
    openAward, closeAward, executeAward,
    claimState, setClaimState, claimReward,
  }
}
