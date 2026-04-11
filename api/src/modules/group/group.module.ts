import { Module }               from '@nestjs/common'
import { CqrsModule }            from '@nestjs/cqrs'
import { GroupController }       from './presentation/group.controller'
import { GroupRepository }       from './domain/group.repository'
import { GroupRepositoryImpl }   from './infrastructure/group.repository.impl'
import { GetGroupsHandler }      from './application/queries/get-groups.handler'
import { CreateGroupHandler }    from './application/commands/create-group.handler'
import { UpdateGroupHandler }    from './application/commands/update-group.handler'
import { DeleteGroupHandler }    from './application/commands/delete-group.handler'
import { AuthModule }            from '../auth/auth.module'

const handlers = [GetGroupsHandler, CreateGroupHandler, UpdateGroupHandler, DeleteGroupHandler]

@Module({
  imports:     [CqrsModule, AuthModule],
  controllers: [GroupController],
  providers:   [
    { provide: GroupRepository, useClass: GroupRepositoryImpl },
    ...handlers,
  ],
})
export class GroupModule {}
