import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'

const ALL_SECTIONS = ['courses', 'actions', 'rewards', 'coinLogs', 'solicitudes'] as const
export type BackupSection = typeof ALL_SECTIONS[number]

export interface RestoreDetails {
  [key: string]: { created: number; updated: number } | { created: number }
}

export interface RestoreResult {
  detected: string[]
  details:  RestoreDetails
}

@Injectable()
export class BackupService {
  readonly allSections = ALL_SECTIONS

  constructor(private readonly prisma: PrismaService) {}

  parseSections(param?: string): BackupSection[] {
    if (!param) return [...ALL_SECTIONS]
    return (param.split(',').map(s => s.trim()) as BackupSection[])
      .filter(s => (ALL_SECTIONS as readonly string[]).includes(s))
  }

  async export(sections: BackupSection[]): Promise<Record<string, unknown>> {
    const [courses, actions, rewards, coinLogs, redemptionRequests] = await Promise.all([
      sections.includes('courses')
        ? this.prisma.course.findMany({
            include: {
              students: { include: { tramos: true }, orderBy: { name: 'asc' } },
              groups:   { include: { members: true } },
            },
            orderBy: { name: 'asc' },
          })
        : undefined,
      sections.includes('actions')
        ? this.prisma.action.findMany({ orderBy: { name: 'asc' } })
        : undefined,
      sections.includes('rewards')
        ? this.prisma.reward.findMany({ orderBy: { name: 'asc' } })
        : undefined,
      sections.includes('coinLogs')
        ? this.prisma.coinLog.findMany({
            orderBy: { createdAt: 'desc' },
            take:    5000,
            include: {
              student: { select: { name: true, code: true } },
              action:  { select: { name: true, category: true } },
              course:  { select: { name: true } },
            },
          })
        : undefined,
      sections.includes('solicitudes')
        ? this.prisma.redemptionRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
              student: { select: { name: true, code: true } },
              reward:  { select: { name: true } },
            },
          })
        : undefined,
    ])

    const payload: Record<string, unknown> = {
      version:    1,
      exportedAt: new Date().toISOString(),
      sections,
    }
    if (courses !== undefined)            payload.courses            = courses
    if (actions !== undefined)            payload.actions            = actions
    if (rewards !== undefined)            payload.rewards            = rewards
    if (coinLogs !== undefined)           payload.coinLogs           = coinLogs
    if (redemptionRequests !== undefined) payload.redemptionRequests = redemptionRequests
    return payload
  }

  async restore(body: Record<string, unknown>): Promise<RestoreResult> {
    const detected: string[] = []
    if ((body.courses as unknown[])?.length)            detected.push('courses')
    if ((body.actions as unknown[])?.length)            detected.push('actions')
    if ((body.rewards as unknown[])?.length)            detected.push('rewards')
    if ((body.coinLogs as unknown[])?.length)           detected.push('coinLogs')
    if ((body.redemptionRequests as unknown[])?.length) detected.push('solicitudes')

    const details: RestoreDetails = {}

    if ((body.courses as unknown[])?.length)
      Object.assign(details, await this.#restoreCourses(body.courses as Record<string, unknown>[]))

    if ((body.actions as unknown[])?.length)
      details['actions'] = await this.#restoreActions(body.actions as Record<string, unknown>[])

    if ((body.rewards as unknown[])?.length)
      details['rewards'] = await this.#restoreRewards(body.rewards as Record<string, unknown>[])

    if ((body.coinLogs as unknown[])?.length)
      details['coinLogs'] = await this.#restoreCoinLogs(body.coinLogs as Record<string, unknown>[])

    if ((body.redemptionRequests as unknown[])?.length)
      details['solicitudes'] = await this.#restoreSolicitudes(body.redemptionRequests as Record<string, unknown>[])

    return { detected, details }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  async #restoreCourses(courses: Record<string, unknown>[]): Promise<RestoreDetails> {
    let cC = 0, cU = 0, sC = 0, sU = 0, gC = 0, gU = 0
    for (const c of courses) {
      const exists = await this.prisma.course.findUnique({ where: { id: c['id'] as string } })
      if (exists) {
        await this.prisma.course.update({
          where: { id: c['id'] as string },
          data:  { name: c['name'] as string, level: c['level'] as string, parallel: c['parallel'] as string },
        })
        cU++
      } else {
        await this.prisma.course.create({
          data: { id: c['id'] as string, name: c['name'] as string, level: c['level'] as string, parallel: c['parallel'] as string, classCoins: (c['classCoins'] as number) ?? 0 },
        })
        cC++
      }
      for (const s of ((c['students'] as unknown[]) ?? []) as Record<string, unknown>[]) {
        const es = await this.prisma.student.findUnique({ where: { id: s['id'] as string } })
        if (es) {
          await this.prisma.student.update({ where: { id: s['id'] as string }, data: { name: s['name'] as string, code: (s['code'] as string) ?? '', email: (s['email'] as string | null) ?? null } })
          sU++
        } else {
          await this.prisma.student.create({ data: { id: s['id'] as string, courseId: c['id'] as string, name: s['name'] as string, code: (s['code'] as string) ?? '', email: (s['email'] as string | null) ?? null, coins: (s['coins'] as number) ?? 0 } })
          sC++
        }
      }
      for (const g of ((c['groups'] as unknown[]) ?? []) as Record<string, unknown>[]) {
        const eg = await this.prisma.group.findUnique({ where: { id: g['id'] as string } })
        if (eg) { await this.prisma.group.update({ where: { id: g['id'] as string }, data: { name: g['name'] as string } }); gU++ }
        else     { await this.prisma.group.create({ data: { id: g['id'] as string, name: g['name'] as string, courseId: c['id'] as string } }); gC++ }
        for (const m of ((g['members'] as unknown[]) ?? []) as Record<string, unknown>[]) {
          await this.prisma.groupMember.upsert({
            where:  { groupId_studentId: { groupId: g['id'] as string, studentId: m['studentId'] as string } },
            update: {},
            create: { id: m['id'] as string, groupId: g['id'] as string, studentId: m['studentId'] as string, joinedAt: m['joinedAt'] ? new Date(m['joinedAt'] as string) : new Date() },
          })
        }
      }
    }
    return { courses: { created: cC, updated: cU }, students: { created: sC, updated: sU }, groups: { created: gC, updated: gU } }
  }

  async #restoreActions(actions: Record<string, unknown>[]): Promise<{ created: number; updated: number }> {
    let created = 0, updated = 0
    for (const a of actions) {
      const exists = await this.prisma.action.findUnique({ where: { id: a['id'] as string } })
      if (exists) {
        await this.prisma.action.update({ where: { id: a['id'] as string }, data: { name: a['name'] as string, coins: a['coins'] as number, category: a['category'] as string, affectsClass: a['affectsClass'] as boolean, affectsStudent: a['affectsStudent'] as boolean, isActive: a['isActive'] as boolean } })
        updated++
      } else {
        await this.prisma.action.create({ data: { id: a['id'] as string, name: a['name'] as string, coins: a['coins'] as number, category: a['category'] as string, affectsClass: a['affectsClass'] as boolean, affectsStudent: a['affectsStudent'] as boolean, isActive: (a['isActive'] as boolean) ?? true } })
        created++
      }
    }
    return { created, updated }
  }

  async #restoreRewards(rewards: Record<string, unknown>[]): Promise<{ created: number; updated: number }> {
    let created = 0, updated = 0
    for (const r of rewards) {
      const exists = await this.prisma.reward.findUnique({ where: { id: r['id'] as string } })
      if (exists) {
        await this.prisma.reward.update({ where: { id: r['id'] as string }, data: { name: r['name'] as string, description: (r['description'] as string) ?? '', icon: r['icon'] as string, coinsRequired: r['coinsRequired'] as number, type: r['type'] as string, isGlobal: r['isGlobal'] as boolean, isActive: r['isActive'] as boolean } })
        updated++
      } else {
        await this.prisma.reward.create({ data: { id: r['id'] as string, name: r['name'] as string, description: (r['description'] as string) ?? '', icon: r['icon'] as string, coinsRequired: r['coinsRequired'] as number, type: r['type'] as string, isGlobal: (r['isGlobal'] as boolean) ?? true, isActive: (r['isActive'] as boolean) ?? true } })
        created++
      }
    }
    return { created, updated }
  }

  async #restoreCoinLogs(coinLogs: Record<string, unknown>[]): Promise<{ created: number }> {
    let coinLogsCreated = 0
    for (const l of coinLogs) {
      const log = { id: l['id'] as string, courseId: l['courseId'] as string, studentId: (l['studentId'] as string | null) ?? null, actionId: (l['actionId'] as string | null) ?? null, coins: l['coins'] as number, reason: l['reason'] as string, createdAt: new Date(l['createdAt'] as string) }
      await this.prisma.coinLog.upsert({ where: { id: log.id }, create: log, update: {} })
      coinLogsCreated++
    }
    return { created: coinLogsCreated }
  }

  async #restoreSolicitudes(requests: Record<string, unknown>[]): Promise<{ created: number; updated: number }> {
    let created = 0, updated = 0
    for (const r of requests) {
      const exists = await this.prisma.redemptionRequest.findUnique({ where: { id: r['id'] as string } })
      if (exists) {
        await this.prisma.redemptionRequest.update({ where: { id: r['id'] as string }, data: { status: r['status'] as string, notes: (r['notes'] as string) ?? '' } })
        updated++
      } else {
        try {
          await this.prisma.redemptionRequest.create({ data: { id: r['id'] as string, studentId: r['studentId'] as string, rewardId: r['rewardId'] as string, status: r['status'] as string, notes: (r['notes'] as string) ?? '', createdAt: new Date(r['createdAt'] as string) } })
          created++
        } catch { /* skip if student/reward reference doesn't exist */ }
      }
    }
    return { created, updated }
  }
}
