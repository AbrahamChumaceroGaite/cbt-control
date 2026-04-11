/**
 * scheme.ts — All style tokens (single source of truth).
 *
 * Covers Tailwind class strings (className=) AND hex/rgba values (style=).
 * Components import from here only. Never redeclare these locally.
 */

// ─── Z-index hierarchy ────────────────────────────────────────────────────────
export const Z = {
  STICKY:  30,   // sticky headers, floating nav
  POPOVER: 50,   // dropdowns, tooltips, popover panels
  DRAWER:  100,  // side drawers, overlapping panels
  MODAL:   200,  // full-screen modals (Modal component)
  TOAST:   600,  // toasts — always on top
} as const

// ─── Hex/RGBA color tokens (use in style= props) ─────────────────────────────
// For values that CANNOT be expressed as static Tailwind classes
// (dynamic gradients, canvas drawing, box-shadow with variable color).

/** Action category colors — bg/text hex for style= props */
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
  /** Fallback when no category matches */
  actionFallback: { bg: '#1e3a8a', text: '#bfdbfe' },
} as const

/**
 * Avatar palette — deterministic hash of name → background hex.
 * Used exclusively by lib/utils.ts hashColor().
 */
export const AVATAR_PALETTE = [
  '#0C447C', '#1E6B2E', '#501313', '#633806', '#3C3489', '#72243E',
  '#1a4f7a', '#2d6a3f', '#7a2d2d', '#7a5c1e', '#4a3d8f', '#8f2d50',
] as const

/** Portal banner default gradient (no image). Used by: ProfileHeader, PerfilTab. */
export const BANNER_GRADIENT = {
  base:    'linear-gradient(135deg, #1c1400 0%, #2d1f00 40%, #0a0a0a 100%)',
  overlay: 'radial-gradient(circle at 30% 50%, #fbbf24 0%, transparent 50%), radial-gradient(circle at 80% 30%, #d97706 0%, transparent 40%)',
} as const

/** TRAMOS — academic performance levels with display colors. Used by: PerfilTab, ProfileHeader. */
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

// ─── Severity / notification dot ─────────────────────────────────────────────
// Used by: NotificationItem, any severity-coloured indicator.
export const SEVERITY = {
  positive: { dot: 'bg-emerald-400', border: 'border-l-2 border-l-emerald-500/40', text: 'text-emerald-400' },
  negative: { dot: 'bg-red-400',     border: 'border-l-2 border-l-red-500/40',     text: 'text-red-400'     },
  info:     { dot: 'bg-blue-400',    border: 'border-l-2 border-l-blue-500/40',    text: 'text-blue-400'    },
  default:  { dot: 'bg-amber-400',   border: 'border-l-2 border-l-amber-500/40',   text: 'text-amber-400'   },
} as const

export type SeverityKey = keyof typeof SEVERITY

// ─── Transaction / request status — Tailwind badge classes ───────────────────
// Used by: status-badge.tsx (via CVA), DrawerTransactionsTab, StatusBadge.
export const STATUS_BADGE = {
  pending:      'bg-amber-500/15 text-amber-400 border-amber-500/25',
  approved:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  rejected:     'bg-red-500/15 text-red-400 border-red-500/25',
  approved_req: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
  rejected_req: 'bg-red-950/60 text-red-400 border-red-800/40',
  pending_req:  'bg-amber-950/60 text-amber-400 border-amber-800/40',
} as const

export type StatusBadgeKey = keyof typeof STATUS_BADGE

/** Labels for status badges */
export const STATUS_LABEL = {
  approved: 'Aprobada',
  rejected: 'Rechazada',
  pending:  'Pendiente',
} as const

// ─── Coin sign — positive / zero / negative ──────────────────────────────────
// Used by: RecentHistory dot + text, any component showing coin delta.
export const COIN_SIGN = {
  positive: { dot: 'bg-emerald-500', text: 'text-emerald-400' },
  zero:     { dot: 'bg-blue-500',    text: 'text-blue-400'    },
  negative: { dot: 'bg-rose-500',    text: 'text-rose-400'    },
} as const

export type CoinSignKey = keyof typeof COIN_SIGN

/** Returns the COIN_SIGN key for a coin delta value */
export function coinSignKey(coins: number): CoinSignKey {
  return coins > 0 ? 'positive' : coins === 0 ? 'zero' : 'negative'
}

// ─── Transaction direction (sent / received) ──────────────────────────────────
// Used by: TxHistory, BankTab, DrawerTransactionsTab.
export const TX_DIRECTION = {
  sent:     { icon: 'bg-red-500/10 border border-red-500/20',        text: 'text-red-400',     rotate: 'rotate-12'  },
  received: { icon: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400', rotate: '-rotate-12' },
} as const

export type TxDirectionKey = keyof typeof TX_DIRECTION

// ─── Effect level — good / warning / danger ──────────────────────────────────
// Used by: SliderField (effectPct badge).
export const EFFECT_LEVEL = {
  good:    { bg: 'bg-emerald-950', text: 'text-emerald-400' },
  warning: { bg: 'bg-amber-950',   text: 'text-amber-400'   },
  danger:  { bg: 'bg-red-950',     text: 'text-red-400'     },
} as const

export type EffectLevelKey = keyof typeof EFFECT_LEVEL

/** Returns the EFFECT_LEVEL key for a percentage value */
export function effectLevelKey(pct: number): EffectLevelKey {
  return pct >= 80 ? 'good' : pct >= 50 ? 'warning' : 'danger'
}

// ─── Toast feedback ───────────────────────────────────────────────────────────
// Used by: ToastContainer.
export const TOAST_SCHEME = {
  success: 'bg-emerald-950/90 border-emerald-800 text-emerald-400',
  error:   'bg-red-950/90 border-red-800 text-red-400',
} as const

// ─── Stat card themes (portal ProfileHeader) ─────────────────────────────────
// Used by: ProfileHeader StatCard, any component needing coloured stat tiles.
export const STAT_CARD = {
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   icon: 'text-amber-500/60'   },
  blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    icon: 'text-blue-500/60'    },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-500/60' },
  purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400',  icon: 'text-purple-500/60'  },
} as const

export type StatCardColor = keyof typeof STAT_CARD

// ─── Action categories — Tailwind classes ────────────────────────────────────
// Used by: PerfilTab coin log badge, any category-coloured indicator.
export const ACTION_CATEGORY = {
  green:  { dot: 'bg-green-400',   text: 'text-green-400',   bg: 'bg-green-400/10',   border: 'border-green-400/20'   },
  blue:   { dot: 'bg-blue-400',    text: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20'    },
  red:    { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20'     },
  amber:  { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20'   },
  purple: { dot: 'bg-purple-400',  text: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20'  },
  mag:    { dot: 'bg-fuchsia-400', text: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/20' },
} as const

export const ACTION_CATEGORY_FALLBACK = {
  dot: 'bg-zinc-500', text: 'text-zinc-400', bg: 'bg-zinc-700/30', border: 'border-zinc-700/40',
} as const

export type ActionCategoryKey = keyof typeof ACTION_CATEGORY

// ─── AwardModal — target-mode active button styles ────────────────────────────
// Tailwind JIT requires full static class strings (no template interpolation).
// Used by: AwardModal recipients step.
export const AWARD_MODE_STYLES = {
  class:    'bg-blue-500/10 border-blue-500/40 text-blue-300',
  students: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
} as const

// ─── Deal themes — portal carousel ───────────────────────────────────────────
// bg/glow are Tailwind classes; accent is hex for style= prop (dynamic shadow).
// Used by: DiscountCarousel.
export const DEAL_THEMES = [
  { bg: 'from-rose-950 via-zinc-950 to-zinc-950',    glow: 'bg-rose-500/20',    accent: '#f43f5e' },
  { bg: 'from-violet-950 via-zinc-950 to-zinc-950',  glow: 'bg-violet-500/20',  accent: '#8b5cf6' },
  { bg: 'from-amber-950 via-zinc-950 to-zinc-950',   glow: 'bg-amber-500/20',   accent: '#f59e0b' },
  { bg: 'from-sky-950 via-zinc-950 to-zinc-950',     glow: 'bg-sky-500/20',     accent: '#0ea5e9' },
  { bg: 'from-emerald-950 via-zinc-950 to-zinc-950', glow: 'bg-emerald-500/20', accent: '#10b981' },
] as const

// ─── Progress bar styles (rewards / milestones) ───────────────────────────────
// Used by: RewardsProgress. Hex needed because width is dynamic (style=).
export const PROGRESS_BAR = {
  next:    { gradient: 'linear-gradient(90deg,#059669,#10b981)', shadow: '0 0 8px rgba(16,185,129,0.25)' },
  default: { gradient: '#3f3f46',                               shadow: 'none'                           },
} as const
