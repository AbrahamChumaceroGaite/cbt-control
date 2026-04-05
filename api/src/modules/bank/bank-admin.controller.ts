import { Body, Controller, ForbiddenException, Get, Param, Patch, Query, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { SessionPayload } from '@control-aula/shared'
import { ProcessTransactionCommand, ProcessTransactionDto } from './application/commands/process-transaction.command'
import { GetAllTransactionsQuery } from './application/queries/get-all-transactions.query'

@Controller('bank/admin')
@UseGuards(JwtAuthGuard)
export class BankAdminController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries:  QueryBus,
  ) {}

  private requireAdmin(user: SessionPayload): void {
    if (user.role !== 'admin') throw new ForbiddenException()
  }

  @Get('transactions')
  getAllTransactions(@Query('status') status: string | undefined, @CurrentUser() user: SessionPayload) {
    this.requireAdmin(user)
    return this.queries.execute(new GetAllTransactionsQuery(status))
  }

  @Patch('transactions/:id')
  processTransaction(
    @Param('id') id: string,
    @Body() dto: ProcessTransactionDto,
    @CurrentUser() user: SessionPayload,
  ) {
    this.requireAdmin(user)
    return this.commands.execute(new ProcessTransactionCommand(id, dto))
  }
}
