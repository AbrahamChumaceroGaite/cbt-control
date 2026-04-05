function Skel({ className }: { className: string }) {
  return <div className={`bg-zinc-800 animate-pulse rounded-xl ${className}`} />
}

export function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Banner */}
      <Skel className="h-40 sm:h-52 w-full rounded-none" />

      {/* Avatar + name */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex items-end gap-4 mb-5">
          <Skel className="w-24 h-24 rounded-2xl border-4 border-zinc-950 flex-shrink-0" />
          <div className="flex-1 space-y-2 pb-1">
            <Skel className="h-5 w-44" />
            <Skel className="h-3 w-28" />
            <div className="flex gap-1.5 mt-1">
              <Skel className="h-5 w-16 rounded-md" />
              <Skel className="h-5 w-20 rounded-md" />
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Skel className="h-28" />
          <Skel className="h-28" />
        </div>

        {/* Chart */}
        <Skel className="h-28 mb-3" />

        {/* Battle pass */}
        <Skel className="h-24 mb-3" />

        {/* History */}
        <Skel className="h-64" />
      </div>
    </div>
  )
}
