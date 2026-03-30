'use client'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui'

export function SectionHeader({ title, subtitle, search, onSearch, actions }: {
  title: string; subtitle?: string
  search?: string; onSearch?: (v: string) => void
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">{title}</h2>
        {subtitle && <p className="text-zinc-400 text-sm">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {onSearch !== undefined && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <Input className="pl-9 w-[200px]" placeholder="Buscar..." value={search} onChange={e => onSearch(e.target.value)} />
          </div>
        )}
        {actions}
      </div>
    </div>
  )
}
