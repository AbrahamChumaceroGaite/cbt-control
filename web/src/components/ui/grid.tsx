import { cn } from '@/lib/utils'

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?:        1 | 2 | 3 | 4 | 'auto'
  gap?:         'sm' | 'default' | 'lg'
  minColWidth?: string // used only when cols='auto', e.g. '280px'
}

const colsMap: Record<string, string> = {
  '1':    'grid-cols-1',
  '2':    'grid-cols-1 sm:grid-cols-2',
  '3':    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4':    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  'auto': 'grid-cols-[repeat(auto-fill,minmax(var(--grid-min-col-width,280px),1fr))]',
}

const gapMap = {
  sm:      'gap-3',
  default: 'gap-4',
  lg:      'gap-6',
}

export function Grid({ cols = 3, gap = 'default', minColWidth, className, style, ...props }: GridProps) {
  return (
    <div
      className={cn('grid', colsMap[String(cols)], gapMap[gap], className)}
      style={minColWidth ? { '--grid-min-col-width': minColWidth, ...style } as React.CSSProperties : style}
      {...props}
    />
  )
}
