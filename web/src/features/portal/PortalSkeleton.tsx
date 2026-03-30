function Skel({ className }: { className: string }) {
  return <div className={`bg-zinc-800 animate-pulse rounded-xl ${className}`} />
}

export function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800/50 px-5 py-4 flex items-center justify-between">
        <div className="space-y-2">
          <Skel className="h-5 w-36" />
          <Skel className="h-3 w-24" />
        </div>
        <Skel className="h-10 w-16 rounded-full" />
      </div>
      <div className="max-w-xl mx-auto p-5 space-y-4 mt-4">
        <Skel className="h-36 w-full" />
        <Skel className="h-20 w-full" />
        <Skel className="h-20 w-full" />
        <Skel className="h-20 w-full" />
      </div>
    </div>
  )
}
