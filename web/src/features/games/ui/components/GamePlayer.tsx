'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal }    from 'react-dom'
import { X, Coins }        from 'lucide-react'
import { Spinner }         from '@/components/ui/spinner'
import { ConfirmDialog }   from '@/components/shared/ConfirmDialog'
import { useAuthStore }    from '@/store/auth.store'
import { LevelSelectScreen } from './LevelSelectScreen'
import { CoinsOverlay }    from './CoinsOverlay'
import type { GameViewModel, LevelViewModel, CoinsEarned } from '../../domain/types'

interface Session {
  startLevel:      number
  setStartLevel:   (n: number) => void
  coinsEarned:     CoinsEarned | null
  showContinue:    boolean
  continueLevel:   number
  saving:          boolean
  onLevelComplete: (level: number, score: number) => Promise<void>
  onGameOver:      (level: number) => void
  onContinue:      () => Promise<boolean>
  dismissCoins:    () => void
  dismissContinue: () => void
}

interface GameMessage {
  type:   'SESSION_START' | 'LEVEL_COMPLETE' | 'GAME_OVER'
  level?: number
  score?: number
}

interface Props {
  game:     GameViewModel
  levels:   LevelViewModel[]
  session:  Session
  onClose:  () => void
}

export function GamePlayer({ game, levels, session, onClose }: Props) {
  const user                               = useAuthStore(s => s.user)
  const iframeRef                          = useRef<HTMLIFrameElement>(null)
  const [loaded,     setLoaded]    = useState(false)
  const [started,    setStarted]   = useState(false)
  const [confirmQuit,setConfirmQuit]= useState(false)

  // Levels 0 = DOOM or no-level game — skip level select
  const hasLevels = levels.length > 0

  const handleLevelSelect = (level: number) => {
    session.setStartLevel(level)
    setStarted(true)
  }

  useEffect(() => {
    if (!hasLevels) setStarted(true)
  }, [hasLevels])

  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      const msg = ev.data as GameMessage
      if (msg?.type === 'LEVEL_COMPLETE' && msg.level !== undefined)
        void session.onLevelComplete(msg.level, msg.score ?? 0)
      else if (msg?.type === 'GAME_OVER' && msg.level !== undefined)
        session.onGameOver(msg.level)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [session])

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setConfirmQuit(true) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleContinue = async () => {
    const ok = await session.onContinue()
    if (ok) iframeRef.current?.contentWindow?.postMessage({ type: 'CONTINUE_GRANTED' }, '*')
  }

  const src = (() => {
    // EmulatorJS-based games load from MinIO via a generic emulator page
    if (game.emulatorCore) {
      const p = new URLSearchParams({ core: game.emulatorCore })
      if (game.gameFileUrl) p.set('gameUrl', game.gameFileUrl)
      if (game.biosFileUrl) p.set('biosUrl', game.biosFileUrl)
      return `/games/emulator/index.html?${p.toString()}`
    }
    return hasLevels
      ? `/games/${game.slug}/index.html?level=${session.startLevel}`
      : `/games/${game.slug}/index.html`
  })()

  const content = (
    // createPortal renders directly in document.body — bypasses all stacking contexts
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <span className="text-sm font-semibold text-white flex items-center gap-2">
          <span>{game.iconEmoji || '🎮'}</span>
          {game.title}
          {hasLevels && started && (
            <span className="text-xs font-normal text-zinc-500">
              · Lv {session.startLevel}
            </span>
          )}
        </span>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              {user.fullName}
            </span>
          )}
          <button onClick={() => setConfirmQuit(true)} className="text-zinc-400 hover:text-white transition-colors p-1 rounded" aria-label="Quit">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {!started && hasLevels ? (
          <LevelSelectScreen
            game={game}
            levels={levels}
            maxUnlocked={session.startLevel}
            onSelect={handleLevelSelect}
          />
        ) : (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="flex flex-col items-center gap-3">
                  <Spinner />
                  <span className="text-xs text-zinc-500">Loading {game.title}…</span>
                </div>
              </div>
            )}
            <iframe
              key={`${game.slug}-${session.startLevel}`}
              ref={iframeRef}
              src={src}
              className="w-full h-full border-none"
              title={game.title}
              allow="autoplay"
              onLoad={() => setLoaded(true)}
            />
            {session.coinsEarned && (
              <CoinsOverlay data={session.coinsEarned} onDismiss={session.dismissCoins} />
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmQuit}
        onConfirm={onClose}
        onCancel={() => setConfirmQuit(false)}
        title="Quit game?"
        message="Your current progress in this session will be lost."
        confirmText="Quit"
        cancelText="Keep playing"
        variant="red"
      />
      <ConfirmDialog
        open={session.showContinue}
        onConfirm={handleContinue}
        onCancel={() => { session.dismissContinue(); onClose() }}
        title="Game Over"
        message={game.continueCost > 0
          ? `Spend ${game.continueCost} coins to continue from level ${session.continueLevel}?`
          : `Continue from level ${session.continueLevel}?`
        }
        confirmText={session.saving ? 'Processing…' : game.continueCost > 0 ? `Continue (${game.continueCost} coins)` : 'Continue'}
        cancelText="Quit"
        variant="red"
      />
    </div>
  )

  if (typeof window === 'undefined') return null
  return createPortal(content, document.body)
}
