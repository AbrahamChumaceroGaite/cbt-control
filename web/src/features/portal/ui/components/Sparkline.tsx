'use client'

interface Props {
  values: number[]
  color:  string
}

export function Sparkline({ values, color }: Props) {
  if (values.length < 2) return null
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100
    const y = 30 - ((v - min) / range) * 26
    return `${x},${y}`
  }).join(' L ')
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-full">
      <defs>
        <linearGradient id={`sp-${color.replace('#','')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${pts} L 100,32 L 0,32 Z`} fill={`url(#sp-${color.replace('#','')})`} />
      <path d={`M ${pts}`} fill="none" stroke={color} strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  )
}
