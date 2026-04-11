import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const pillVariants = cva(
  'px-3 h-7 rounded-lg text-xs font-semibold transition-colors border',
  {
    variants: {
      state: {
        active:   '',
        inactive: 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 border-transparent',
      },
      accent: {
        amber:  '',
        purple: '',
      },
    },
    compoundVariants: [
      { state: 'active', accent: 'amber',  className: 'bg-amber-500/15 text-amber-300 border-amber-500/30'    },
      { state: 'active', accent: 'purple', className: 'bg-purple-600/20 text-purple-300 border-purple-500/30' },
    ],
    defaultVariants: { state: 'inactive', accent: 'amber' },
  }
)

interface Option<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  options:       Option<T>[]
  value:         T
  onChange:      (v: T) => void
  accentColor?:  'amber' | 'purple'
  className?:    string
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  accentColor = 'amber',
  className,
}: Props<T>) {
  return (
    <div className={cn('flex gap-1.5 flex-wrap', className)}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={pillVariants({
            state:  value === opt.value ? 'active' : 'inactive',
            accent: accentColor,
          })}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
