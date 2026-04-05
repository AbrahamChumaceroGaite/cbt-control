const STATUS_CONFIG = {
  pending:  { label: 'Pendiente', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  approved: { label: 'Aprobada',  cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  rejected: { label: 'Rechazada', cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
  // solicitudes label variants
  approved_req: { label: '✓ Aprobado',  cls: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' },
  rejected_req: { label: '✕ Rechazado', cls: 'bg-red-950/60 text-red-400 border-red-800/40' },
  pending_req:  { label: '⏳ Pendiente', cls: 'bg-amber-950/60 text-amber-400 border-amber-800/40' },
} as const

type StatusKey = keyof typeof STATUS_CONFIG

interface Props {
  status:    StatusKey | string
  size?:     'xs' | 'sm'
  variant?:  'default' | 'request'
  className?: string
}

export function StatusBadge({ status, size = 'xs', variant = 'default', className = '' }: Props) {
  const key: StatusKey = variant === 'request'
    ? (`${status}_req` as StatusKey) in STATUS_CONFIG
      ? (`${status}_req` as StatusKey)
      : (status as StatusKey)
    : (status as StatusKey)

  const cfg = STATUS_CONFIG[key] ?? STATUS_CONFIG.pending
  const sizeClass = size === 'sm'
    ? 'text-[11px] px-2.5 py-1'
    : 'text-[9px] px-1.5 py-0.5'

  return (
    <span className={`font-bold rounded-full border ${cfg.cls} ${sizeClass} ${className}`}>
      {cfg.label}
    </span>
  )
}
