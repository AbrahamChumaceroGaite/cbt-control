import { describe, it, expect } from 'vitest'
import { ActionMapper } from '../application/mapper'
import type { ActionResponse } from '@control-aula/shared'
import type { ActionViewModel, ActionFormState } from '../domain/types'

const baseDto: ActionResponse = {
  id:             'a1b2c3',
  name:           'Participación',
  coins:          3,
  category:       'blue',
  affectsClass:   false,
  affectsStudent: true,
  isActive:       true,
}

describe('ActionMapper', () => {
  describe('toViewModel()', () => {
    it('copies all ActionResponse fields onto the ViewModel', () => {
      const vm = ActionMapper.toViewModel(baseDto)
      expect(vm.id).toBe('a1b2c3')
      expect(vm.name).toBe('Participación')
      expect(vm.coins).toBe(3)
      expect(vm.category).toBe('blue')
      expect(vm.affectsClass).toBe(false)
      expect(vm.affectsStudent).toBe(true)
      expect(vm.isActive).toBe(true)
    })

    it('attaches colorConfig for a known category', () => {
      const vm = ActionMapper.toViewModel(baseDto)
      expect(vm.colorConfig).toBeDefined()
      expect(typeof vm.colorConfig.bg).toBe('string')
      expect(typeof vm.colorConfig.text).toBe('string')
    })

    it('falls back to default colorConfig for an unknown category', () => {
      const dto = { ...baseDto, category: 'unknown_cat' }
      const vm  = ActionMapper.toViewModel(dto)
      expect(vm.colorConfig.bg).toBe('#1e3a8a')
      expect(vm.colorConfig.text).toBe('#bfdbfe')
    })
  })

  describe('toForm()', () => {
    it('returns a FormState with all editable fields from the ViewModel', () => {
      const vm: ActionViewModel = {
        ...baseDto,
        colorConfig: { bg: '#1e3a8a', text: '#bfdbfe' },
      }
      const form = ActionMapper.toForm(vm)
      expect(form.name).toBe('Participación')
      expect(form.coins).toBe(3)
      expect(form.category).toBe('blue')
      expect(form.affectsClass).toBe(false)
      expect(form.affectsStudent).toBe(true)
      expect(form.isActive).toBe(true)
    })

    it('does not include id or colorConfig on the FormState', () => {
      const vm: ActionViewModel = {
        ...baseDto,
        colorConfig: { bg: '#1e3a8a', text: '#bfdbfe' },
      }
      const form = ActionMapper.toForm(vm) as unknown as Record<string, unknown>
      expect(form['id']).toBeUndefined()
      expect(form['colorConfig']).toBeUndefined()
    })
  })

  describe('toDto()', () => {
    it('trims the name before sending to the API', () => {
      const form: ActionFormState = {
        name:           '  Tarea  ',
        coins:          5,
        category:       'red',
        affectsClass:   true,
        affectsStudent: false,
        isActive:       false,
      }
      const dto = ActionMapper.toDto(form)
      expect(dto.name).toBe('Tarea')
    })

    it('preserves all other fields as-is', () => {
      const form: ActionFormState = {
        name:           'Obra',
        coins:          10,
        category:       'amber',
        affectsClass:   true,
        affectsStudent: true,
        isActive:       true,
      }
      const dto = ActionMapper.toDto(form)
      expect(dto.coins).toBe(10)
      expect(dto.category).toBe('amber')
      expect(dto.affectsClass).toBe(true)
      expect(dto.affectsStudent).toBe(true)
      expect(dto.isActive).toBe(true)
    })
  })
})
