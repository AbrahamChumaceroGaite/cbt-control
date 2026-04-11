import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserDrawer } from '../application/useUserDrawer'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/usuarios.service', () => ({
  usuariosService: {
    update:                 vi.fn(),
    delete:                 vi.fn(),
    getUserInbox:           vi.fn(),
    getStudentTransactions: vi.fn(),
  },
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

import { usuariosService } from '../infrastructure/usuarios.service'
const mockService   = vi.mocked(usuariosService)
const mockShowToast = vi.fn()

const fakeUser = {
  id: 'u1', code: 'T001', fullName: 'María López', role: 'admin' as const,
  isActive: true, pushSubscriptionCount: 0, notificationCount: 0,
  createdAt: '', student: null,
  displayName: 'María López', initial: 'M', hasPush: false,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getUserInbox.mockResolvedValue({ items: [], unreadCount: 0 })
  mockService.getStudentTransactions.mockResolvedValue([])
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useUserDrawer', () => {
  describe('initial state', () => {
    it('starts on profile section with form seeded from user', () => {
      const { result } = renderHook(() => useUserDrawer(fakeUser, vi.fn(), vi.fn()))
      expect(result.current.section).toBe('profile')
      expect(result.current.form.fullName).toBe('María López')
    })

    it('resets to profile section when user changes', () => {
      const { result, rerender } = renderHook(
        ({ user }) => useUserDrawer(user, vi.fn(), vi.fn()),
        { initialProps: { user: fakeUser } },
      )
      act(() => { result.current.handlers.setSection('notifications') })
      rerender({ user: { ...fakeUser, id: 'u2', fullName: 'Pedro' } })
      expect(result.current.section).toBe('profile')
    })
  })

  describe('save()', () => {
    it('updates the user and calls onUpdated', async () => {
      mockService.update.mockResolvedValueOnce({ data: fakeUser, message: 'Actualizado' })
      const onUpdated = vi.fn()
      const { result } = renderHook(() => useUserDrawer(fakeUser, onUpdated, vi.fn()))

      act(() => { result.current.handlers.openEdit() })
      await act(() => result.current.handlers.save())

      expect(mockService.update).toHaveBeenCalledWith('u1', expect.any(Object))
      expect(mockShowToast).toHaveBeenCalledWith('Actualizado')
      expect(onUpdated).toHaveBeenCalledTimes(1)
    })

    it('shows error toast when save fails', async () => {
      mockService.update.mockRejectedValueOnce(new Error('Save failed'))
      const { result } = renderHook(() => useUserDrawer(fakeUser, vi.fn(), vi.fn()))

      await act(() => result.current.handlers.save())
      expect(mockShowToast).toHaveBeenCalledWith('Save failed', false)
    })
  })

  describe('toggleActive()', () => {
    it('calls update with toggled isActive and shows toast', async () => {
      mockService.update.mockResolvedValueOnce({ data: fakeUser, message: 'Desactivado' })
      const onUpdated = vi.fn()
      const { result } = renderHook(() => useUserDrawer(fakeUser, onUpdated, vi.fn()))

      await act(() => result.current.handlers.toggleActive())

      expect(mockService.update).toHaveBeenCalledWith('u1', { isActive: false })
      expect(onUpdated).toHaveBeenCalledTimes(1)
    })
  })

  describe('doDelete()', () => {
    it('deletes the user, calls onClose and onUpdated', async () => {
      mockService.delete.mockResolvedValueOnce({ data: null, message: 'Eliminado' })
      const onUpdated = vi.fn()
      const onClose   = vi.fn()
      const { result } = renderHook(() => useUserDrawer(fakeUser, onUpdated, onClose))

      act(() => { result.current.handlers.requestDelete() })
      await act(() => result.current.handlers.doDelete())

      expect(mockService.delete).toHaveBeenCalledWith('u1')
      expect(mockShowToast).toHaveBeenCalledWith('Eliminado')
      expect(onClose).toHaveBeenCalledTimes(1)
      expect(onUpdated).toHaveBeenCalledTimes(1)
    })
  })

  describe('section: notifications', () => {
    it('loads notifications when switching to notifications section', async () => {
      mockService.getUserInbox.mockResolvedValueOnce({
        items: [{ id: 'n1', title: 'Test', body: '', url: '', tag: '', isRead: false, createdAt: '' }],
        unreadCount: 1,
      })
      const { result } = renderHook(() => useUserDrawer(fakeUser, vi.fn(), vi.fn()))

      act(() => { result.current.handlers.setSection('notifications') })
      await waitFor(() => expect(result.current.loadingNotifs).toBe(false))

      expect(result.current.notifications).toHaveLength(1)
    })
  })
})
