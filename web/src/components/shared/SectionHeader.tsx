'use client'
import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui'

interface Props {
  icon?:      React.ElementType
  iconClass?: string
  title:      string
  subtitle?:  string
  search?:    string
  onSearch?:  (v: string) => void
  filters?:   React.ReactNode
  actions?:   React.ReactNode
}

export function SectionHeader({
  icon: Icon,
  iconClass = 'text-zinc-400',
  title,
  subtitle,
  search,
  onSearch,
  filters,
  actions,
}: Props) {
  const hasToolbar = filters !== undefined || onSearch !== undefined || actions !== undefined

  return (
    <div className="space-y-4 mb-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center flex-shrink-0">
            <Icon className={`w-4 h-4 ${iconClass}`} />
          </div>
        )}
        <div>
          <h2 className="text-base font-bold text-zinc-100 leading-none">{title}</h2>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Toolbar: [filters] [search] [actions] */}
      {hasToolbar && (
        <div className="flex items-center gap-2">
          {filters}
          {onSearch !== undefined && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <Input
                className="pl-9 w-full h-8 text-xs"
                placeholder="Buscar..."
                value={search}
                onChange={e => onSearch(e.target.value)}
              />
            </div>
          )}
          {actions}
        </div>
      )}
    </div>
  )
}
