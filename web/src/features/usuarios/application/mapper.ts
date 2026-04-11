import type { UserDetailResponse } from '@control-aula/shared'
import type { UserViewModel, UserCreateForm, UserUpdateForm } from '../domain/types'

export const UserMapper = {
  /** Enriches a DTO with display helpers. */
  toViewModel(dto: UserDetailResponse): UserViewModel {
    const displayName = dto.student?.name || dto.fullName || dto.code
    return {
      ...dto,
      displayName,
      initial: displayName.trim().charAt(0).toUpperCase(),
      hasPush: dto.pushSubscriptionCount > 0,
    }
  },

  /** Seeds the update form from a view model. */
  toUpdateForm(vm: UserViewModel): UserUpdateForm {
    return { fullName: vm.fullName, password: '', isActive: vm.isActive }
  },

  /** Builds the create request payload from the create form. */
  toCreateDto(form: UserCreateForm) {
    return {
      code:     form.code.trim(),
      password: form.password,
      role:     form.role,
      fullName: form.fullName.trim(),
    }
  },

  /** Builds the update request body; omits password when empty. */
  toUpdateBody(form: UserUpdateForm): { fullName: string; isActive: boolean; password?: string } {
    const body: { fullName: string; isActive: boolean; password?: string } = {
      fullName: form.fullName.trim(),
      isActive: form.isActive,
    }
    if (form.password) body.password = form.password
    return body
  },
}
