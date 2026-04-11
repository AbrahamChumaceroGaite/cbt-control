import type { StudentResponse } from '@control-aula/shared'

export type StudentViewModel = StudentResponse

export interface StudentFormState {
  name:   string
  code:   string
  email:  string
  coins:  number
}

export interface StudentFilters {
  coinMin: number
  coinMax: number | null
}

export interface ImportRow {
  code:  string
  name:  string
  email: string
}

export const EMPTY_FORM: StudentFormState = {
  name:  '',
  code:  '',
  email: '',
  coins: 0,
}

export const EMPTY_FILTERS: StudentFilters = {
  coinMin: 0,
  coinMax: null,
}
