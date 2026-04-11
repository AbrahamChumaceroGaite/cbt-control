import type { StudentResponse, StudentInput } from '@control-aula/shared'
import type { StudentViewModel, StudentFormState } from '../domain/types'

export const StudentMapper = {
  toViewModel(dto: StudentResponse): StudentViewModel {
    return dto
  },

  toForm(vm: StudentViewModel): StudentFormState {
    return {
      name:  vm.name,
      code:  vm.code,
      email: vm.email ?? '',
      coins: vm.coins,
    }
  },

  toCreateDto(form: StudentFormState, courseId: string): StudentInput & { courseId: string; name: string } {
    return {
      name:     form.name.trim(),
      code:     form.code.trim(),
      email:    form.email.trim() || undefined,
      courseId,
    }
  },

  toUpdateDto(form: StudentFormState): StudentInput {
    return {
      name:  form.name.trim(),
      code:  form.code.trim(),
      email: form.email.trim() || undefined,
      coins: form.coins,
    }
  },
}
