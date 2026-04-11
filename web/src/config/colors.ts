/** Migrated from lib/constants.ts — single source of truth for colors. */
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
} as const
