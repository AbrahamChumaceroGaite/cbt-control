import { cva, type VariantProps } from 'class-variance-authority'
import { cn }                      from '@/lib/utils'

const rewardMilestoneVariants = cva(
  'w-7 h-7 rounded-full flex items-center justify-center text-sm border transition-all',
  {
    variants: {
      state: {
        reached: 'bg-amber-400 border-amber-200 text-amber-900 shadow-[0_0_10px_rgba(251,191,36,0.4)] hover:scale-125 cursor-pointer',
        next:    'bg-zinc-900 border-emerald-500/50 text-zinc-500 animate-pulse',
        locked:  'bg-zinc-900 border-zinc-800 text-zinc-600 opacity-40 cursor-default grayscale',
      },
    },
    defaultVariants: { state: 'locked' },
  }
)

type RewardMilestoneVariants = VariantProps<typeof rewardMilestoneVariants>

interface Props extends RewardMilestoneVariants {
  icon:      string
  title:     string
  onClick?:  () => void
  className?: string
}

export function RewardMilestoneButton({ state, icon, title, onClick, className }: Props) {
  return (
    <button
      title={title}
      onClick={state === 'reached' ? onClick : undefined}
      className={cn(rewardMilestoneVariants({ state }), className)}
    >
      {icon}
    </button>
  )
}
