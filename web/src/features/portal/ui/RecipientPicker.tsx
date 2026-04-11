'use client'
import { ArrowRight, Loader2, Search, User, X } from 'lucide-react'
import { Combobox } from '@/components/ui'
import type { StudentSearchResult } from '../domain/types'

interface Props {
  courses:    { id: string; name: string }[]
  courseId:   string
  q:          string
  results:    StudentSearchResult[]
  searching:  boolean
  onCourseChange: (id: string) => void
  onQChange:      (q: string)  => void
  onClearSearch:  ()           => void
  onSelect:       (s: StudentSearchResult) => void
}

export function RecipientPicker({ courses, courseId, q, results, searching, onCourseChange, onQChange, onClearSearch, onSelect }: Props) {
  const courseOptions = [
    { value: '', label: 'Seleccionar curso…' },
    ...courses.map(c => ({ value: c.id, label: c.name })),
  ]

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Combobox
          value={courseId}
          onChange={onCourseChange}
          options={courseOptions}
          placeholder="Curso…"
          size="default"
          className="w-40 flex-shrink-0"
        />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={e => onQChange(e.target.value)}
            disabled={!courseId}
            placeholder={courseId ? 'Buscar por nombre…' : 'Selecciona un curso primero'}
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 animate-spin" />}
          {!searching && q && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="rounded-xl border border-zinc-700/60 bg-zinc-900 overflow-hidden shadow-2xl">
          {results.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => { onSelect(s); onClearSearch() }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors border-b border-zinc-800/50 last:border-0 text-left"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {s.avatarUrl
                  ? <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover" />
                  : <User className="w-4 h-4 text-amber-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-200 truncate">{s.name}</p>
                <p className="text-[11px] text-zinc-500">{s.courseName}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
            </button>
          ))}
        </div>
      )}

      {courseId && q.trim().length >= 2 && results.length === 0 && !searching && (
        <p className="text-xs text-zinc-600 text-center py-2">Sin resultados para &ldquo;{q}&rdquo;</p>
      )}
    </div>
  )
}
