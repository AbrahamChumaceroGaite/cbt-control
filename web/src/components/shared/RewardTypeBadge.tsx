import { cva, type VariantProps } from 'class-variance-authority'
import { cn }                      from '@/lib/utils'

const rewardTypeBadgeVariants = cva(
  'px-2 py-0.5 rounded text-xs',
  {
    variants: {
      type: {
        class:      'bg-blue-900/30 text-blue-300',
        individual: 'bg-rose-900/30 text-rose-300',
      },
    },
    defaultVariants: { type: 'individual' },
  }
)

type RewardTypeBadgeVariants = VariantProps<typeof rewardTypeBadgeVariants>

const LABELS: Record<NonNullable<RewardTypeBadgeVariants['type']>, string> = {
  class:      'Grupal (Clase)',
  individual: 'Individual (Alumno)',
}

interface Props extends RewardTypeBadgeVariants {
  className?: string
}

export function RewardTypeBadge({ type, className }: Props) {
  return (
    <span className={cn(rewardTypeBadgeVariants({ type }), className)}>
      {LABELS[type ?? 'individual']}
    </span>
  )
}
