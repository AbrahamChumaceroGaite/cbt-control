import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service'
import { BankRepository } from '../../domain/bank.repository'
import { NotificationService } from '../../../push/application/notification.service'
import type { CoinTransactionResponse } from '@control-aula/shared'
import { BankMapper } from '../bank.mapper'

const WEEKLY_LIMIT = 3
const TAX          = 1

export class CreateTransactionDto {
  @IsString() @IsNotEmpty() toStudentId!: string
  @IsNumber()  @Min(1)      amount!:      number
  @IsOptional() @IsString() notes?:       string
}

export class CreateTransactionCommand {
  constructor(
    public readonly fromStudentId: string,
    public readonly dto: CreateTransactionDto,
  ) {}
}

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand, CoinTransactionResponse> {
  constructor(
    private readonly repo:    BankRepository,
    private readonly prisma:  PrismaService,
    private readonly notify:  NotificationService,
  ) {}

  async execute({ fromStudentId, dto }: CreateTransactionCommand): Promise<CoinTransactionResponse> {
    const { toStudentId, amount, notes } = dto

    if (fromStudentId === toStudentId)
      throw new BadRequestException('No puedes enviarte coins a ti mismo')

    // Weekly limit check
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
    weekStart.setHours(0, 0, 0, 0)

    const usedThisWeek = await this.repo.countWeekly(fromStudentId, weekStart)
    if (usedThisWeek >= WEEKLY_LIMIT)
      throw new ForbiddenException(`Límite semanal alcanzado (${WEEKLY_LIMIT} transacciones por semana)`)

    const total = amount + TAX

    // Check sender has enough coins
    const sender = await this.prisma.student.findUnique({ where: { id: fromStudentId } })
    if (!sender) throw new BadRequestException('Estudiante no encontrado')
    if (sender.coins < total)
      throw new BadRequestException(`Coins insuficientes (necesitas ${total}, tienes ${sender.coins})`)

    const toStudent = await this.prisma.student.findUnique({ where: { id: toStudentId }, select: { id: true, name: true } })
    if (!toStudent) throw new BadRequestException('Destinatario no encontrado')

    // Atomic: deduct coins from sender + create transaction + log
    const [transaction] = await this.prisma.$transaction([
      this.prisma.coinTransaction.create({ data: { fromStudentId, toStudentId, amount, tax: TAX, notes: notes ?? '' } }),
      this.prisma.student.update({ where: { id: fromStudentId }, data: { coins: { decrement: total } } }),
      this.prisma.coinLog.create({
        data: {
          courseId:  sender.courseId,
          studentId: fromStudentId,
          coins:     -total,
          reason:    `Transacción pendiente → ${toStudent.name} (${amount} + ${TAX} impuesto)`,
        },
      }),
    ])

    // Notify admins (fire-and-forget)
    this.notify.notifyAdminsNewTransaction(fromStudentId, toStudentId, amount, transaction.id).catch(() => {})

    // Return with relations
    const full = await this.prisma.coinTransaction.findUnique({
      where:   { id: transaction.id },
      include: {
        fromStudent: { select: { id: true, name: true, course: { select: { name: true } } } },
        toStudent:   { select: { id: true, name: true, course: { select: { name: true } } } },
      },
    })

    return BankMapper.toResponse(full)
  }
}
