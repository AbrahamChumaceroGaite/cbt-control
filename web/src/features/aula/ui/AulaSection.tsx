'use client'
import { Plus }                    from 'lucide-react'
import { Button, Grid, Combobox }  from '@/components/ui'
import { useAula }                 from '../application/useAula'
import { AwardModal }              from './AwardModal'
import { ClaimModal }              from './ClaimModal'
import { RewardsTimeline }         from './RewardsTimeline'
import { StudentRanking }          from './StudentRanking'
import { RecentHistory }           from './RecentHistory'
import type { RewardResponse }     from '@control-aula/shared'

const TIMELINE_START: RewardResponse = {
  id: 'start', name: 'Course Start', coinsRequired: 0, icon: '🚀', isGlobal: true, isActive: true,
} as RewardResponse

export function AulaSection() {
  const a = useAula()

  const timelineRewards = [TIMELINE_START, ...a.classRewards]
  const courseOptions   = a.courses.map(c => ({ value: c.id, label: c.name }))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Active Classroom</h2>
          <p className="text-zinc-400 text-sm mt-1">Track the progress of {a.course?.name ?? 'the class'} on the rewards timeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <Combobox
            value={a.courseId}
            onChange={a.setCourseId}
            options={courseOptions}
            placeholder="Select course…"
            className="w-44"
          />
          <Button onClick={a.openAward} className="px-5 py-2.5 rounded-full shadow-lg shadow-blue-900/20">
            <Plus className="w-4 h-4 mr-2" /> Award Coins
          </Button>
        </div>
      </div>

      <RewardsTimeline
        timelineRewards={timelineRewards}
        currentCoins={a.currentCoins}
        nextReward={a.nextReward}
        logs={a.logs}
        onClaim={r => a.setClaimState({ reward: r })}
      />

      <Grid cols={3} gap="lg">
        <StudentRanking students={a.students} individualRewards={a.indivRewards} onClaim={(r, s) => a.setClaimState({ reward: r, student: s })} />
        <RecentHistory logs={a.logs} />
      </Grid>

      <AwardModal
        open={a.awardOpen} step={a.step} targetMode={a.targetMode}
        selectedIds={a.selectedIds} studentQuery={a.studentQuery} chosenAction={a.chosenAction}
        awarding={a.awarding} applicable={a.applicable} filteredStu={a.filteredStu}
        selectedStu={a.selectedStu} totalStudents={a.students.length} canProceed={a.canProceed}
        onClose={a.closeAward} setStep={a.setStep} setTargetMode={a.setTargetMode}
        toggleStudent={a.toggleStudent} setStudentQuery={a.setStudentQuery}
        setChosenAction={a.setChosenAction} onExecute={a.executeAward}
      />

      <ClaimModal state={a.claimState} onClose={() => a.setClaimState(null)} onConfirm={a.claimReward} />
    </div>
  )
}
