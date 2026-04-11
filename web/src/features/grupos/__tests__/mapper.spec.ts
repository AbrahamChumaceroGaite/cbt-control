import { describe, it, expect } from 'vitest'
import { GroupMapper } from '../application/mapper'
import type { GroupResponse } from '@control-aula/shared'

const baseDto: GroupResponse = {
  id:       'g1',
  name:     'Equipo A',
  courseId: 'c1',
  members:  [
    { id: 'gm1', studentId: 's1', student: { id: 's1', name: 'Ana', coins: 100 } },
    { id: 'gm2', studentId: 's2', student: { id: 's2', name: 'Pedro', coins: 80 } },
  ],
}

describe('GroupMapper', () => {
  describe('toViewModel()', () => {
    it('returns the DTO as-is', () => {
      const vm = GroupMapper.toViewModel(baseDto)
      expect(vm).toEqual(baseDto)
    })
  })

  describe('toForm()', () => {
    it('extracts name and member studentIds', () => {
      const form = GroupMapper.toForm(baseDto)
      expect(form.name).toBe('Equipo A')
      expect(form.studentIds).toEqual(['s1', 's2'])
    })

    it('returns empty studentIds for a group with no members', () => {
      const form = GroupMapper.toForm({ ...baseDto, members: [] })
      expect(form.studentIds).toEqual([])
    })
  })

  describe('toDto()', () => {
    it('trims name and includes courseId', () => {
      const dto = GroupMapper.toDto(
        { name: '  Equipo B  ', studentIds: ['s3', 's4'] },
        'c2',
      )
      expect(dto.name).toBe('Equipo B')
      expect(dto.studentIds).toEqual(['s3', 's4'])
      expect(dto.courseId).toBe('c2')
    })
  })
})
