import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Label map — separate from styles so CVA can own the styling axis
const STATUS_LABELS: Record<string, string> = {
  pending:      'Pendiente',
  approved:     'Aprobada',
  rejected:     'Rechazada',
  approved_req: '✓ Aprobado',
  rejected_req: '✕ Rechazado',
  pending_req:  '⏳ Pendiente',
}

const statusBadgeVariants = cva(
  'font-bold rounded-full border',
  {
    variants: {
      status: {
        pending:      'bg-amber-500/15 text-amber-400 border-amber-500/25',
        approved:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
        rejected:     'bg-red-500/15 text-red-400 border-red-500/25',
        approved_req: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
        rejected_req: 'bg-red-950/60 text-red-400 border-red-800/40',
        pending_req:  'bg-amber-950/60 text-amber-400 border-amber-800/40',
      },
      size: {
        xs: 'text-[9px] px-1.5 py-0.5',
        sm: 'text-[11px] px-2.5 py-1',
      },
    },
    defaultVariants: { status: 'pending', size: 'xs' },
  }
)

type StatusBadgeVariants = VariantProps<typeof statusBadgeVariants>
type StatusKey = NonNullable<StatusBadgeVariants['status']>

interface Props {
  status:    StatusKey | string
  size?:     'xs' | 'sm'
  variant?:  'default' | 'request'
  className?: string
}

export function StatusBadge({ status, size = 'xs', variant = 'default', className }: Props) {
  const key = (
    variant === 'request' && `${status}_req` in STATUS_LABELS
      ? `${status}_req`
      : status
  ) as StatusKey

  return (
    <span className={cn(statusBadgeVariants({ status: key, size }), className)}>
      {STATUS_LABELS[key] ?? STATUS_LABELS.pending}
    </span>
  )
}
