/**
 * scheme.ts — Tailwind class string mappings (single source of truth).
 *
 * Complement to colors.ts (which holds hex/rgba for style= props).
 * Every object here contains only Tailwind class strings for className= use.
 * Components must import from here — never redeclare these locally.
 */

// ─── Severity / notification dot ────────────────────────────────────────────
// Used by: NotificationItem, StatusBadge, any severity-colored indicator

export const SEVERITY = {
  positive: {
    dot:    'bg-emerald-400',
    border: 'border-l-2 border-l-emerald-500/40',
    text:   'text-emerald-400',
  },
  negative: {
    dot:    'bg-red-400',
    border: 'border-l-2 border-l-red-500/40',
    text:   'text-red-400',
  },
  info: {
    dot:    'bg-blue-400',
    border: 'border-l-2 border-l-blue-500/40',
    text:   'text-blue-400',
  },
  default: {
    dot:    'bg-amber-400',
    border: 'border-l-2 border-l-amber-500/40',
    text:   'text-amber-400',
  },
} as const

export type SeverityKey = keyof typeof SEVERITY

// ─── Coin sign — positive / zero / negative ──────────────────────────────────
// Used by: RecentHistory (dot + text), any component showing coin delta

export const COIN_SIGN = {
  positive: { dot: 'bg-emerald-500', text: 'text-emerald-400' },
  zero:     { dot: 'bg-blue-500',    text: 'text-blue-400'    },
  negative: { dot: 'bg-rose-500',    text: 'text-rose-400'    },
} as const

export type CoinSignKey = keyof typeof COIN_SIGN

/** Returns the sign key for a coin delta value */
export function coinSignKey(coins: number): CoinSignKey {
  return coins > 0 ? 'positive' : coins === 0 ? 'zero' : 'negative'
}

// ─── Effect level — good / warning / danger ──────────────────────────────────
// Used by: SliderField (effectPct badge)

export const EFFECT_LEVEL = {
  good:    { bg: 'bg-emerald-950', text: 'text-emerald-400' },
  warning: { bg: 'bg-amber-950',   text: 'text-amber-400'   },
  danger:  { bg: 'bg-red-950',     text: 'text-red-400'     },
} as const

export type EffectLevelKey = keyof typeof EFFECT_LEVEL

/** Returns the effect level key for a percentage value */
export function effectLevelKey(pct: number): EffectLevelKey {
  return pct >= 80 ? 'good' : pct >= 50 ? 'warning' : 'danger'
}

// ─── Toast feedback ───────────────────────────────────────────────────────────
// Used by: ToastContainer

export const TOAST_SCHEME = {
  success: 'bg-emerald-950/90 border-emerald-800 text-emerald-400',
  error:   'bg-red-950/90 border-red-800 text-red-400',
} as const

// ─── Action categories — Tailwind classes ────────────────────────────────────
// Parallel to COLORS.action in colors.ts (which holds hex for style= props).
// Used by: PerfilTab (coin log history badge), any category-colored indicator.

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

// ─── Deal themes — portal carousel ───────────────────────────────────────────
// Used by: DiscountCarousel. bg/glow are Tailwind; accent is hex for style= prop.

export const DEAL_THEMES = [
  { bg: 'from-rose-950 via-zinc-950 to-zinc-950',    glow: 'bg-rose-500/20',    accent: '#f43f5e' },
  { bg: 'from-violet-950 via-zinc-950 to-zinc-950',  glow: 'bg-violet-500/20',  accent: '#8b5cf6' },
  { bg: 'from-amber-950 via-zinc-950 to-zinc-950',   glow: 'bg-amber-500/20',   accent: '#f59e0b' },
  { bg: 'from-sky-950 via-zinc-950 to-zinc-950',     glow: 'bg-sky-500/20',     accent: '#0ea5e9' },
  { bg: 'from-emerald-950 via-zinc-950 to-zinc-950', glow: 'bg-emerald-500/20', accent: '#10b981' },
] as const
