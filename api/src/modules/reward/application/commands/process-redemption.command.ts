import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { PrismaService }      from '../../../../infrastructure/prisma/prisma.service'
import { NotificationService } from '../../../push/application/notification.service'
import { SocketService }    from '../../../../infrastructure/socket/socket.service'

export class ProcessRedemptionDto {
  @IsString() @IsNotEmpty() @IsIn(['approved', 'rejected']) status!: string
  @IsOptional() @IsString() notes?: string
}

export class ProcessRedemptionCommand {
  constructor(public readonly id: string, public readonly dto: ProcessRedemptionDto) {}
}

@CommandHandler(ProcessRedemptionCommand)
export class ProcessRedemptionHandler implements ICommandHandler<ProcessRedemptionCommand> {
  constructor(
    private readonly prisma:         PrismaService,
    private readonly notifications:  NotificationService,
    private readonly realtime:       SocketService,
  ) {}

  async execute({ id, dto }: ProcessRedemptionCommand) {
    const request = await this.prisma.redemptionRequest.findUnique({
      where:   { id },
      include: { reward: true },
    })

    if (!request)                     throw new NotFoundException('Solicitud no encontrada')
    if (request.status !== 'pending') throw new ConflictException('Solicitud ya procesada')

    const result = await this.prisma.$transaction(async (tx) => {
      if (dto.status === 'approved') {
        const student = await tx.student.update({
          where: { id: request.studentId },
          data:  { coins: { decrement: request.reward.coinsRequired } },
        })
        await tx.studentRedemption.create({
          data: { studentId: request.studentId, rewardId: request.rewardId },
        })
        await tx.coinLog.create({
          data: {
            courseId:  student.courseId,
            studentId: request.studentId,
            coins:     -request.reward.coinsRequired,
            reason:    `Recompensa canjeada: ${request.reward.name}`,
          },
        })
      }

      return tx.redemptionRequest.update({
        where:   { id },
        data:    { status: dto.status, notes: dto.notes ?? '' },
        include: {
          student: { select: { name: true, coins: true, courseId: true } },
          reward:  { select: { name: true, icon: true } },
        },
      })
    })

    // Real-time: update student's solicitud status and coins instantly
    this.realtime.solicitudUpdated(result.studentId, { id: result.id, status: result.status })

    if (dto.status === 'approved') {
      this.realtime.coinsUpdated({
        courseId:     result.student.courseId,
        studentId:    result.studentId,
        studentCoins: result.student.coins,
      })
    }

    // Fire-and-forget: push + inbox notification to the student
    this.notifications
      .notifyRequestProcessed(result.studentId, result.reward.name, dto.status === 'approved')
      .catch(() => {})

    return result
  }
}
