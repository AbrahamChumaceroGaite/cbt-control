function Skel({ className }: { className: string }) {
  return <div className={`bg-zinc-800 animate-pulse rounded-xl ${className}`} />
}

export function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-28">
      {/* Hero */}
      <div className="relative h-[420px] sm:h-[480px] w-full bg-zinc-900 animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-4">
          <Skel className="w-28 h-28 rounded-full mb-4" />
          <Skel className="h-6 w-48 mb-2" />
          <Skel className="h-3 w-32 mb-5" />
          <div className="flex gap-2.5">
            <Skel className="h-10 w-24 rounded-xl" />
            <Skel className="h-10 w-20 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="px-4 mt-6 max-w-2xl mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Skel className="h-36" />
          <Skel className="h-36" />
        </div>
        <Skel className="h-28" />
        <Skel className="h-36" />
        <Skel className="h-64" />
      </div>
    </div>
  )
}
