function Skel({ className }: { className: string }) {
  return <div className={`bg-zinc-800 animate-pulse rounded-xl ${className}`} />
}

export function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Banner skeleton */}
      <Skel className="h-36 sm:h-44 w-full rounded-none" />
      <div className="px-4 pb-4 bg-zinc-950">
        {/* Avatar + name */}
        <div className="flex items-end gap-4 -mt-10 mb-4">
          <Skel className="w-20 h-20 rounded-2xl border-4 border-zinc-950 flex-shrink-0" />
          <div className="flex-1 space-y-2 pb-1">
            <Skel className="h-5 w-40" />
            <Skel className="h-3 w-28" />
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => <Skel key={i} className="h-16" />)}
        </div>
      </div>
      {/* Content */}
      <div className="px-4 pt-4 space-y-3">
        <Skel className="h-20 w-full" />
        <Skel className="h-48 w-full" />
      </div>
    </div>
  )
}
