import { cva, type VariantProps } from 'class-variance-authority'
import { cn }                      from '@/lib/utils'

const rankBadgeVariants = cva(
  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
  {
    variants: {
      rank: {
        first:   'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        second:  'bg-zinc-300/20 text-zinc-300 border border-zinc-300/30',
        third:   'bg-amber-700/20 text-amber-600 border border-amber-700/30',
        default: 'text-zinc-600 border border-zinc-800',
      },
    },
    defaultVariants: { rank: 'default' },
  }
)

type RankBadgeVariants = VariantProps<typeof rankBadgeVariants>

interface Props extends RankBadgeVariants {
  position: number
  className?: string
}

/** Converts a 1-based position index to the rank variant key */
function rankFromPosition(pos: number): NonNullable<RankBadgeVariants['rank']> {
  if (pos === 1) return 'first'
  if (pos === 2) return 'second'
  if (pos === 3) return 'third'
  return 'default'
}

export function RankBadge({ position, className }: Props) {
  return (
    <div className={cn(rankBadgeVariants({ rank: rankFromPosition(position) }), className)}>
      {position}
    </div>
  )
}
