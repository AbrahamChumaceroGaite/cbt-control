'use client'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'

export function CardActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3 backdrop-blur-sm bg-zinc-950/70">
      <Button variant="secondary" size="sm" onClick={onEdit}>
        <Pencil className="w-3.5 h-3.5" /> Editar
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="w-3.5 h-3.5" /> Eliminar
      </Button>
    </div>
  )
}
