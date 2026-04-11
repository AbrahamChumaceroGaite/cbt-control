import { cn }          from '@/lib/utils'
import { CardActions } from '@/components/shared/CardActions'
import type { ActionViewModel } from '../domain/types'

interface Props {
  action:   ActionViewModel
  onEdit:   () => void
  onDelete: () => void
}

export function ActionCard({ action: a, onEdit, onDelete }: Props) {
  return (
    <div className={cn(
      'group relative card-base p-5 flex flex-col justify-between transition-opacity hover:border-zinc-600',
      !a.isActive && 'opacity-60',
    )}>
      <div>
        <div className="flex justify-between items-start mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
            style={{
              background: `${a.colorConfig.bg}40`,
              color:       a.colorConfig.text,
              border:     `1px solid ${a.colorConfig.bg}`,
            }}
          >
            {a.coins > 0 ? '+' : ''}{a.coins}
          </div>
          {!a.isActive && (
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Inactiva</span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-white mb-1 leading-tight">{a.name}</h3>
        <div className="flex gap-2 text-xs mt-3">
          {a.affectsClass   && <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">Clase</span>}
          {a.affectsStudent && <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">Estudiante</span>}
        </div>
      </div>
      <CardActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}
