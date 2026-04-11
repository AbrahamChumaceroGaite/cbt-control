import type { ActionResponse, RewardResponse, StudentResponse } from '@control-aula/shared'

export type AwardStep   = 'recipients' | 'action' | 'confirm'
export type TargetMode  = 'class' | 'students'

export interface ClaimState {
  reward:   RewardResponse
  student?: StudentResponse
}

export interface AwardState {
  open:         boolean
  step:         AwardStep
  targetMode:   TargetMode
  selectedIds:  Set<string>
  studentQuery: string
  chosenAction: ActionResponse | null
  awarding:     boolean
}

export const EMPTY_AWARD: AwardState = {
  open:         false,
  step:         'recipients',
  targetMode:   'class',
  selectedIds:  new Set(),
  studentQuery: '',
  chosenAction: null,
  awarding:     false,
}
