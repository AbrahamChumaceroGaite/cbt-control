/**
 * colors.ts — Hex/RGBA color tokens for style= props.
 *
 * Use for values that CANNOT be expressed as static Tailwind classes
 * (e.g. dynamic gradients, canvas drawing, box-shadow with variable color).
 * For Tailwind className strings use config/scheme.ts instead.
 */

// ─── Action category colors (bg/text hex for style= props) ──────────────────
// Used by: ActionMapper (colorConfig), AwardModal (actionColor), Avatar (hashColor)
export const COLORS = {
  action: {
    green:  { bg: '#1E6B2E', text: '#C0DD97' },
    blue:   { bg: '#0C447C', text: '#B5D4F4' },
    red:    { bg: '#501313', text: '#F7C1C1' },
    amber:  { bg: '#633806', text: '#FAC775' },
    purple: { bg: '#3C3489', text: '#CECBF6' },
    mag:    { bg: '#72243E', text: '#F4C0D1' },
  },
  status: {
    success: { bg: 'rgba(34,197,94,0.1)',  text: '#4ade80', border: 'rgba(34,197,94,0.2)'  },
    warning: { bg: 'rgba(234,179,8,0.1)',  text: '#facc15', border: 'rgba(234,179,8,0.2)'  },
    danger:  { bg: 'rgba(239,68,68,0.1)',  text: '#f87171', border: 'rgba(239,68,68,0.2)'  },
    info:    { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
  },
  /** Fallback when no category matches — blue-900 palette */
  actionFallback: { bg: '#1e3a8a', text: '#bfdbfe' },
} as const

/**
 * Avatar palette — deterministic hash of name → background hex.
 * Source palette mirrors COLORS.action keys + lighter variants of each.
 * Used exclusively by lib/utils.ts hashColor().
 */
export const AVATAR_PALETTE = [
  '#0C447C', '#1E6B2E', '#501313', '#633806', '#3C3489', '#72243E',
  '#1a4f7a', '#2d6a3f', '#7a2d2d', '#7a5c1e', '#4a3d8f', '#8f2d50',
] as const

/**
 * Portal banner default gradient (no image).
 * Used by: ProfileHeader, PerfilTab.
 */
export const BANNER_GRADIENT = {
  base:    'linear-gradient(135deg, #1c1400 0%, #2d1f00 40%, #0a0a0a 100%)',
  overlay: 'radial-gradient(circle at 30% 50%, #fbbf24 0%, transparent 50%), radial-gradient(circle at 80% 30%, #d97706 0%, transparent 40%)',
} as const

/**
 * TRAMOS — academic performance levels with display colors.
 * Used by: PerfilTab, ProfileHeader.
 */
export const TRAMOS = [
  { id: 'T1', label: 'Atención',        color: '#0C447C', fg: '#85B7EB' },
  { id: 'T2', label: 'Indagación',      color: '#3C3489', fg: '#AFA9EC' },
  { id: 'T3', label: 'Metacognición',   color: '#0F6E56', fg: '#5DCAA5' },
  { id: 'T4', label: 'Pens. Analítico', color: '#633806', fg: '#EF9F27' },
  { id: 'T5', label: 'Apz. Autónomo',   color: '#72243E', fg: '#ED93B1' },
  { id: 'T6', label: 'Colaborativo',    color: '#3B6D11', fg: '#97C459' },
  { id: 'T7', label: 'Innovación',      color: '#501313', fg: '#F09595' },
] as const

export type TramoId = typeof TRAMOS[number]['id']
