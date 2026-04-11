import { Users }       from 'lucide-react'
import { CardActions } from '@/components/shared/CardActions'
import type { CourseViewModel } from '../domain/types'

interface Props {
  course:   CourseViewModel
  onEdit:   () => void
  onDelete: () => void
}

export function CursoCard({ course: c, onEdit, onDelete }: Props) {
  return (
    <div className="group relative card-base p-5 flex flex-col justify-between hover:border-zinc-600 transition-all duration-200">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white">{c.name}</h3>
          <span className="text-lg font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
            {c.classCoins} coins
          </span>
        </div>
        <div className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-wider">
          {c.level} — Par. {c.parallel}
        </div>
        <div className="mt-4 text-sm text-zinc-400 flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> {c.studentCount ?? 0} estudiantes
        </div>
      </div>
      <CardActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}
