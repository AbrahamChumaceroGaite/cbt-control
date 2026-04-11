import { CardActions } from '@/components/shared/CardActions'
import type { GroupViewModel } from '../domain/types'

interface Props {
  group:    GroupViewModel
  onEdit:   () => void
  onDelete: () => void
}

export function GroupCard({ group: g, onEdit, onDelete }: Props) {
  return (
    <div className="group relative card-base p-5 flex flex-col justify-between hover:border-zinc-600 transition-all duration-200">
      <div>
        <h3 className="text-lg font-bold text-white mb-3">{g.name}</h3>
        <div className="space-y-1 mt-2">
          {g.members.map(m => (
            <div key={m.id} className="text-sm text-zinc-300 flex justify-between items-center bg-zinc-900/50 px-2 py-1 rounded">
              <span>{m.student.name}</span>
              <span className="text-xs font-mono text-zinc-500">{m.student.coins} coins</span>
            </div>
          ))}
          {g.members.length === 0 && (
            <p className="text-zinc-500 text-sm italic">Sin miembros</p>
          )}
        </div>
      </div>
      <CardActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}
