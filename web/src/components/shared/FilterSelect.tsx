interface FilterSelectProps {
  label:   string
  value:   string
  onChange: (value: string) => void
  options: readonly { value: string; label: string }[]
}

/** Labelled select for use inside FilterPopover children. */
export function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-500"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
