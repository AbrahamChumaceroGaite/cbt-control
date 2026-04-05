import * as React from 'react'

export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-500 mb-1">
        {icon}
      </div>
      <p className="text-sm font-semibold text-zinc-300">{title}</p>
      {description && <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
