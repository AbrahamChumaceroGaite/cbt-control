import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }          from '@nestjs/cqrs'
import { JwtAuthGuard }                  from '../../../common/guards/jwt-auth.guard'
import { RolesGuard }                    from '../../../common/guards/roles.guard'
import { Roles }                         from '../../../common/decorators/roles.decorator'
import { ROLES }                         from '../../../common/constants'
import { ProcessTransactionCommand }     from '../application/commands/process-transaction.command'
import { ProcessTransactionDto }         from '../application/commands/process-transaction.dto'
import { GetAllTransactionsQuery }       from '../application/queries/get-all-transactions.query'

@Controller('bank/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
export class BankAdminController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries:  QueryBus,
  ) {}

  @Get('transactions')
  getAllTransactions(
    @Query('status') status: string | undefined,
    @Query('studentId') studentId: string | undefined,
  ) {
    return this.queries.execute(new GetAllTransactionsQuery(status, studentId))
  }

  @Patch('transactions/:id')
  processTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProcessTransactionDto,
  ) {
    return this.commands.execute(new ProcessTransactionCommand(id, dto))
  }
}
