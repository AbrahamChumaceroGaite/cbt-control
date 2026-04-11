import { Body, Controller, Get, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }       from '@nestjs/cqrs'
import { JwtAuthGuard }               from '../../../common/guards/jwt-auth.guard'
import { CurrentUser }                from '../../../common/decorators/current-user.decorator'
import type { SessionPayload }        from '@control-aula/shared'
import { CreateTransactionCommand }   from '../application/commands/create-transaction.command'
import { CreateTransactionDto }       from '../application/commands/create-transaction.dto'
import { GetMyTransactionsQuery }     from '../application/queries/get-my-transactions.query'
import { GetWeeklyStatusQuery }       from '../application/queries/get-weekly-status.query'
import { SearchStudentsQuery }        from '../application/queries/search-students.query'
import { GetCoursesQuery }            from '../application/queries/get-courses.query'

@Controller('bank')
@UseGuards(JwtAuthGuard)
export class BankController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries:  QueryBus,
  ) {}

  private requireStudent(user: SessionPayload): string {
    if (!user.studentId) throw new UnauthorizedException()
    return user.studentId
  }

  @Get('status')
  getStatus(@CurrentUser() user: SessionPayload) {
    return this.queries.execute(new GetWeeklyStatusQuery(this.requireStudent(user)))
  }

  @Get('transactions')
  getMyTransactions(@CurrentUser() user: SessionPayload) {
    return this.queries.execute(new GetMyTransactionsQuery(this.requireStudent(user)))
  }

  @Get('courses')
  getCourses() {
    return this.queries.execute(new GetCoursesQuery())
  }

  @Get('search')
  searchStudents(
    @Query('q') q: string,
    @Query('courseId') courseId: string | undefined,
    @CurrentUser() user: SessionPayload,
  ) {
    return this.queries.execute(new SearchStudentsQuery(q ?? '', this.requireStudent(user), courseId))
  }

  @Post('transactions')
  createTransaction(@Body() dto: CreateTransactionDto, @CurrentUser() user: SessionPayload) {
    return this.commands.execute(new CreateTransactionCommand(this.requireStudent(user), dto))
  }
}
