import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LogService, LogCategory } from '../log.service'

const mockRedis = {
  set: vi.fn().mockResolvedValue('OK'),
}

function makeService(redis: unknown = mockRedis) {
  return new LogService(redis as never)
}

beforeEach(() => vi.clearAllMocks())

describe('LogService', () => {
  describe('module()', () => {
    it('calls redis.set with module category and 7-day TTL', async () => {
      const svc = makeService()
      await svc.module('user.create', { userId: 'u1', result: 'success' })

      expect(mockRedis.set).toHaveBeenCalledTimes(1)
      const [key, value, , ttl] = mockRedis.set.mock.calls[0] as [string, string, string, number]
      expect(key).toMatch(/^log:module:/)
      expect(ttl).toBe(7 * 86400)

      const parsed = JSON.parse(value) as { category: string; action: string; result: string }
      expect(parsed.category).toBe(LogCategory.MODULE)
      expect(parsed.action).toBe('user.create')
      expect(parsed.result).toBe('success')
    })
  })

  describe('layer()', () => {
    it('calls redis.set with layer category and 3-day TTL', async () => {
      const svc = makeService()
      await svc.layer('handler.invoke')

      const [, , , ttl] = mockRedis.set.mock.calls[0] as [string, string, string, number]
      expect(ttl).toBe(3 * 86400)
      const parsed = JSON.parse(mockRedis.set.mock.calls[0][1] as string) as { category: string }
      expect(parsed.category).toBe(LogCategory.LAYER)
    })
  })

  describe('execution()', () => {
    it('calls redis.set with execution category and 1-day TTL', async () => {
      const svc = makeService()
      await svc.execution('db.query', 42)

      const [, value, , ttl] = mockRedis.set.mock.calls[0] as [string, string, string, number]
      expect(ttl).toBe(1 * 86400)
      const parsed = JSON.parse(value) as { category: string; durationMs: number }
      expect(parsed.category).toBe(LogCategory.EXECUTION)
      expect(parsed.durationMs).toBe(42)
    })
  })

  describe('impact()', () => {
    it('calls redis.set with impact category and 30-day TTL', async () => {
      const svc = makeService()
      await svc.impact('auth.login', { userId: 'u1', result: 'fail' })

      const [, value, , ttl] = mockRedis.set.mock.calls[0] as [string, string, string, number]
      expect(ttl).toBe(30 * 86400)
      const parsed = JSON.parse(value) as { category: string; result: string }
      expect(parsed.category).toBe(LogCategory.IMPACT)
      expect(parsed.result).toBe('fail')
    })

    it('defaults result to "fail" when not specified', async () => {
      const svc = makeService()
      await svc.impact('auth.login')

      const parsed = JSON.parse(mockRedis.set.mock.calls[0][1] as string) as { result: string }
      expect(parsed.result).toBe('fail')
    })
  })

  describe('Redis failure graceful degradation', () => {
    it('does not throw when redis.set rejects', async () => {
      const failingRedis = { set: vi.fn().mockRejectedValue(new Error('Redis down')) }
      const svc = makeService(failingRedis)
      await expect(svc.module('any.action')).resolves.not.toThrow()
    })

    it('does not throw when redis is null', async () => {
      const svc = makeService(null)
      await expect(svc.module('any.action')).resolves.not.toThrow()
    })

    it('skips redis.set when redis is null', async () => {
      const svc = makeService(null)
      await svc.module('any.action')
      expect(mockRedis.set).not.toHaveBeenCalled()
    })
  })
})
