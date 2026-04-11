import { CommandHandler, ICommandHandler }           from '@nestjs/cqrs'
import { BadRequestException, NotFoundException }   from '@nestjs/common'
import { PrismaService }                            from '../../../../infrastructure/prisma/prisma.service'
import { BankRepository }                           from '../../domain/bank.repository'
import { NotificationService }                      from '../../../push/application/notification.service'
import { SocketService }                            from '../../../../infrastructure/socket/socket.service'
import { BankMapper }                               from '../bank.mapper'
import type { CoinTransactionResponse }             from '@control-aula/shared'
import { ProcessTransactionCommand }                from './process-transaction.command'

@CommandHandler(ProcessTransactionCommand)
export class ProcessTransactionHandler implements ICommandHandler<ProcessTransactionCommand, CoinTransactionResponse> {
  constructor(
    private readonly repo:     BankRepository,
    private readonly prisma:   PrismaService,
    private readonly notify:   NotificationService,
    private readonly realtime: SocketService,
  ) {}

  async execute({ id, dto }: ProcessTransactionCommand): Promise<CoinTransactionResponse> {
    const tx = await this.prisma.coinTransaction.findUnique({
      where:   { id },
      include: {
        fromStudent: { select: { id: true, name: true, courseId: true } },
        toStudent:   { select: { id: true, name: true, courseId: true } },
      },
    })

    if (!tx) throw new NotFoundException('Transacción no encontrada')
    if (tx.status !== 'pending') throw new BadRequestException('Esta transacción ya fue procesada')

    const { fromStudent, toStudent, amount, tax } = tx

    if (dto.status === 'approved') {
      await this.prisma.$transaction([
        // Transfer amount to recipient
        this.prisma.student.update({ where: { id: toStudent.id }, data: { coins: { increment: amount } } }),
        // Log for recipient
        this.prisma.coinLog.create({
          data: {
            courseId:  toStudent.courseId,
            studentId: toStudent.id,
            coins:     amount,
            reason:    `Coins recibidos de ${fromStudent.name}`,
          },
        }),
        // Update transaction
        this.prisma.coinTransaction.update({ where: { id }, data: { status: 'approved', adminNotes: dto.adminNotes ?? '' } }),
      ])
    } else {
      // Refund amount + tax to sender
      const refund = amount + tax
      await this.prisma.$transaction([
        this.prisma.student.update({ where: { id: fromStudent.id }, data: { coins: { increment: refund } } }),
        this.prisma.coinLog.create({
          data: {
            courseId:  fromStudent.courseId,
            studentId: fromStudent.id,
            coins:     refund,
            reason:    `Reembolso — transacción rechazada (destinatario: ${toStudent.name})`,
          },
        }),
        this.prisma.coinTransaction.update({ where: { id }, data: { status: 'rejected', adminNotes: dto.adminNotes ?? '' } }),
      ])
    }

    // Real-time update
    this.realtime.transactionUpdated(fromStudent.id, toStudent.id, { id, status: dto.status })
    // Coins update for both
    const [senderCoins, recipientCoins] = await Promise.all([
      this.prisma.student.findUnique({ where: { id: fromStudent.id }, select: { coins: true, courseId: true } }),
      this.prisma.student.findUnique({ where: { id: toStudent.id   }, select: { coins: true, courseId: true } }),
    ])
    if (senderCoins)    this.realtime.coinsUpdated({ courseId: senderCoins.courseId,    studentId: fromStudent.id, studentCoins: senderCoins.coins })
    if (recipientCoins) this.realtime.coinsUpdated({ courseId: recipientCoins.courseId, studentId: toStudent.id,   studentCoins: recipientCoins.coins })

    // Notify students (fire-and-forget)
    this.notify.notifyTransactionProcessed(fromStudent.id, toStudent.id, amount, dto.status === 'approved').catch(() => {})

    const full = await this.prisma.coinTransaction.findUnique({
      where:   { id },
      include: {
        fromStudent: { select: { id: true, name: true, course: { select: { name: true } } } },
        toStudent:   { select: { id: true, name: true, course: { select: { name: true } } } },
      },
    })
    if (!full) throw new NotFoundException('Transacción no encontrada tras procesar')
    return BankMapper.toResponse(full)
  }
}
