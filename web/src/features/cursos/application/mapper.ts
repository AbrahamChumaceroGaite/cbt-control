import type { CourseResponse, CourseInput } from '@control-aula/shared'
import type { CourseViewModel, CourseFormState } from '../domain/types'

export const CourseMapper = {
  toViewModel(dto: CourseResponse): CourseViewModel {
    return dto
  },

  toForm(vm: CourseViewModel): CourseFormState {
    return {
      name:       vm.name,
      level:      vm.level,
      parallel:   vm.parallel,
      classCoins: vm.classCoins,
    }
  },

  toDto(form: CourseFormState): CourseInput {
    return {
      name:       form.name.trim(),
      level:      form.level.trim(),
      parallel:   form.parallel.trim(),
      classCoins: form.classCoins,
    }
  },
}
