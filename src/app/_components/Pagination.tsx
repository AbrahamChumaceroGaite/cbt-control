'use client'
import { cn } from '@/lib/utils'
import { PAGE_SIZE } from '@/lib/types'

export function Pagination({ page, total, onChange }: {
  page: number; total: number; onChange: (p: number) => void
}) {
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-between text-sm pt-1">
      <span className="text-zinc-500 text-xs">
        {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)} de {total * PAGE_SIZE - (PAGE_SIZE - 1)} aprox.
      </span>
      <div className="flex gap-1">
        <button onClick={() => onChange(0)} disabled={page === 0} className="btn btn-secondary px-2 py-1 text-xs disabled:opacity-30">«</button>
        <button onClick={() => onChange(page - 1)} disabled={page === 0} className="btn btn-secondary px-3 py-1 text-xs disabled:opacity-30">‹</button>
        {Array.from({ length: total }, (_, i) => (
          <button key={i} onClick={() => onChange(i)} className={cn('btn px-3 py-1 text-xs', i === page ? 'btn-primary' : 'btn-secondary')}>{i + 1}</button>
        ))}
        <button onClick={() => onChange(page + 1)} disabled={page >= total - 1} className="btn btn-secondary px-3 py-1 text-xs disabled:opacity-30">›</button>
        <button onClick={() => onChange(total - 1)} disabled={page >= total - 1} className="btn btn-secondary px-2 py-1 text-xs disabled:opacity-30">»</button>
      </div>
    </div>
  )
}
