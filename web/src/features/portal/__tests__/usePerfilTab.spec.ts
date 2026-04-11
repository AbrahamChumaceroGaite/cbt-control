import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePerfilTab } from '../application/usePerfilTab'

vi.mock('../infrastructure/portal.service', () => ({
  portalService: {
    updateProfile: vi.fn(),
  },
}))

vi.mock('@/lib/utils', () => ({
  resizeImage: vi.fn(),
}))

import { portalService } from '../infrastructure/portal.service'
import { resizeImage }   from '@/lib/utils'
const mockService     = vi.mocked(portalService)
const mockResizeImage = vi.mocked(resizeImage)

beforeEach(() => { vi.clearAllMocks() })

function makeEvent(file: File): React.ChangeEvent<HTMLInputElement> {
  return { target: { files: [file], value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>
}

describe('usePerfilTab', () => {
  describe('initial state', () => {
    it('uploading is null on mount', () => {
      const { result } = renderHook(() => usePerfilTab(vi.fn()))
      expect(result.current.uploading).toBeNull()
    })
  })

  describe('uploadAvatar()', () => {
    it('calls resizeImage and updateProfile, then calls onStudentUpdate', async () => {
      const onStudentUpdate = vi.fn()
      mockResizeImage.mockResolvedValueOnce('data:image/jpeg;base64,avatarData')
      mockService.updateProfile.mockResolvedValueOnce(undefined as never)

      const { result } = renderHook(() => usePerfilTab(onStudentUpdate))
      const file = new File(['img'], 'avatar.jpg', { type: 'image/jpeg' })

      await act(() => result.current.uploadAvatar(makeEvent(file)))

      expect(mockResizeImage).toHaveBeenCalledWith(file, 400, 400)
      expect(mockService.updateProfile).toHaveBeenCalledWith({ avatarUrl: 'data:image/jpeg;base64,avatarData' })
      expect(onStudentUpdate).toHaveBeenCalledWith({ avatarUrl: 'data:image/jpeg;base64,avatarData' })
      expect(result.current.uploading).toBeNull()
    })

    it('clears uploading state even when upload fails', async () => {
      mockResizeImage.mockRejectedValueOnce(new Error('resize failed'))
      const { result } = renderHook(() => usePerfilTab(vi.fn()))
      const file = new File(['img'], 'avatar.jpg', { type: 'image/jpeg' })

      await act(() => result.current.uploadAvatar(makeEvent(file)))
      expect(result.current.uploading).toBeNull()
    })

    it('does nothing when no file is selected', async () => {
      const onStudentUpdate = vi.fn()
      const { result } = renderHook(() => usePerfilTab(onStudentUpdate))
      const event = { target: { files: null } } as unknown as React.ChangeEvent<HTMLInputElement>

      await act(() => result.current.uploadAvatar(event))
      expect(mockResizeImage).not.toHaveBeenCalled()
    })
  })

  describe('uploadBanner()', () => {
    it('calls resizeImage with banner dimensions and updates profile', async () => {
      const onStudentUpdate = vi.fn()
      mockResizeImage.mockResolvedValueOnce('data:image/jpeg;base64,bannerData')
      mockService.updateProfile.mockResolvedValueOnce(undefined as never)

      const { result } = renderHook(() => usePerfilTab(onStudentUpdate))
      const file = new File(['img'], 'banner.jpg', { type: 'image/jpeg' })

      await act(() => result.current.uploadBanner(makeEvent(file)))

      expect(mockResizeImage).toHaveBeenCalledWith(file, 1200, 500, 0.80)
      expect(onStudentUpdate).toHaveBeenCalledWith({ bannerUrl: 'data:image/jpeg;base64,bannerData' })
    })
  })
})
