import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usuariosService } from '../infrastructure/usuarios.service'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    USERS: {
      BASE:   '/api/usuarios',
      BY_ID:  (id: string) => `/api/usuarios/${id}`,
    },
    NOTIFICATIONS: {
      ADMIN: (id: string) => `/api/notificaciones/admin/${id}`,
    },
    BANK: {
      ADMIN_TXS: '/api/bank/admin/txs',
    },
  },
}))

import { api } from '@/lib/api'
const mockApi = vi.mocked(api)

beforeEach(() => { vi.clearAllMocks() })

const fakeUser = {
  id: 'u1', code: 'T001', fullName: 'María López', role: 'teacher',
  isActive: true, pushSubscriptionCount: 0, createdAt: '', student: null,
}

describe('usuariosService', () => {
  it('getAll calls GET /api/usuarios', async () => {
    mockApi.mockResolvedValueOnce({ data: [fakeUser], message: '' } as never)
    await usuariosService.getAll()
    expect(mockApi).toHaveBeenCalledWith('/api/usuarios')
  })

  it('create calls POST /api/usuarios with body', async () => {
    mockApi.mockResolvedValueOnce({ data: fakeUser, message: 'Creado' } as never)
    const body = { code: 'T002', password: 'pass', role: 'teacher' as const, fullName: 'Ana' }
    await usuariosService.create(body)
    expect(mockApi).toHaveBeenCalledWith('/api/usuarios', expect.objectContaining({
      method: 'POST',
      body:   JSON.stringify(body),
    }))
  })

  it('update calls PATCH /api/usuarios/:id with body', async () => {
    mockApi.mockResolvedValueOnce({ data: fakeUser, message: 'Actualizado' } as never)
    const body = { fullName: 'María', isActive: false }
    await usuariosService.update('u1', body)
    expect(mockApi).toHaveBeenCalledWith('/api/usuarios/u1', expect.objectContaining({
      method: 'PATCH',
      body:   JSON.stringify(body),
    }))
  })

  it('delete calls DELETE /api/usuarios/:id', async () => {
    mockApi.mockResolvedValueOnce({ data: null, message: 'Eliminado' } as never)
    await usuariosService.delete('u1')
    expect(mockApi).toHaveBeenCalledWith('/api/usuarios/u1', { method: 'DELETE' })
  })

  it('getUserInbox calls GET /api/notificaciones/admin/:id', async () => {
    mockApi.mockResolvedValueOnce({ data: { items: [], unreadCount: 0 }, message: '' } as never)
    await usuariosService.getUserInbox('u1')
    expect(mockApi).toHaveBeenCalledWith('/api/notificaciones/admin/u1')
  })

  it('getStudentTransactions calls GET bank admin txs with studentId', async () => {
    mockApi.mockResolvedValueOnce({ data: [], message: '' } as never)
    await usuariosService.getStudentTransactions('s1')
    expect(mockApi).toHaveBeenCalledWith('/api/bank/admin/txs?studentId=s1')
  })
})
