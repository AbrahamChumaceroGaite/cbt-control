import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { GroupResponse }  from '@control-aula/shared'
import { GroupRepository }     from '../../domain/group.repository'
import { GroupMapper }         from '../group.mapper'
import { CreateGroupCommand }  from './create-group.command'

@CommandHandler(CreateGroupCommand)
export class CreateGroupHandler implements ICommandHandler<CreateGroupCommand, GroupResponse> {
  constructor(private readonly repo: GroupRepository) {}

  async execute({ dto }: CreateGroupCommand): Promise<GroupResponse> {
    const group = await this.repo.create(dto)
    return GroupMapper.toResponse(group)
  }
}
