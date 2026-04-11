/**
 * scheme.ts — Tailwind class string mappings (single source of truth).
 *
 * Complements colors.ts (which holds hex/rgba for style= props).
 * Every object here contains only Tailwind class strings for className= use.
 * Components must import from here — never redeclare these locally.
 */

// ─── Z-index hierarchy ────────────────────────────────────────────────────────
// Use as: className={`z-[${Z.MODAL}]`} OR directly as Tailwind arbitrary values.
// Tailwind JIT arbitrary: z-[var(--z-drawer)] works too, but named constants
// are preferred for readability.
export const Z = {
  STICKY:  30,   // sticky headers, floating nav
  POPOVER: 50,   // dropdowns, tooltips
  DRAWER:  100,  // drawers, overlapping panels, NoteModal, LogoutModal
  MODAL:   200,  // full-screen modals (Modal component)
  TOAST:   600,  // toasts — always on top
} as const

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
// Used by: status-badge.tsx (via CVA), TX_STATUS consumers in usuarios/,
//          STATUS_CLASS consumers in solicitudes/. Single definition.
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
// Used by: TxHistory, BankTab, any component showing direction indicator.
export const TX_DIRECTION = {
  sent:     { icon: 'bg-red-500/10 border border-red-500/20',     text: 'text-red-400',     rotate: 'rotate-12'  },
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
// Parallel to COLORS.action in colors.ts (hex for style= props).
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
