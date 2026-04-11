import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { GroupResponse }  from '@control-aula/shared'
import { GroupRepository }     from '../../domain/group.repository'
import { GroupMapper }         from '../group.mapper'
import { UpdateGroupCommand }  from './update-group.command'

@CommandHandler(UpdateGroupCommand)
export class UpdateGroupHandler implements ICommandHandler<UpdateGroupCommand, GroupResponse> {
  constructor(private readonly repo: GroupRepository) {}

  async execute({ id, dto }: UpdateGroupCommand): Promise<GroupResponse> {
    const group = await this.repo.update(id, dto)
    return GroupMapper.toResponse(group)
  }
}
