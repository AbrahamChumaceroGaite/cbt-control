import type { CourseResponse } from '@control-aula/shared'

// Alias — no computed fields needed for the list view
export type CourseViewModel = CourseResponse

export interface CourseFormState {
  name:       string
  level:      string
  parallel:   string
  classCoins: number
}

export const EMPTY_FORM: CourseFormState = {
  name:       '',
  level:      'Secondary 2',
  parallel:   'A',
  classCoins: 0,
}
