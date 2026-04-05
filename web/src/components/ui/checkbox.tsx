'use client'
import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

export function Checkbox({ checked = false, onCheckedChange, disabled, className, id }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'w-4 h-4 rounded flex items-center justify-center border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-50 disabled:pointer-events-none flex-shrink-0',
        checked
          ? 'bg-amber-500 border-amber-500'
          : 'bg-transparent border-zinc-600 hover:border-zinc-400',
        className
      )}
    >
      {checked && <Check className="w-2.5 h-2.5 text-zinc-900 stroke-[3]" />}
    </button>
  )
}
