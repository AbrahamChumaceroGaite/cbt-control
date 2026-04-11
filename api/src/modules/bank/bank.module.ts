import { Module }                      from '@nestjs/common'
import { CqrsModule }                   from '@nestjs/cqrs'
import { PrismaModule }                 from '../../infrastructure/prisma/prisma.module'
import { AuthModule }                   from '../auth/auth.module'
import { PushModule }                   from '../push/push.module'
import { BankController }               from './presentation/bank.controller'
import { BankAdminController }          from './presentation/bank-admin.controller'
import { BankRepository }               from './domain/bank.repository'
import { BankRepositoryImpl }           from './infrastructure/bank.repository.impl'
import { CreateTransactionHandler }     from './application/commands/create-transaction.handler'
import { ProcessTransactionHandler }    from './application/commands/process-transaction.handler'
import { GetMyTransactionsHandler }     from './application/queries/get-my-transactions.handler'
import { GetAllTransactionsHandler }    from './application/queries/get-all-transactions.handler'
import { GetWeeklyStatusHandler }       from './application/queries/get-weekly-status.handler'
import { SearchStudentsHandler }        from './application/queries/search-students.handler'
import { GetCoursesHandler }            from './application/queries/get-courses.handler'

const HANDLERS = [
  CreateTransactionHandler,
  ProcessTransactionHandler,
  GetMyTransactionsHandler,
  GetAllTransactionsHandler,
  GetWeeklyStatusHandler,
  SearchStudentsHandler,
  GetCoursesHandler,
]

@Module({
  imports:     [CqrsModule, PrismaModule, AuthModule, PushModule],
  controllers: [BankController, BankAdminController],
  providers:   [
    { provide: BankRepository, useClass: BankRepositoryImpl },
    ...HANDLERS,
  ],
})
export class BankModule {}
