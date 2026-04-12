import type { StudentResponse } from '@control-aula/shared'

export type StudentViewModel = StudentResponse

export interface StudentFormState {
  name:   string
  code:   string
  email:  string
  coins:  number
}

export interface StudentFilters {
  coinMax: number | null   // coinMin is always 0 (implicit)
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
  coinMax: null,
}
