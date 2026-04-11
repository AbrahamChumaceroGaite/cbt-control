import { cn }          from '@/lib/utils'
import { CardActions } from '@/components/shared/CardActions'
import type { RewardViewModel } from '../domain/types'

interface Props {
  reward:   RewardViewModel
  onEdit:   () => void
  onDelete: () => void
}

export function RewardCard({ reward: r, onEdit, onDelete }: Props) {
  return (
    <div className={cn(
      'group relative card-base p-5 flex flex-col justify-between transition-opacity hover:border-zinc-600',
      !r.isActive && 'opacity-60',
    )}>
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xl">
            {r.icon}
          </div>
          <div className="flex flex-col items-end gap-1">
            {r.discount > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-900/40 text-rose-400 border border-rose-500/20">
                -{r.discount}%
              </span>
            )}
            <span className="text-xs font-bold px-2 py-1 rounded bg-zinc-800 text-zinc-300">
              {r.coinsRequired} coins
            </span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{r.name}</h3>
        <p className="text-sm text-zinc-400 line-clamp-2">{r.description || 'Sin descripción'}</p>
        <div className="flex gap-2 text-xs mt-4">
          {r.type === 'class'
            ? <span className="px-2 py-0.5 rounded bg-blue-900/30 text-blue-300">Grupal (Clase)</span>
            : <span className="px-2 py-0.5 rounded bg-rose-900/30 text-rose-300">Individual (Alumno)</span>}
          {!r.isActive && (
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">Inactiva</span>
          )}
        </div>
      </div>
      <CardActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}
