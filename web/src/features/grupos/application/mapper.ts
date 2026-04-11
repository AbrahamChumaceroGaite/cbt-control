import type { GroupResponse, GroupInput } from '@control-aula/shared'
import type { GroupViewModel, GroupFormState } from '../domain/types'

export const GroupMapper = {
  toViewModel(dto: GroupResponse): GroupViewModel {
    return dto
  },

  toForm(vm: GroupViewModel): GroupFormState {
    return {
      name:       vm.name,
      studentIds: vm.members.map(m => m.studentId),
    }
  },

  toDto(form: GroupFormState, courseId: string): GroupInput & { courseId: string } {
    return {
      name:       form.name.trim(),
      studentIds: form.studentIds,
      courseId,
    }
  },
}
