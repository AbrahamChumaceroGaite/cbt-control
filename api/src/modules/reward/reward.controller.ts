import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }  from '@nestjs/cqrs'
import { JwtAuthGuard }          from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }       from '../../common/decorators/response-message.decorator'
import { GetRewardsQuery }       from './application/queries/get-rewards.query'
import { CreateRewardCommand, CreateRewardDto } from './application/commands/create-reward.command'
import { UpdateRewardCommand, UpdateRewardDto } from './application/commands/update-reward.command'
import { DeleteRewardCommand }   from './application/commands/delete-reward.command'

@Controller('recompensas')
@UseGuards(JwtAuthGuard)
export class RewardController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  getAll() {
    return this.qb.execute(new GetRewardsQuery())
  }

  @Post()
  @HttpCode(201)
  @ResponseMessage('Recompensa creada')
  create(@Body() dto: CreateRewardDto) {
    return this.cb.execute(new CreateRewardCommand(dto))
  }

  @Put(':id')
  @ResponseMessage('Recompensa actualizada')
  update(@Param('id') id: string, @Body() dto: UpdateRewardDto) {
    return this.cb.execute(new UpdateRewardCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Recompensa eliminada')
  async delete(@Param('id') id: string) {
    await this.cb.execute(new DeleteRewardCommand(id))
  }
}
