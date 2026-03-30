import { Body, Controller, Get, HttpCode, Post, UseGuards, UnauthorizedException } from '@nestjs/common'
import { CommandBus, QueryBus }        from '@nestjs/cqrs'
import { JwtAuthGuard }                from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }             from '../../common/decorators/response-message.decorator'
import { CurrentUser }                 from '../../common/decorators/current-user.decorator'
import type { SessionPayload }         from '../auth/domain/user.entity'
import { GetPortalStudentQuery }       from './application/queries/get-portal-student.query'
import { GetIndividualRewardsQuery }   from './application/queries/get-individual-rewards.query'
import { RequestRewardCommand, RequestRewardDto } from './application/commands/request-reward.command'

@Controller('portal')
@UseGuards(JwtAuthGuard)
export class PortalController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get('me')
  me(@CurrentUser() user: SessionPayload) {
    if (!user.studentId) throw new UnauthorizedException('No es estudiante')
    return this.qb.execute(new GetPortalStudentQuery(user.studentId))
  }

  @Get('recompensas')
  rewards(@CurrentUser() user: SessionPayload) {
    if (!user.studentId) throw new UnauthorizedException('No es estudiante')
    return this.qb.execute(new GetIndividualRewardsQuery(user.studentId))
  }

  @Post('solicitudes')
  @HttpCode(201)
  @ResponseMessage('Solicitud enviada')
  request(@CurrentUser() user: SessionPayload, @Body() dto: RequestRewardDto) {
    if (!user.studentId) throw new UnauthorizedException('No es estudiante')
    return this.cb.execute(new RequestRewardCommand(user.studentId, dto))
  }
}
