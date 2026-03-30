import { Module }               from '@nestjs/common'
import { CqrsModule }            from '@nestjs/cqrs'
import { GroupController }       from './group.controller'
import { GroupRepository }       from './domain/group.repository'
import { GroupRepositoryImpl }   from './infrastructure/group.repository.impl'
import { GetGroupsHandler }      from './application/queries/get-groups.query'
import { CreateGroupHandler }    from './application/commands/create-group.command'
import { UpdateGroupHandler }    from './application/commands/update-group.command'
import { DeleteGroupHandler }    from './application/commands/delete-group.command'
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
