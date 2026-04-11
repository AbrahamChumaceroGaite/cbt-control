import { describe, it, expect } from 'vitest'
import { UserMapper } from '../application/mapper'
import type { UserDetailResponse } from '@control-aula/shared'

const baseDto: UserDetailResponse = {
  id:                   'u1',
  code:                 'T001',
  fullName:             'María López',
  role:                 'admin',
  isActive:             true,
  pushSubscriptionCount: 2,
  notificationCount:    0,
  createdAt:            '2024-01-01T00:00:00.000Z',
  student:              null,
}

describe('UserMapper', () => {
  describe('toViewModel()', () => {
    it('uses fullName as displayName when student is absent', () => {
      const vm = UserMapper.toViewModel(baseDto)
      expect(vm.displayName).toBe('María López')
    })

    it('uses student name as displayName when student is present', () => {
      const vm = UserMapper.toViewModel({
        ...baseDto,
        role: 'student',
        fullName: '',
        student: { id: 's1', name: 'Pedro Pérez', course: { name: 'Matemáticas' } },
      })
      expect(vm.displayName).toBe('Pedro Pérez')
    })

    it('falls back to code when both fullName and student.name are empty', () => {
      const vm = UserMapper.toViewModel({ ...baseDto, fullName: '' })
      expect(vm.displayName).toBe('T001')
    })

    it('derives initial from first character of displayName (uppercased)', () => {
      const vm = UserMapper.toViewModel(baseDto)
      expect(vm.initial).toBe('M')
    })

    it('sets hasPush to true when pushSubscriptionCount > 0', () => {
      const vm = UserMapper.toViewModel(baseDto)
      expect(vm.hasPush).toBe(true)
    })

    it('sets hasPush to false when pushSubscriptionCount is 0', () => {
      const vm = UserMapper.toViewModel({ ...baseDto, pushSubscriptionCount: 0 })
      expect(vm.hasPush).toBe(false)
    })
  })

  describe('toUpdateForm()', () => {
    it('seeds fullName and isActive; password is always empty', () => {
      const vm = UserMapper.toViewModel(baseDto)
      const form = UserMapper.toUpdateForm(vm)
      expect(form.fullName).toBe('María López')
      expect(form.isActive).toBe(true)
      expect(form.password).toBe('')
    })
  })

  describe('toCreateDto()', () => {
    it('trims code and fullName', () => {
      const dto = UserMapper.toCreateDto({
        code: '  T002  ', password: 'secret', role: 'teacher', fullName: '  Ana Torres  ',
      })
      expect(dto.code).toBe('T002')
      expect(dto.fullName).toBe('Ana Torres')
      expect(dto.password).toBe('secret')
      expect(dto.role).toBe('teacher')
    })
  })

  describe('toUpdateBody()', () => {
    it('omits password when empty', () => {
      const body = UserMapper.toUpdateBody({ fullName: 'Ana', isActive: true, password: '' })
      expect(body.password).toBeUndefined()
    })

    it('includes password when provided', () => {
      const body = UserMapper.toUpdateBody({ fullName: 'Ana', isActive: true, password: 'newpass' })
      expect(body.password).toBe('newpass')
    })
  })
})
