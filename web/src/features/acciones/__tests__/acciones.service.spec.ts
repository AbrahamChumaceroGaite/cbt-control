import { describe, it, expect, vi, beforeEach } from 'vitest'
import { accionesService } from '../infrastructure/acciones.service'
import { API_ROUTES }      from '@/config/routes'

// Mock lib/api so no real HTTP happens
vi.mock('@/lib/api', () => ({
  api: vi.fn(),
}))

import { api } from '@/lib/api'
const mockApi = vi.mocked(api)

const fakeAction = {
  id: 'x1', name: 'Test', coins: 2,
  category: 'blue', affectsClass: false, affectsStudent: true, isActive: true,
}

beforeEach(() => { vi.clearAllMocks() })

describe('accionesService', () => {
  describe('getAll()', () => {
    it('calls GET /api/acciones and returns the data array', async () => {
      mockApi.mockResolvedValueOnce({ data: [fakeAction], message: 'OK' })
      const result = await accionesService.getAll()
      expect(mockApi).toHaveBeenCalledWith(API_ROUTES.ACTIONS.BASE)
      expect(result).toEqual([fakeAction])
    })
  })

  describe('create()', () => {
    it('calls POST /api/acciones with JSON body', async () => {
      const input = { name: 'Nueva', coins: 3, category: 'green', affectsClass: true, affectsStudent: false, isActive: true }
      mockApi.mockResolvedValueOnce({ data: fakeAction, message: 'Creada' })
      const result = await accionesService.create(input)
      expect(mockApi).toHaveBeenCalledWith(
        API_ROUTES.ACTIONS.BASE,
        expect.objectContaining({ method: 'POST', body: JSON.stringify(input) }),
      )
      expect(result.message).toBe('Creada')
    })
  })

  describe('update()', () => {
    it('calls PUT /api/acciones/:id with the correct id', async () => {
      const input = { name: 'Edit', coins: 5, category: 'red', affectsClass: false, affectsStudent: true, isActive: true }
      mockApi.mockResolvedValueOnce({ data: fakeAction, message: 'Actualizada' })
      await accionesService.update('x1', input)
      expect(mockApi).toHaveBeenCalledWith(
        API_ROUTES.ACTIONS.BY_ID('x1'),
        expect.objectContaining({ method: 'PUT' }),
      )
    })
  })

  describe('delete()', () => {
    it('calls DELETE /api/acciones/:id', async () => {
      mockApi.mockResolvedValueOnce({ data: null, message: 'Eliminada' })
      await accionesService.delete('x1')
      expect(mockApi).toHaveBeenCalledWith(
        API_ROUTES.ACTIONS.BY_ID('x1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })
  })
})
