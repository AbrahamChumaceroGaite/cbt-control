import { Module }               from '@nestjs/common'
import { CqrsModule }            from '@nestjs/cqrs'
import { ActionController }      from './action.controller'
import { ActionRepository }      from './domain/action.repository'
import { ActionRepositoryImpl }  from './infrastructure/action.repository.impl'
import { GetActionsHandler }     from './application/queries/get-actions.query'
import { CreateActionHandler }   from './application/commands/create-action.command'
import { UpdateActionHandler }   from './application/commands/update-action.command'
import { DeleteActionHandler }   from './application/commands/delete-action.command'

const handlers = [GetActionsHandler, CreateActionHandler, UpdateActionHandler, DeleteActionHandler]

@Module({
  imports:     [CqrsModule],
  controllers: [ActionController],
  providers:   [
    { provide: ActionRepository, useClass: ActionRepositoryImpl },
    ...handlers,
  ],
})
export class ActionModule {}
