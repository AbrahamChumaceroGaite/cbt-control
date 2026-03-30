import * as React from 'react'

export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      <div className="text-zinc-600 mb-1">{icon}</div>
      <p className="text-base font-medium text-zinc-400">{title}</p>
      {description && <p className="text-sm text-zinc-600 max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
