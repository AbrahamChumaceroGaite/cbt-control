'use client'
import { Pencil, Trash2 } from 'lucide-react'

export function CardActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3 backdrop-blur-sm bg-zinc-950/70">
      <button className="btn btn-secondary px-4 gap-1.5" onClick={onEdit}><Pencil size={14} />Editar</button>
      <button className="btn btn-danger px-4 gap-1.5" onClick={onDelete}><Trash2 size={14} />Eliminar</button>
    </div>
  )
}
