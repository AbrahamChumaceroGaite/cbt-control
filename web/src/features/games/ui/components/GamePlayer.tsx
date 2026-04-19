'use client'
import { useEffect, useRef, useState } from 'react'
import { X }                from 'lucide-react'
import { Spinner }          from '@/components/ui/spinner'
import { ConfirmDialog }    from '@/components/shared/ConfirmDialog'
import type { GameViewModel } from '../../domain/types'

interface GameMessage {
  type:   'SESSION_START' | 'LEVEL_COMPLETE' | 'GAME_OVER'
  level?: number
  score?: number
}

interface Props {
  game:     GameViewModel
  onClose:  () => void
  onLevel?: (level: number, score: number) => void
}

export function GamePlayer({ game, onClose, onLevel }: Props) {
  const iframeRef                           = useRef<HTMLIFrameElement>(null)
  const [loaded,    setLoaded]    = useState(false)
  const [confirm,   setConfirm]   = useState(false)

  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return
      const msg = ev.data as GameMessage
      if (msg.type === 'LEVEL_COMPLETE' && onLevel && msg.level !== undefined && msg.score !== undefined) {
        onLevel(msg.level, msg.score)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onLevel])

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setConfirm(true)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    // z-[150] sits above FloatingNav (z-50) and admin header (z-30).
    // ConfirmDialog/Modal uses Z.MODAL (200) so it renders above the game.
    <div className="fixed inset-0 z-[150] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <span className="text-sm font-semibold text-white flex items-center gap-2">
          <span>{game.iconEmoji || '🎮'}</span>
          {game.title}
        </span>
        <button
          onClick={() => setConfirm(true)}
          className="text-zinc-400 hover:text-white transition-colors p-1 rounded"
          aria-label="Quit game"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Loading overlay */}
      {!loaded && (
        <div className="absolute inset-0 top-[45px] flex items-center justify-center bg-black z-10">
          <div className="flex flex-col items-center gap-3">
            <Spinner />
            <span className="text-xs text-zinc-500">Loading {game.title}…</span>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src="/games/tank-invaders/"
        className="flex-1 w-full border-none"
        title={game.title}
        allow="autoplay"
        onLoad={() => setLoaded(true)}
      />

      <ConfirmDialog
        open={confirm}
        onConfirm={onClose}
        onCancel={() => setConfirm(false)}
        title="Quit game?"
        message="Your current progress in this session will be lost."
        confirmText="Quit"
        cancelText="Keep playing"
        variant="red"
      />
    </div>
  )
}
