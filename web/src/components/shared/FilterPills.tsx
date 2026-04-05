interface Option<T extends string> {
  value:  T
  label:  string
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
  className   = '',
}: Props<T>) {
  const active = accentColor === 'purple'
    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'

  return (
    <div className={`flex gap-1.5 flex-wrap ${className}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 h-7 rounded-lg text-xs font-semibold transition-colors border ${
            value === opt.value
              ? active
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 border-transparent'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
