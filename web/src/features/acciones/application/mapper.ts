import { COLORS }     from '@/config/scheme'
import type { ActionResponse, ActionInput } from '@control-aula/shared'
import type { ActionViewModel, ActionFormState } from '../domain/types'

const ACTION_COLOR_MAP = COLORS.action as Record<string, { bg: string; text: string }>

export const ActionMapper = {
  toViewModel(dto: ActionResponse): ActionViewModel {
    return { ...dto, colorConfig: ACTION_COLOR_MAP[dto.category] ?? COLORS.actionFallback }
  },

  toForm(vm: ActionViewModel): ActionFormState {
    return {
      name:           vm.name,
      coins:          vm.coins,
      category:       vm.category,
      affectsClass:   vm.affectsClass,
      affectsStudent: vm.affectsStudent,
      isActive:       vm.isActive,
    }
  },

  toDto(form: ActionFormState): ActionInput {
    return {
      name:           form.name.trim(),
      coins:          form.coins,
      category:       form.category,
      affectsClass:   form.affectsClass,
      affectsStudent: form.affectsStudent,
      isActive:       form.isActive,
    }
  },
}
