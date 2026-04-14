import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AVATAR_PALETTE } from '@/config/scheme'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Date/Time ─────────────────────────────────────────────────────────────────

/**
 * Converts a date to a human-readable relative string (e.g. "2 days ago").
 * Falls back to the formatted date for dates older than 30 days.
 */
export function timeAgo(date: string | Date): string {
  const d     = typeof date === 'string' ? new Date(date) : date
  const now   = Date.now()
  const diff  = now - d.getTime()
  const secs  = Math.floor(diff / 1_000)
  const mins  = Math.floor(secs  / 60)
  const hours = Math.floor(mins  / 60)
  const days  = Math.floor(hours / 24)

  if (secs  < 60)  return 'just now'
  if (mins  < 60)  return `${mins} minute${mins === 1 ? '' : 's'} ago`
  if (hours < 24)  return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (days  < 30)  return `${days} day${days === 1 ? '' : 's'} ago`
  return formatDate(d)
}

/**
 * Formats a date as a localised readable string (e.g. "Apr 7, 2026").
 * Always rendered in America/La_Paz timezone.
 */
export function formatDate(date: string | Date, locale = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/La_Paz' })
}

/**
 * Formats a date+time as a localised readable string (e.g. "Apr 7, 2026, 03:30 PM").
 * Always rendered in America/La_Paz timezone.
 */
export function formatDateTime(date: string | Date, locale = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString(locale, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/La_Paz' })
}

// ── Numbers ───────────────────────────────────────────────────────────────────

/**
 * Formats a coin count with thousands separators.
 * Values ≥ 1 000 are abbreviated to "1.2K".
 */
export function formatCoins(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return n.toLocaleString()
}

/**
 * Clamps a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ── String / Avatar ───────────────────────────────────────────────────────────

/**
 * Returns up to 2 uppercase initials from a full name.
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Deterministically maps a name string to one of the brand palette colors.
 */
export function hashColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

// ── Image ─────────────────────────────────────────────────────────────────────

/**
 * Resizes an image File to fit within maxW × maxH, preserving aspect ratio.
 * Returns a base-64 data URL (JPEG).
 */
export function resizeImage(file: File, maxW: number, maxH: number, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const ratio  = Math.min(maxW / img.width, maxH / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Canvas not supported')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')) }
    img.src = url
  })
}
