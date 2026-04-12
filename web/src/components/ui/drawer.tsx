'use client'
import * as React  from 'react'
import { X }       from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn }      from '@/lib/utils'
import { Z }       from '@/config/scheme'
import { Button }  from './button'

const panelVariants = cva(
  'fixed top-0 h-full bg-zinc-950 flex flex-col transition-transform duration-300',
  {
    variants: {
      size: {
        sm:   'w-full sm:max-w-sm',
        md:   'w-full sm:max-w-md',
        lg:   'w-full sm:max-w-lg',
      },
      side: {
        right: 'right-0 border-l border-zinc-800',
        left:  'left-0 border-r border-zinc-800',
      },
    },
    defaultVariants: { size: 'sm', side: 'right' },
  }
)

export type DrawerSize = VariantProps<typeof panelVariants>['size']

interface DrawerProps extends VariantProps<typeof panelVariants> {
  open:      boolean
  onClose:   () => void
  title?:    string
  children:  React.ReactNode
  className?: string
}

export function Drawer({ open, onClose, title, children, size, side = 'right', className }: DrawerProps) {
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: Z.DRAWER }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(panelVariants({ size, side }), className)}
        style={{ zIndex: Z.DRAWER + 1 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
          <Button variant="ghost" size="icon" onClick={onClose} className="ml-auto w-8 h-8 text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </>
  )
}
