import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common'
import { CommandBus }       from '@nestjs/cqrs'
import { PrismaService }    from '../../../infrastructure/prisma/prisma.service'
import { JwtAuthGuard }     from '../../../common/guards/jwt-auth.guard'
import { RolesGuard }       from '../../../common/guards/roles.guard'
import { Roles }            from '../../../common/decorators/roles.decorator'
import { ResponseMessage }  from '../../../common/decorators/response-message.decorator'
import { ROLES }            from '../../../common/constants'
import { ProcessRedemptionCommand } from '../application/commands/process-redemption.command'
import { ProcessRedemptionDto }     from '../application/commands/process-redemption.dto'

@Controller('solicitudes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SolicitudesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cb:     CommandBus,
  ) {}

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
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Solicitud procesada')
  process(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ProcessRedemptionDto) {
    return this.cb.execute(new ProcessRedemptionCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Solicitud eliminada')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.prisma.redemptionRequest.delete({ where: { id } })
  }
}
