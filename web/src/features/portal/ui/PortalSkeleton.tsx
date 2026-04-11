import { Skeleton } from '@/components/ui'

export function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-28">
      {/* Hero */}
      <div className="relative h-[420px] sm:h-[480px] w-full bg-zinc-900 animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-4">
          <Skeleton className="w-28 h-28 rounded-full mb-4" />
          <Skeleton className="h-6 w-48 rounded-xl mb-2" />
          <Skeleton className="h-3 w-32 rounded-xl mb-5" />
          <div className="flex gap-2.5">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-20 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="px-4 mt-6 max-w-2xl mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}
