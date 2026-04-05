'use client'
import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode
}

export function Input({ className, type, startIcon, ...props }: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === 'password'

  return (
    <div className="relative flex items-center w-full">
      {startIcon && (
        <div className="absolute left-2.5 flex items-center pointer-events-none text-zinc-500">
          {startIcon}
        </div>
      )}
      <input
        type={isPassword ? (showPassword ? 'text' : 'password') : type}
        className={cn(
          'flex h-8 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-zinc-500 disabled:opacity-50',
          startIcon && 'pl-8',
          isPassword && 'pr-8',
          className
        )}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(v => !v)}
          className="absolute right-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  )
}
