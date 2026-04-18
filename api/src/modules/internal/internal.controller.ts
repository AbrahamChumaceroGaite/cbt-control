import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { InternalService }     from './internal.service'
import { InternalGuard }       from './guards/internal.guard'
import { GrantCoinsDto }       from './dto/grant-coins.dto'
import { SpendCoinsDto }       from './dto/spend-coins.dto'
import type { InternalCoinOpResponse, InternalStudentResponse } from '@control-aula/shared'

@UseGuards(InternalGuard)
@Controller('internal')
export class InternalController {
  constructor(private readonly service: InternalService) {}

  @Get('student/:id')
  getStudent(@Param('id') id: string): Promise<InternalStudentResponse> {
    return this.service.getStudent(id)
  }

  @Post('coins/grant')
  grantCoins(@Body() dto: GrantCoinsDto): Promise<InternalCoinOpResponse> {
    return this.service.grantCoins(dto)
  }

  @Post('coins/spend')
  spendCoins(@Body() dto: SpendCoinsDto): Promise<InternalCoinOpResponse> {
    return this.service.spendCoins(dto)
  }
}
