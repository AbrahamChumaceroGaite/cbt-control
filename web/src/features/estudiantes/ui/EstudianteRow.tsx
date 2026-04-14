import { Pencil, Trash2 } from 'lucide-react'
import { Tooltip }        from '@/components/ui'
import type { StudentViewModel } from '../domain/types'

interface Props {
  student:  StudentViewModel
  onEdit:   () => void
  onDelete: () => void
}

export function EstudianteRow({ student: s, onEdit, onDelete }: Props) {
  return (
    <tr className="hover:bg-zinc-900/30 transition-colors group">
      <td className="px-6 py-4"><div className="font-semibold text-zinc-100">{s.name}</div></td>
      <td className="px-6 py-4 text-zinc-400">{s.code || '-'}</td>
      <td className="px-6 py-4 text-zinc-400">{s.email || '-'}</td>
      <td className="px-6 py-4 text-right">
        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-zinc-800 text-zinc-200 font-bold border border-zinc-700">
          {s.coins}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip content="Edit student">
            <button onClick={onEdit}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip content="Delete student">
            <button onClick={onDelete}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </td>
    </tr>
  )
}
