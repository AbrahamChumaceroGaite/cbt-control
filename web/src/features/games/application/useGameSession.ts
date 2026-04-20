'use client'
import { useCallback, useState }  from 'react'
import { gamesService }            from '../infrastructure/games.service'
import { useToast }                from '@/hooks/useToast'
import type { CoinsEarned, GameViewModel } from '../domain/types'

const PROGRESS_KEY = (slug: string, userId: string) => `progress:${slug}:${userId}`

export function useGameSession(game: GameViewModel | null, userId: string) {
  const { showToast } = useToast()

  const [startLevel,    setStartLevel]    = useState<number>(1)
  const [coinsEarned,   setCoinsEarned]   = useState<CoinsEarned | null>(null)
  const [showContinue,  setShowContinue]  = useState(false)
  const [continueLevel, setContinueLevel] = useState(1)
  const [saving,        setSaving]        = useState(false)

  // Load saved progress from localStorage
  const loadProgress = useCallback((slug: string) => {
    if (!userId) return 1
    const raw = localStorage.getItem(PROGRESS_KEY(slug, userId))
    return raw ? Math.max(1, parseInt(raw, 10)) : 1
  }, [userId])

  const saveProgress = useCallback((slug: string, level: number) => {
    if (!userId) return
    const current = loadProgress(slug)
    if (level > current) localStorage.setItem(PROGRESS_KEY(slug, userId), String(level))
  }, [userId, loadProgress])

  const resumeLevel = useCallback((slug: string) => {
    const level = loadProgress(slug)
    setStartLevel(level)
    return level
  }, [loadProgress])

  const onLevelComplete = useCallback(async (level: number, score: number) => {
    if (!game) return
    saveProgress(game.slug, level + 1)
    const key = `${game.slug}-level-${level}-${Date.now()}`
    try {
      const result = await gamesService.completeLevel(game.slug, level, score, key)
      setCoinsEarned({ amount: result.coinsEarned, newBalance: result.newBalance, level })
    } catch {
      // Non-critical: game continues even if coin grant fails
    }
  }, [game, saveProgress])

  const onGameOver = useCallback((level: number) => {
    setContinueLevel(level)
    setShowContinue(true)
  }, [])

  const onContinue = useCallback(async (): Promise<boolean> => {
    if (!game) return false
    setSaving(true)
    const key = `${game.slug}-continue-${Date.now()}`
    try {
      await gamesService.useContinue(game.slug, key)
      setShowContinue(false)
      return true
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Not enough coins', false)
      return false
    } finally {
      setSaving(false)
    }
  }, [game, showToast])

  const dismissCoins    = useCallback(() => setCoinsEarned(null), [])
  const dismissContinue = useCallback(() => setShowContinue(false), [])

  return {
    startLevel, setStartLevel,
    coinsEarned, showContinue, continueLevel, saving,
    resumeLevel, onLevelComplete, onGameOver, onContinue,
    dismissCoins, dismissContinue,
  }
}
