'use client'
import { Gamepad2 }          from 'lucide-react'
import { SectionHeader }     from '@/components/shared/SectionHeader'
import { Grid }              from '@/components/ui/grid'
import { useGames }          from '../application/useGames'
import { GameCard }          from './components/GameCard'
import { GameDetailPanel }   from './components/GameDetailPanel'

export function GamesSection() {
  const { games, loading, selectedGame, levels, levelsLoading, handlers } = useGames()

  if (selectedGame) {
    return (
      <div className="animate-in fade-in duration-300 max-w-3xl">
        <GameDetailPanel
          game={selectedGame}
          levels={levels}
          levelsLoading={levelsLoading}
          onBack={handlers.clearSelection}
        />
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-300">
      <SectionHeader
        icon={Gamepad2} iconClass="text-purple-400"
        title="Games Library"
        subtitle="Educational games for students. Click a game to explore its levels and rewards."
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-52 rounded-xl bg-zinc-900 animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : (
        <Grid cols={4}>
          {games.map(g => (
            <GameCard key={g.id} game={g} onSelect={handlers.selectGame} />
          ))}
          {games.length === 0 && (
            <p className="col-span-full text-center py-16 text-zinc-500 text-sm">
              No games available yet.
            </p>
          )}
        </Grid>
      )}
    </div>
  )
}
