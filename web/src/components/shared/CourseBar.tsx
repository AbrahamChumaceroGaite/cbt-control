import type { CourseResponse } from '@control-aula/shared'

interface Props {
  courses: CourseResponse[]
  current: string
  onChange: (id: string) => void
}

export function CourseBar({ courses, current, onChange }: Props) {
  if (courses.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-zinc-800/50">
      {courses.map(c => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
            c.id === current
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.1)]'
              : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-900/50'
          }`}
        >
          {c.name}
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
            c.id === current ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-600'
          }`}>
            {c.classCoins}c
          </span>
        </button>
      ))}
    </div>
  )
}
