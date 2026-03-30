import { Body, Controller, Delete, Get, HttpCode, Param, Patch, UseGuards } from '@nestjs/common'
import { CommandBus }        from '@nestjs/cqrs'
import { PrismaService }     from '../../infrastructure/prisma/prisma.service'
import { JwtAuthGuard }      from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }   from '../../common/decorators/response-message.decorator'
import { ProcessRedemptionCommand, ProcessRedemptionDto } from './application/commands/process-redemption.command'

@Controller('solicitudes')
@UseGuards(JwtAuthGuard)
export class SolicitudesController {
  constructor(private readonly prisma: PrismaService, private readonly cb: CommandBus) {}

  @Get()
  getAll() {
    return this.prisma.redemptionRequest.findMany({
      include: {
        student: { select: { id: true, name: true, coins: true, course: { select: { name: true } } } },
        reward:  { select: { name: true, icon: true, coinsRequired: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  @Patch(':id')
  @ResponseMessage('Solicitud procesada')
  process(@Param('id') id: string, @Body() dto: ProcessRedemptionDto) {
    return this.cb.execute(new ProcessRedemptionCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Solicitud eliminada')
  async remove(@Param('id') id: string) {
    await this.prisma.redemptionRequest.delete({ where: { id } })
  }
}
