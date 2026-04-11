import { Module }               from '@nestjs/common'
import { CqrsModule }            from '@nestjs/cqrs'
import { ActionController }      from './presentation/action.controller'
import { ActionRepository }      from './domain/action.repository'
import { ActionRepositoryImpl }  from './infrastructure/action.repository.impl'
import { GetActionsHandler }     from './application/queries/get-actions.handler'
import { CreateActionHandler }   from './application/commands/create-action.handler'
import { UpdateActionHandler }   from './application/commands/update-action.handler'
import { DeleteActionHandler }   from './application/commands/delete-action.handler'
import { AuthModule }            from '../auth/auth.module'

const handlers = [GetActionsHandler, CreateActionHandler, UpdateActionHandler, DeleteActionHandler]

@Module({
  imports:     [CqrsModule, AuthModule],
  controllers: [ActionController],
  providers:   [
    { provide: ActionRepository, useClass: ActionRepositoryImpl },
    ...handlers,
  ],
})
export class ActionModule {}
