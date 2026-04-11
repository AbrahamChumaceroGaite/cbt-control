import type { RewardResponse } from '@control-aula/shared'

export type RewardType     = 'class' | 'individual'
export type StatusFilter   = 'all' | 'active' | 'inactive'
export type TypeFilter     = 'all' | 'class' | 'individual'

export interface RewardViewModel extends RewardResponse {
  finalPrice: number  // coinsRequired after discount
}

export interface RewardFormState {
  name:          string
  description:   string
  icon:          string
  coinsRequired: number
  discount:      number
  type:          RewardType
  isGlobal:      boolean
  isActive:      boolean
}

export interface RewardFilters {
  type:   TypeFilter
  status: StatusFilter
}

export const EMPTY_FORM: RewardFormState = {
  name:          '',
  description:   '',
  icon:          '★',
  coinsRequired: 100,
  discount:      0,
  type:          'class',
  isGlobal:      true,
  isActive:      true,
}

export const EMPTY_FILTERS: RewardFilters = {
  type:   'all',
  status: 'all',
}

export const REWARD_ICONS = ['★', '♪', '♫', '▶', '◉', '⇄', '◆', '+', '❄', '⚡', '♛', '⊕'] as const

export const REWARD_TYPES = [
  { value: 'class',      label: 'Grupal (Clase)'      },
  { value: 'individual', label: 'Individual (Alumno)' },
] as const
