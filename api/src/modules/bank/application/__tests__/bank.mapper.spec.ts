import { describe, it, expect } from 'vitest'
import { BankMapper } from '../bank.mapper'
import type { TransactionWithRelations } from '../../domain/transaction.entity'

const fakeEntity: TransactionWithRelations = {
  id:          'tx1',
  fromStudent: { id: 's1', name: 'Ana',   course: { name: 'Matemáticas' } },
  toStudent:   { id: 's2', name: 'Pedro', course: { name: 'Ciencias' } },
  amount:      50,
  tax:         1,
  status:      'pending',
  notes:       'Regalo',
  adminNotes:  '',
  createdAt:   new Date('2024-01-15T10:00:00.000Z'),
}

describe('BankMapper', () => {
  describe('toResponse()', () => {
    it('maps all scalar fields correctly', () => {
      const vm = BankMapper.toResponse(fakeEntity)
      expect(vm.id).toBe('tx1')
      expect(vm.amount).toBe(50)
      expect(vm.tax).toBe(1)
      expect(vm.status).toBe('pending')
      expect(vm.notes).toBe('Regalo')
      expect(vm.adminNotes).toBe('')
    })

    it('maps fromStudent with courseName from nested course', () => {
      const vm = BankMapper.toResponse(fakeEntity)
      expect(vm.fromStudent).toEqual({ id: 's1', name: 'Ana', courseName: 'Matemáticas' })
    })

    it('maps toStudent with courseName from nested course', () => {
      const vm = BankMapper.toResponse(fakeEntity)
      expect(vm.toStudent).toEqual({ id: 's2', name: 'Pedro', courseName: 'Ciencias' })
    })

    it('converts Date to ISO string', () => {
      const vm = BankMapper.toResponse(fakeEntity)
      expect(vm.createdAt).toBe('2024-01-15T10:00:00.000Z')
    })

    it('passes through string createdAt unchanged', () => {
      const entity = { ...fakeEntity, createdAt: '2024-01-15T10:00:00.000Z' }
      const vm = BankMapper.toResponse(entity)
      expect(vm.createdAt).toBe('2024-01-15T10:00:00.000Z')
    })

    it('falls back to empty string when course is null', () => {
      const entity = {
        ...fakeEntity,
        fromStudent: { id: 's1', name: 'Ana', course: null },
      }
      const vm = BankMapper.toResponse(entity)
      expect(vm.fromStudent.courseName).toBe('')
    })
  })
})
