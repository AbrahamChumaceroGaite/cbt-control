import { describe, it, expect } from 'vitest'
import { RewardMapper } from '../application/mapper'
import type { RewardResponse } from '@control-aula/shared'

const baseDto: RewardResponse = {
  id:            'r1',
  name:          'Libro de Oro',
  description:   'Premio especial',
  icon:          '📖',
  coinsRequired: 200,
  discount:      0,
  type:          'individual',
  isGlobal:      false,
  isActive:      true,
}

describe('RewardMapper', () => {
  describe('toViewModel()', () => {
    it('sets finalPrice equal to coinsRequired when discount is 0', () => {
      const vm = RewardMapper.toViewModel(baseDto)
      expect(vm.finalPrice).toBe(200)
    })

    it('calculates discounted finalPrice correctly', () => {
      const vm = RewardMapper.toViewModel({ ...baseDto, coinsRequired: 200, discount: 25 })
      expect(vm.finalPrice).toBe(150) // 200 * (1 - 0.25)
    })

    it('ensures finalPrice is at least 1 for large discounts', () => {
      const vm = RewardMapper.toViewModel({ ...baseDto, coinsRequired: 1, discount: 99 })
      expect(vm.finalPrice).toBeGreaterThanOrEqual(1)
    })

    it('handles null discount as 0', () => {
      const vm = RewardMapper.toViewModel({ ...baseDto, discount: null as unknown as number })
      expect(vm.finalPrice).toBe(200)
    })
  })

  describe('toForm()', () => {
    it('extracts all editable fields', () => {
      const vm = RewardMapper.toViewModel(baseDto)
      const form = RewardMapper.toForm(vm)
      expect(form.name).toBe('Libro de Oro')
      expect(form.description).toBe('Premio especial')
      expect(form.icon).toBe('📖')
      expect(form.coinsRequired).toBe(200)
      expect(form.discount).toBe(0)
      expect(form.type).toBe('individual')
      expect(form.isGlobal).toBe(false)
      expect(form.isActive).toBe(true)
    })

    it('maps class type with isGlobal true', () => {
      const vm = RewardMapper.toViewModel({ ...baseDto, type: 'class', isGlobal: true })
      const form = RewardMapper.toForm(vm)
      expect(form.type).toBe('class')
      expect(form.isGlobal).toBe(true)
    })

    it('does not include id or finalPrice on the form', () => {
      const vm = RewardMapper.toViewModel(baseDto)
      const form = RewardMapper.toForm(vm) as unknown as Record<string, unknown>
      expect(form['id']).toBeUndefined()
      expect(form['finalPrice']).toBeUndefined()
    })
  })

  describe('toDto()', () => {
    it('trims name and description', () => {
      const vm = RewardMapper.toViewModel(baseDto)
      const dto = RewardMapper.toDto({
        ...RewardMapper.toForm(vm),
        name:        '  Libro  ',
        description: '  Premio  ',
      })
      expect(dto.name).toBe('Libro')
      expect(dto.description).toBe('Premio')
    })

    it('preserves boolean flags and numeric fields', () => {
      const vm = RewardMapper.toViewModel(baseDto)
      const dto = RewardMapper.toDto(RewardMapper.toForm(vm))
      expect(dto.coinsRequired).toBe(200)
      expect(dto.discount).toBe(0)
      expect(dto.isGlobal).toBe(false)
      expect(dto.isActive).toBe(true)
    })
  })
})
