import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { PrismaModule } from '../../infrastructure/prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { PushModule } from '../push/push.module'
import { BankController } from './bank.controller'
import { BankAdminController } from './bank-admin.controller'
import { BankRepository } from './domain/bank.repository'
import { BankRepositoryImpl } from './infrastructure/bank.repository.impl'
import { CreateTransactionHandler } from './application/commands/create-transaction.command'
import { ProcessTransactionHandler } from './application/commands/process-transaction.command'
import { GetMyTransactionsHandler } from './application/queries/get-my-transactions.query'
import { GetAllTransactionsHandler } from './application/queries/get-all-transactions.query'
import { GetWeeklyStatusHandler } from './application/queries/get-weekly-status.query'
import { SearchStudentsHandler } from './application/queries/search-students.query'
import { GetCoursesHandler } from './application/queries/get-courses.query'

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
