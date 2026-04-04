import type { CourseResponse } from '@control-aula/shared'

interface Props {
  courses:   CourseResponse[]
  value:     string
  onChange:  (id: string) => void
  className?: string
}

export function CourseSelect({ courses, value, onChange, className = '' }: Props) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`h-8 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 focus:outline-none focus:border-zinc-500 ${className}`}
    >
      {courses.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  )
}
