import { describe, it, expect } from 'vitest'
import { CourseMapper } from '../application/mapper'
import type { CourseResponse } from '@control-aula/shared'

const baseDto: CourseResponse = {
  id:         'c1',
  name:       'Matemáticas',
  level:      'Secondary 2',
  parallel:   'A',
  classCoins: 150,
}

describe('CourseMapper', () => {
  describe('toViewModel()', () => {
    it('returns the DTO as-is (no computed fields)', () => {
      const vm = CourseMapper.toViewModel(baseDto)
      expect(vm).toEqual(baseDto)
    })
  })

  describe('toForm()', () => {
    it('extracts editable fields from the ViewModel', () => {
      const form = CourseMapper.toForm(baseDto)
      expect(form.name).toBe('Matemáticas')
      expect(form.level).toBe('Secondary 2')
      expect(form.parallel).toBe('A')
      expect(form.classCoins).toBe(150)
    })

    it('does not include id on the form', () => {
      const form = CourseMapper.toForm(baseDto) as unknown as Record<string, unknown>
      expect(form['id']).toBeUndefined()
    })
  })

  describe('toDto()', () => {
    it('trims name, level, and parallel', () => {
      const dto = CourseMapper.toDto({
        name:       '  Física  ',
        level:      ' Secondary 3 ',
        parallel:   ' B ',
        classCoins: 0,
      })
      expect(dto.name).toBe('Física')
      expect(dto.level).toBe('Secondary 3')
      expect(dto.parallel).toBe('B')
    })

    it('preserves classCoins as a number', () => {
      const dto = CourseMapper.toDto({ name: 'X', level: 'Y', parallel: 'Z', classCoins: 200 })
      expect(dto.classCoins).toBe(200)
    })
  })
})
