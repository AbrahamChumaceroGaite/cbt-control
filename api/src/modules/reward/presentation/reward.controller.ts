import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard }         from '../../../common/guards/jwt-auth.guard'
import { RolesGuard }           from '../../../common/guards/roles.guard'
import { Roles }                from '../../../common/decorators/roles.decorator'
import { ResponseMessage }      from '../../../common/decorators/response-message.decorator'
import { ROLES }                from '../../../common/constants'
import { GetRewardsQuery }      from '../application/queries/get-rewards.query'
import { CreateRewardCommand }  from '../application/commands/create-reward.command'
import { CreateRewardDto }      from '../application/commands/create-reward.dto'
import { UpdateRewardCommand }  from '../application/commands/update-reward.command'
import { UpdateRewardDto }      from '../application/commands/update-reward.dto'
import { DeleteRewardCommand }  from '../application/commands/delete-reward.command'

@Controller('recompensas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RewardController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  getAll() {
    return this.qb.execute(new GetRewardsQuery())
  }

  @Post()
  @HttpCode(201)
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Recompensa creada')
  create(@Body() dto: CreateRewardDto) {
    return this.cb.execute(new CreateRewardCommand(dto))
  }

  @Put(':id')
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Recompensa actualizada')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRewardDto) {
    return this.cb.execute(new UpdateRewardCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Recompensa eliminada')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.cb.execute(new DeleteRewardCommand(id))
  }
}
