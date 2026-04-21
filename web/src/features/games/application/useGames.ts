'use client'
import { useCallback, useEffect, useState } from 'react'
import { gamesService }   from '../infrastructure/games.service'
import { GamesMapper }    from './games.mapper'
import { useGameSession } from './useGameSession'
import { useGameUpload }  from './useGameUpload'
import { useToast }       from '@/hooks/useToast'
import { useAuthStore }   from '@/store/auth.store'
import type { EditGameForm, GameViewModel, LevelViewModel } from '../domain/types'

const DEFAULT_FORM: EditGameForm = {
  title: '', description: '', iconEmoji: '🎮', coverUrl: '',
  isActive: true, coinsPerLevelBase: 5, coinsPerLevelStep: 2,
  bonusCoins: 4, continueCost: 2, maxLevels: 30,
  emulatorCore: '', gameFileUrl: '', biosFileUrl: '',
}

export function useGames() {
  const { showToast }                            = useToast()
  const user                                     = useAuthStore(s => s.user)
  const userId                                   = user?.userId ?? ''

  const [games,         setGames]         = useState<GameViewModel[]>([])
  const [loading,       setLoading]       = useState(true)
  const [selectedGame,  setSelectedGame]  = useState<GameViewModel | null>(null)
  const [levels,        setLevels]        = useState<LevelViewModel[]>([])
  const [levelsLoading, setLevelsLoading] = useState(false)
  const [playing,       setPlaying]       = useState(false)
  const [editing,       setEditing]       = useState<GameViewModel | null>(null)
  const [editForm,      setEditForm]      = useState<EditGameForm>(DEFAULT_FORM)
  const [saving,        setSaving]        = useState(false)

  const session = useGameSession(selectedGame, userId)

  const handleGameUpdated = useCallback((updated: GameViewModel) => {
    setGames(gs => gs.map(g => g.id === updated.id ? updated : g))
    if (selectedGame?.id === updated.id) setSelectedGame(updated)
    if (editing?.id === updated.id)      setEditing(updated)
  }, [selectedGame, editing])

  const upload  = useGameUpload(handleGameUpdated)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await gamesService.getAll()
      setGames(data.map(GamesMapper.toViewModel))
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error loading games', false)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const selectGame = useCallback(async (game: GameViewModel) => {
    setSelectedGame(game)
    setLevelsLoading(true)
    try {
      const data = await gamesService.getLevels(game.id)
      setLevels(data.map(GamesMapper.toLevelViewModel))
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error loading levels', false)
    } finally {
      setLevelsLoading(false)
    }
  }, [showToast])

  const clearSelection = useCallback(() => {
    setSelectedGame(null)
    setLevels([])
    setPlaying(false)
  }, [])

  const startPlaying = useCallback(() => {
    if (selectedGame) session.resumeLevel(selectedGame.slug)
    setPlaying(true)
  }, [selectedGame, session])

  const stopPlaying  = useCallback(() => setPlaying(false), [])

  const openEdit = useCallback((game: GameViewModel) => {
    setEditing(game)
    setEditForm(GamesMapper.toEditForm(game))
  }, [])

  const closeEdit = useCallback(() => setEditing(null), [])

  const saveEdit = useCallback(async () => {
    if (!editing) return
    setSaving(true)
    try {
      const updated = await gamesService.update(editing.id, {
        title: editForm.title, description: editForm.description,
        iconEmoji: editForm.iconEmoji, coverUrl: editForm.coverUrl,
        isActive: editForm.isActive, coinsPerLevelBase: editForm.coinsPerLevelBase,
        coinsPerLevelStep: editForm.coinsPerLevelStep, bonusCoins: editForm.bonusCoins,
        continueCost: editForm.continueCost, maxLevels: editForm.maxLevels,
        emulatorCore: editForm.emulatorCore || null,
      })
      const vm = GamesMapper.toViewModel(updated)
      setGames(gs => gs.map(g => g.id === vm.id ? vm : g))
      if (selectedGame?.id === vm.id) setSelectedGame(vm)
      showToast('Game updated')
      closeEdit()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating game', false)
    } finally {
      setSaving(false)
    }
  }, [editing, editForm, selectedGame, showToast, closeEdit])

  useEffect(() => { load() }, [load])

  return {
    games, loading, selectedGame, levels, levelsLoading,
    playing, editing, editForm, saving, session, upload,
    handlers: {
      selectGame, clearSelection,
      startPlaying, stopPlaying,
      openEdit, closeEdit, saveEdit,
      setEditForm,
    },
  }
}
