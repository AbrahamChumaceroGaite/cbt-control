import { describe, it, expect } from 'vitest'
import { StudentMapper } from '../application/mapper'
import type { StudentResponse } from '@control-aula/shared'

const baseDto: StudentResponse = {
  id:      's1',
  name:    'Ana García',
  code:    'A001',
  email:   'ana@school.edu',
  coins:   120,
  courseId: 'c1',
  tramos:  [],
}

describe('StudentMapper', () => {
  describe('toViewModel()', () => {
    it('returns the DTO as-is', () => {
      const vm = StudentMapper.toViewModel(baseDto)
      expect(vm).toEqual(baseDto)
    })
  })

  describe('toForm()', () => {
    it('extracts editable fields from the ViewModel', () => {
      const form = StudentMapper.toForm(baseDto)
      expect(form.name).toBe('Ana García')
      expect(form.code).toBe('A001')
      expect(form.email).toBe('ana@school.edu')
      expect(form.coins).toBe(120)
    })

    it('defaults email to empty string when null', () => {
      const vm = { ...baseDto, email: null }
      const form = StudentMapper.toForm(vm)
      expect(form.email).toBe('')
    })

    it('does not include id or courseId on the form', () => {
      const form = StudentMapper.toForm(baseDto) as unknown as Record<string, unknown>
      expect(form['id']).toBeUndefined()
      expect(form['courseId']).toBeUndefined()
    })
  })

  describe('toCreateDto()', () => {
    it('trims name, code, email and includes courseId', () => {
      const dto = StudentMapper.toCreateDto(
        { name: '  Pedro  ', code: ' B002 ', email: ' pedro@school.edu ', coins: 0 },
        'c1',
      )
      expect(dto.name).toBe('Pedro')
      expect(dto.code).toBe('B002')
      expect(dto.email).toBe('pedro@school.edu')
      expect(dto.courseId).toBe('c1')
    })

    it('sets email to undefined when blank', () => {
      const dto = StudentMapper.toCreateDto(
        { name: 'Pedro', code: 'B002', email: '   ', coins: 0 },
        'c1',
      )
      expect(dto.email).toBeUndefined()
    })
  })

  describe('toUpdateDto()', () => {
    it('trims name, code, email and preserves coins', () => {
      const dto = StudentMapper.toUpdateDto(
        { name: '  Luis  ', code: ' C003 ', email: ' luis@school.edu ', coins: 75 },
      )
      expect(dto.name).toBe('Luis')
      expect(dto.code).toBe('C003')
      expect(dto.email).toBe('luis@school.edu')
      expect(dto.coins).toBe(75)
    })
  })
})
