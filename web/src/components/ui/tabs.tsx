'use client'
import { cn } from '@/lib/utils'

interface Tab {
  id:       string
  label:    string
  icon?:    React.ReactNode
  badge?:   number
}

interface TabsProps {
  tabs:      Tab[]
  active:    string
  onChange:  (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-zinc-800', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors relative',
            active === tab.id
              ? 'text-white border-b-2 border-amber-400 -mb-px'
              : 'text-zinc-500 hover:text-zinc-300',
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge != null && tab.badge > 0 && (
            <span className="ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-zinc-900">
              {tab.badge > 99 ? '99+' : tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
