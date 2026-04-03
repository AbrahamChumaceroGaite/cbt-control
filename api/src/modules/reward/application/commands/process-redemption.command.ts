import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { PrismaService }      from '../../../../infrastructure/prisma/prisma.service'
import { NotificationService } from '../../../push/application/notification.service'

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
          student: { select: { name: true, coins: true } },
          reward:  { select: { name: true, icon: true } },
        },
      })
    })

    // Fire-and-forget push notification
    this.notifications
      .notifyRequestProcessed(result.studentId, result.reward.name, dto.status === 'approved')
      .catch(() => {})

    return result
  }
}
