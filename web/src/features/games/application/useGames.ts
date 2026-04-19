'use client'
import { useCallback, useEffect, useState } from 'react'
import { gamesService }  from '../infrastructure/games.service'
import { GamesMapper }   from './games.mapper'
import { useToast }      from '@/hooks/useToast'
import type { GameViewModel, LevelViewModel } from '../domain/types'

export function useGames() {
  const { showToast }                            = useToast()
  const [games,         setGames]         = useState<GameViewModel[]>([])
  const [loading,       setLoading]       = useState(true)
  const [selectedGame,  setSelectedGame]  = useState<GameViewModel | null>(null)
  const [levels,        setLevels]        = useState<LevelViewModel[]>([])
  const [levelsLoading, setLevelsLoading] = useState(false)

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
  }, [])

  useEffect(() => { load() }, [load])

  return {
    games,
    loading,
    selectedGame,
    levels,
    levelsLoading,
    handlers: { selectGame, clearSelection },
  }
}
