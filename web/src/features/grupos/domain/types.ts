import type { GroupResponse, CourseResponse, StudentResponse } from '@control-aula/shared'

export type GroupViewModel = GroupResponse

export interface GroupFormState {
  name:       string
  studentIds: string[]
}

export interface GroupsContext {
  courses:       CourseResponse[]
  students:      StudentResponse[]
  currentCourse: string
}

export const EMPTY_FORM: GroupFormState = {
  name:       '',
  studentIds: [],
}
