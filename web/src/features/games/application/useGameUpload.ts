'use client'
import { useCallback, useState } from 'react'
import { gamesService }          from '../infrastructure/games.service'
import { useToast }              from '@/hooks/useToast'
import type { GameViewModel }    from '../domain/types'

type FileSlot = 'game' | 'bios' | 'cover'

interface UploadState {
  uploading: boolean
  progress:  number   // 0–100 (XHR) or -1 when using fetch (indeterminate)
}

const IDLE: UploadState = { uploading: false, progress: 0 }

/**
 * Handles direct-to-MinIO file uploads for game assets.
 * Flow: getUploadUrl → PUT to MinIO → PATCH game with publicUrl
 */
export function useGameUpload(
  onGameUpdated: (updated: GameViewModel) => void,
) {
  const { showToast }                            = useToast()
  const [gameSlot,  setGameSlot]  = useState<UploadState>(IDLE)
  const [biosSlot,  setBiosSlot]  = useState<UploadState>(IDLE)
  const [coverSlot, setCoverSlot] = useState<UploadState>(IDLE)

  const slotState: Record<FileSlot, UploadState> = {
    game:  gameSlot,
    bios:  biosSlot,
    cover: coverSlot,
  }

  const setSlot = useCallback((slot: FileSlot, state: UploadState) => {
    if (slot === 'game')  setGameSlot(state)
    if (slot === 'bios')  setBiosSlot(state)
    if (slot === 'cover') setCoverSlot(state)
  }, [])

  const upload = useCallback(async (
    game: GameViewModel,
    slot: FileSlot,
    file: File,
  ): Promise<void> => {
    setSlot(slot, { uploading: true, progress: -1 })
    try {
      // Step 1 — get presigned PUT URL from api-games
      const { uploadUrl, publicUrl } = await gamesService.getUploadUrl(
        game.id, file.name, slot,
      )

      // Step 2 — upload file directly to MinIO (no API server in the path)
      await gamesService.uploadToStorage(uploadUrl, file)

      // Step 3 — save the public URL on the Game record
      const fieldMap: Record<FileSlot, 'gameFileUrl' | 'biosFileUrl' | 'coverUrl'> = {
        game:  'gameFileUrl',
        bios:  'biosFileUrl',
        cover: 'coverUrl',
      }
      const updated = await gamesService.update(game.id, { [fieldMap[slot]]: publicUrl })
      onGameUpdated({ ...game, ...updated, coinsAtMaxLevel: game.coinsAtMaxLevel })
      showToast(`${slot === 'game' ? 'Game ROM' : slot === 'bios' ? 'BIOS' : 'Cover'} uploaded`)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Upload failed', false)
    } finally {
      setSlot(slot, IDLE)
    }
  }, [onGameUpdated, setSlot, showToast])

  return { slotState, upload }
}
