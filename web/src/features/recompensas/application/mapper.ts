import type { RewardResponse, RewardInput } from '@control-aula/shared'
import type { RewardViewModel, RewardFormState, RewardType } from '../domain/types'

export const RewardMapper = {
  toViewModel(dto: RewardResponse): RewardViewModel {
    const discount   = dto.discount ?? 0
    const finalPrice = discount > 0
      ? Math.max(1, Math.round(dto.coinsRequired * (1 - discount / 100)))
      : dto.coinsRequired
    return { ...dto, finalPrice }
  },

  toForm(vm: RewardViewModel): RewardFormState {
    return {
      name:          vm.name,
      description:   vm.description,
      icon:          vm.icon,
      coinsRequired: vm.coinsRequired,
      discount:      vm.discount ?? 0,
      type:          (vm.type === 'individual' ? 'individual' : 'class') as RewardType,
      isGlobal:      vm.isGlobal,
      isActive:      vm.isActive,
    }
  },

  toDto(form: RewardFormState): RewardInput {
    return {
      name:          form.name.trim(),
      description:   form.description.trim(),
      icon:          form.icon,
      coinsRequired: form.coinsRequired,
      discount:      form.discount,
      type:          form.type,
      isGlobal:      form.isGlobal,
      isActive:      form.isActive,
    }
  },
}
