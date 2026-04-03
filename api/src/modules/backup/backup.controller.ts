import { Body, Controller, Get, HttpCode, Post, Query, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { JwtAuthGuard }  from '../../common/guards/jwt-auth.guard'

const ALL_SECTIONS = ['courses', 'actions', 'rewards', 'coinLogs', 'solicitudes'] as const
type Section = typeof ALL_SECTIONS[number]

@Controller('backup')
@UseGuards(JwtAuthGuard)
export class BackupController {
  constructor(private readonly prisma: PrismaService) {}

  // ── Export ────────────────────────────────────────────────────────────────

  @Get()
  async download(
    @Res() res: Response,
    @Query('sections') sectionsParam?: string,
  ) {
    const sections: Section[] = sectionsParam
      ? (sectionsParam.split(',').map(s => s.trim()) as Section[]).filter(s => ALL_SECTIONS.includes(s))
      : [...ALL_SECTIONS]

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
            take: 5000,
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

    const date = new Date().toISOString().split('T')[0]
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="backup-cbt-${date}.json"`)
    res.send(JSON.stringify(payload, null, 2))
  }

  // ── Import / Restore ─────────────────────────────────────────────────────

  @Post('restore')
  @HttpCode(200)
  async restore(@Body() body: Record<string, any>) {
    const detected: string[] = []
    if (body.courses?.length)            detected.push('courses')
    if (body.actions?.length)            detected.push('actions')
    if (body.rewards?.length)            detected.push('rewards')
    if (body.coinLogs?.length)           detected.push('coinLogs')
    if (body.redemptionRequests?.length) detected.push('solicitudes')

    const details: Record<string, { created: number; updated: number } | { created: number }> = {}

    // ── 1. Cursos → Alumnos → Grupos (en orden por dependencias FK) ────────
    if (body.courses?.length) {
      let cC = 0, cU = 0, sC = 0, sU = 0, gC = 0, gU = 0

      for (const c of body.courses as any[]) {
        const existsCourse = await this.prisma.course.findUnique({ where: { id: c.id } })
        if (existsCourse) {
          await this.prisma.course.update({
            where: { id: c.id },
            // classCoins no se sobreescribe — preserva el progreso actual del juego
            data: { name: c.name, level: c.level, parallel: c.parallel },
          })
          cU++
        } else {
          await this.prisma.course.create({
            data: { id: c.id, name: c.name, level: c.level, parallel: c.parallel, classCoins: c.classCoins ?? 0 },
          })
          cC++
        }

        for (const s of (c.students ?? []) as any[]) {
          const existsStudent = await this.prisma.student.findUnique({ where: { id: s.id } })
          if (existsStudent) {
            await this.prisma.student.update({
              where: { id: s.id },
              // coins no se sobreescribe — preserva el progreso actual
              data: { name: s.name, code: s.code ?? '', email: s.email ?? null },
            })
            sU++
          } else {
            await this.prisma.student.create({
              data: { id: s.id, courseId: c.id, name: s.name, code: s.code ?? '', email: s.email ?? null, coins: s.coins ?? 0 },
            })
            sC++
          }
        }

        for (const g of (c.groups ?? []) as any[]) {
          const existsGroup = await this.prisma.group.findUnique({ where: { id: g.id } })
          if (existsGroup) {
            await this.prisma.group.update({ where: { id: g.id }, data: { name: g.name } })
            gU++
          } else {
            await this.prisma.group.create({ data: { id: g.id, name: g.name, courseId: c.id } })
            gC++
          }

          for (const m of (g.members ?? []) as any[]) {
            await this.prisma.groupMember.upsert({
              where:  { groupId_studentId: { groupId: g.id, studentId: m.studentId } },
              update: {},
              create: {
                id:        m.id,
                groupId:   g.id,
                studentId: m.studentId,
                joinedAt:  m.joinedAt ? new Date(m.joinedAt) : new Date(),
              },
            })
          }
        }
      }

      details.courses  = { created: cC, updated: cU }
      details.students = { created: sC, updated: sU }
      details.groups   = { created: gC, updated: gU }
    }

    // ── 2. Acciones ────────────────────────────────────────────────────────
    if (body.actions?.length) {
      let created = 0, updated = 0
      for (const a of body.actions as any[]) {
        const exists = await this.prisma.action.findUnique({ where: { id: a.id } })
        if (exists) {
          await this.prisma.action.update({
            where: { id: a.id },
            data:  { name: a.name, coins: a.coins, category: a.category, affectsClass: a.affectsClass, affectsStudent: a.affectsStudent, isActive: a.isActive },
          })
          updated++
        } else {
          await this.prisma.action.create({
            data: { id: a.id, name: a.name, coins: a.coins, category: a.category, affectsClass: a.affectsClass, affectsStudent: a.affectsStudent, isActive: a.isActive ?? true },
          })
          created++
        }
      }
      details.actions = { created, updated }
    }

    // ── 3. Premios ────────────────────────────────────────────────────────
    if (body.rewards?.length) {
      let created = 0, updated = 0
      for (const r of body.rewards as any[]) {
        const exists = await this.prisma.reward.findUnique({ where: { id: r.id } })
        if (exists) {
          await this.prisma.reward.update({
            where: { id: r.id },
            data:  { name: r.name, description: r.description ?? '', icon: r.icon, coinsRequired: r.coinsRequired, type: r.type, isGlobal: r.isGlobal, isActive: r.isActive },
          })
          updated++
        } else {
          await this.prisma.reward.create({
            data: { id: r.id, name: r.name, description: r.description ?? '', icon: r.icon, coinsRequired: r.coinsRequired, type: r.type, isGlobal: r.isGlobal ?? true, isActive: r.isActive ?? true },
          })
          created++
        }
      }
      details.rewards = { created, updated }
    }

    // ── 4. Historial de Coins (solo inserta nuevos, nunca sobreescribe) ───
    if (body.coinLogs?.length) {
      const logs = (body.coinLogs as any[]).map(l => ({
        id:        l.id,
        courseId:  l.courseId,
        studentId: l.studentId ?? null,
        actionId:  l.actionId  ?? null,
        coins:     l.coins,
        reason:    l.reason,
        createdAt: new Date(l.createdAt),
      }))
      // SQLite does not support createMany skipDuplicates — upsert with empty update preserves history
      let coinLogsCreated = 0
      for (const log of logs) {
        const result = await this.prisma.coinLog.upsert({
          where:  { id: log.id },
          create: log,
          update: {},
        })
        if (result.id === log.id) coinLogsCreated++
      }
      details.coinLogs = { created: coinLogsCreated }
    }

    // ── 5. Solicitudes de Canje ───────────────────────────────────────────
    if (body.redemptionRequests?.length) {
      let created = 0, updated = 0
      for (const r of body.redemptionRequests as any[]) {
        const exists = await this.prisma.redemptionRequest.findUnique({ where: { id: r.id } })
        if (exists) {
          await this.prisma.redemptionRequest.update({
            where: { id: r.id },
            data:  { status: r.status, notes: r.notes ?? '' },
          })
          updated++
        } else {
          try {
            await this.prisma.redemptionRequest.create({
              data: { id: r.id, studentId: r.studentId, rewardId: r.rewardId, status: r.status, notes: r.notes ?? '', createdAt: new Date(r.createdAt) },
            })
            created++
          } catch { /* omite si el student/reward referenciado no existe */ }
        }
      }
      details.solicitudes = { created, updated }
    }

    return { detected, details }
  }
}
