import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBackup } from '../application/useBackup'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/backup.service', () => ({
  backupService: {
    download: vi.fn(),
    restore:  vi.fn(),
  },
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

import { backupService } from '../infrastructure/backup.service'
const mockService   = vi.mocked(backupService)
const mockShowToast = vi.fn()

// Stub URL methods and anchor click so jsdom doesn't throw "Not implemented: navigation"
globalThis.URL.createObjectURL = vi.fn(() => 'blob:fake-url')
globalThis.URL.revokeObjectURL = vi.fn()
HTMLAnchorElement.prototype.click = vi.fn()

// resetAllMocks clears both call history AND pending mockResolvedValueOnce queues
beforeEach(() => { vi.resetAllMocks() })

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useBackup', () => {
  describe('initial state', () => {
    it('starts with courses, actions, rewards sections selected', () => {
      const { result } = renderHook(() => useBackup())
      expect(result.current.exportSections.has('courses')).toBe(true)
      expect(result.current.exportSections.has('actions')).toBe(true)
      expect(result.current.exportSections.has('rewards')).toBe(true)
    })
  })

  describe('toggleSection()', () => {
    it('removes a selected section when toggled off', () => {
      const { result } = renderHook(() => useBackup())
      act(() => { result.current.toggleSection('courses') })
      expect(result.current.exportSections.has('courses')).toBe(false)
    })

    it('adds a deselected section when toggled on', () => {
      const { result } = renderHook(() => useBackup())
      act(() => { result.current.toggleSection('students') })
      expect(result.current.exportSections.has('students')).toBe(true)
    })
  })

  describe('downloadBackup()', () => {
    it('shows validation error when no sections are selected', async () => {
      const { result } = renderHook(() => useBackup())
      // Remove all sections
      act(() => {
        result.current.toggleSection('courses')
        result.current.toggleSection('actions')
        result.current.toggleSection('rewards')
      })
      await act(() => result.current.downloadBackup())
      expect(mockService.download).not.toHaveBeenCalled()
      expect(mockShowToast).toHaveBeenCalledWith('Select at least one section', false)
    })

    it('calls download service with selected sections and shows success toast', async () => {
      const fakeBlob = new Blob(['{}'], { type: 'application/json' })
      mockService.download.mockResolvedValueOnce({ ok: true, blob: async () => fakeBlob } as never)

      const { result } = renderHook(() => useBackup())
      await act(() => result.current.downloadBackup())

      expect(mockService.download).toHaveBeenCalledWith(expect.arrayContaining(['courses', 'actions', 'rewards']))
      expect(mockShowToast).toHaveBeenCalledWith('Backup downloaded successfully')
    })

    it('shows error toast when download response is not ok', async () => {
      mockService.download.mockResolvedValueOnce({ ok: false } as never)
      const { result } = renderHook(() => useBackup())
      await act(() => result.current.downloadBackup())
      expect(mockShowToast).toHaveBeenCalledWith('Error generating backup', false)
    })
  })

  describe('handleImport()', () => {
    function makeEvent(content: string): React.ChangeEvent<HTMLInputElement> {
      const file = new File([content], 'backup.json', { type: 'application/json' })
      return { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>
    }

    it('shows error when file is not a valid CBT backup', async () => {
      const { result } = renderHook(() => useBackup())
      const event = makeEvent(JSON.stringify({ irrelevant: true }))
      await act(() => result.current.handleImport(event))
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('Invalid file'), false,
      )
    })

    it('calls restore service and shows success toast for valid backup', async () => {
      const fakeResult = { detected: ['courses', 'actions'], details: {} }
      mockService.restore.mockResolvedValueOnce(fakeResult)
      const { result } = renderHook(() => useBackup())
      const valid = JSON.stringify({ version: '1.0', exportedAt: '2024-01-01', courses: [] })
      await act(() => result.current.handleImport(makeEvent(valid)))

      expect(mockService.restore).toHaveBeenCalledTimes(1)
      expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('Import complete'))
      expect(result.current.importResult).toEqual(fakeResult)
    })
  })
})
