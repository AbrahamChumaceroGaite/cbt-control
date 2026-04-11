'use client'
import { useRef, useState }  from 'react'
import { resizeImage }       from '@/lib/utils'
import { portalService }     from '../infrastructure/portal.service'
import type { StudentData }  from '../domain/types'

type UploadTarget = 'avatar' | 'banner' | null

interface UsePerfilTabReturn {
  uploading:    UploadTarget
  avatarRef:    React.RefObject<HTMLInputElement>
  bannerRef:    React.RefObject<HTMLInputElement>
  uploadAvatar: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  uploadBanner: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
}

export function usePerfilTab(onStudentUpdate: (partial: Partial<StudentData>) => void): UsePerfilTabReturn {
  const [uploading, setUploading] = useState<UploadTarget>(null)
  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setUploading('avatar')
    try {
      const avatarUrl = await resizeImage(f, 400, 400)
      await portalService.updateProfile({ avatarUrl })
      onStudentUpdate({ avatarUrl })
    } catch { /* silent — image upload failure is non-critical */ }
    finally { setUploading(null); e.target.value = '' }
  }

  const uploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setUploading('banner')
    try {
      const bannerUrl = await resizeImage(f, 1200, 500, 0.80)
      await portalService.updateProfile({ bannerUrl })
      onStudentUpdate({ bannerUrl })
    } catch { /* silent — banner upload failure is non-critical */ }
    finally { setUploading(null); e.target.value = '' }
  }

  return { uploading, avatarRef, bannerRef, uploadAvatar, uploadBanner }
}
