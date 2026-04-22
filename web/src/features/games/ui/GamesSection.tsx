'use client'
import { Gamepad2 }          from 'lucide-react'
import { SectionHeader }     from '@/components/shared/SectionHeader'
import { Grid }              from '@/components/ui/grid'
import { useGames }          from '../application/useGames'
import { GameCard }          from './components/GameCard'
import { GameDetailPanel }   from './components/GameDetailPanel'
import { GamePlayer }        from './components/GamePlayer'
import { GameEditModal }     from './components/GameEditModal'

interface Props { isAdmin?: boolean }

export function GamesSection({ isAdmin }: Props) {
  const {
    games, loading, selectedGame, levels, levelsLoading,
    playing, editing, editForm, saving, session, upload, handlers,
  } = useGames()

  if (playing && selectedGame) {
    return (
      <GamePlayer
        game={selectedGame}
        levels={levels}
        session={session}
        onClose={handlers.stopPlaying}
      />
    )
  }

  return (
    <div className="animate-in fade-in duration-300">
      {selectedGame ? (
        <div className="max-w-3xl">
          <GameDetailPanel
            game={selectedGame}
            levels={levels}
            levelsLoading={levelsLoading}
            onBack={handlers.clearSelection}
            onPlay={handlers.startPlaying}
            onEdit={isAdmin ? () => handlers.openEdit(selectedGame) : undefined}
          />
        </div>
      ) : (
        <>
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
        </>
      )}

      {editing && (
        <GameEditModal
          game={editing}
          form={editForm}
          saving={saving}
          upload={upload}
          onClose={handlers.closeEdit}
          onSave={handlers.saveEdit}
          onFormChange={patch => handlers.setEditForm(f => ({ ...f, ...patch }))}
        />
      )}
    </div>
  )
}
