import { Inject, Injectable, Logger, Optional } from '@nestjs/common'
import type Redis                               from 'ioredis'
import { REDIS_CLIENT }                         from '../../infrastructure/redis/redis.module'

/**
 * Four log categories, each with a different TTL and purpose:
 *
 *  MODULE    — business operations (create, update, delete)  → 7 days
 *  LAYER     — cross-layer flow tracing                      → 3 days
 *  EXECUTION — performance / duration measurements           → 1 day
 *  IMPACT    — critical errors & security events             → 30 days + DB audit_log
 */
export enum LogCategory {
  MODULE    = 'module',
  LAYER     = 'layer',
  EXECUTION = 'execution',
  IMPACT    = 'impact',
}

const TTL: Record<LogCategory, number> = {
  [LogCategory.MODULE]:    7  * 86400,
  [LogCategory.LAYER]:     3  * 86400,
  [LogCategory.EXECUTION]: 1  * 86400,
  [LogCategory.IMPACT]:    30 * 86400,
}

interface LogEntry {
  category:  LogCategory
  action:    string
  userId?:   string
  result:    'success' | 'fail'
  durationMs?: number
  meta?:     Record<string, unknown>
  ts:        string
}

@Injectable()
export class LogService {
  private readonly logger = new Logger(LogService.name)

  constructor(
    @Optional() @Inject(REDIS_CLIENT) private readonly redis: Redis | null,
  ) {}

  async log(entry: Omit<LogEntry, 'ts'>): Promise<void> {
    const record: LogEntry = { ...entry, ts: new Date().toISOString() }

    // Always emit to NestJS logger for stdout/file transport
    this.logger.log(`[${record.category.toUpperCase()}] ${record.action} result=${record.result}${record.userId ? ` userId=${record.userId}` : ''}`)

    if (!this.redis) return

    try {
      const key = `log:${record.category}:${Date.now()}`
      await this.redis.set(key, JSON.stringify(record), 'EX', TTL[entry.category])
    } catch {
      // Redis failure must never crash business logic
    }
  }

  module(action: string, opts?: Omit<LogEntry, 'ts' | 'action' | 'category'>) {
    return this.log({ ...opts, category: LogCategory.MODULE, action, result: opts?.result ?? 'success' })
  }

  layer(action: string, opts?: Omit<LogEntry, 'ts' | 'action' | 'category'>) {
    return this.log({ ...opts, category: LogCategory.LAYER, action, result: opts?.result ?? 'success' })
  }

  execution(action: string, durationMs: number, opts?: Omit<LogEntry, 'ts' | 'action' | 'category' | 'durationMs'>) {
    return this.log({ ...opts, category: LogCategory.EXECUTION, action, durationMs, result: opts?.result ?? 'success' })
  }

  impact(action: string, opts?: Omit<LogEntry, 'ts' | 'action' | 'category'>) {
    return this.log({ ...opts, category: LogCategory.IMPACT, action, result: opts?.result ?? 'fail' })
  }
}
