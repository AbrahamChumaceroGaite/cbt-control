import type { ActionResponse } from '@control-aula/shared'

export type ActionCategory = 'green' | 'blue' | 'purple' | 'amber' | 'mag' | 'red'
export type StatusFilter    = 'all' | 'active' | 'inactive'
export type ScopeFilter     = 'all' | 'class' | 'student'

export interface ActionViewModel extends ActionResponse {
  colorConfig: { bg: string; text: string }
}

export interface ActionFormState {
  name:           string
  coins:          number
  category:       string
  affectsClass:   boolean
  affectsStudent: boolean
  isActive:       boolean
}

export interface ActionFilters {
  category: string
  status:   StatusFilter
  scope:    ScopeFilter
}

export const EMPTY_FORM: ActionFormState = {
  name:           '',
  coins:          2,
  category:       'blue',
  affectsClass:   false,
  affectsStudent: true,
  isActive:       true,
}

export const EMPTY_FILTERS: ActionFilters = {
  category: 'all',
  status:   'all',
  scope:    'all',
}

export const ACTION_CATEGORIES = [
  { value: 'green',  label: 'Verde — positivo'    },
  { value: 'blue',   label: 'Azul — colaboración' },
  { value: 'purple', label: 'Morado — maestría'   },
  { value: 'amber',  label: 'Ámbar — entregas'    },
  { value: 'mag',    label: 'Magenta — especial'  },
  { value: 'red',    label: 'Rojo — negativo'     },
] as const
