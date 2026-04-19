'use client'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { GameViewModel } from '../../domain/types'

interface GameMessage {
  type: 'SESSION_START' | 'LEVEL_COMPLETE' | 'GAME_OVER'
  level?: number
  score?: number
}

interface Props {
  game:     GameViewModel
  onClose:  () => void
  onLevel?: (level: number, score: number) => void
}

export function GamePlayer({ game, onClose, onLevel }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

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
      if (ev.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <span className="text-sm font-semibold text-white flex items-center gap-2">
          <span>{game.iconEmoji || '🎮'}</span>
          {game.title}
        </span>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors p-1 rounded"
          aria-label="Close game"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <iframe
        ref={iframeRef}
        src="/games/tank-invaders/"
        className="flex-1 w-full border-none"
        title={game.title}
        allow="autoplay"
      />
    </div>
  )
}
