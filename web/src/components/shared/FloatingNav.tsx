import React from 'react'
import { cn } from '@/lib/utils'

export interface NavTab<T extends string> {
  id:      T
  label:   string
  icon:    React.ElementType
  badge?:  number
}

interface Props<T extends string> {
  tabs:        NavTab<T>[]
  active:      T
  onTabChange: (tab: T) => void
}

export function FloatingNav<T extends string>({ tabs, active, onTabChange }: Props<T>) {
  return (
    <nav className="floating-nav">
      {tabs.map(t => {
        const Icon = t.icon
        return (
          <button key={t.id} onClick={() => onTabChange(t.id)} className={cn('nav-item', active === t.id && 'active')}>
            <div className="relative inline-flex">
              <Icon className="nav-icon" strokeWidth={active === t.id ? 2.5 : 2} />
              {!!t.badge && t.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[9px] font-black rounded-full min-w-[14px] h-3.5 px-0.5 flex items-center justify-center leading-none">
                  {t.badge > 9 ? '9+' : t.badge}
                </span>
              )}
            </div>
            {active === t.id && <span className="nav-label">{t.label}</span>}
          </button>
        )
      })}
    </nav>
  )
}
