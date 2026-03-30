import { ICommandHandler, CommandHandler }    from '@nestjs/cqrs'
import { IsArray, IsOptional, IsString }     from 'class-validator'
import { GroupRepository } from '../../domain/group.repository'
import { GroupMapper }     from '../group.mapper'
import type { GroupResponse } from '@control-aula/shared'

export class UpdateGroupDto {
  @IsOptional() @IsString() name?:       string
  @IsOptional() @IsArray()  studentIds?: string[]
}

export class UpdateGroupCommand {
  constructor(public readonly id: string, public readonly dto: UpdateGroupDto) {}
}

@CommandHandler(UpdateGroupCommand)
export class UpdateGroupHandler implements ICommandHandler<UpdateGroupCommand, GroupResponse> {
  constructor(private readonly repo: GroupRepository) {}

  async execute({ id, dto }: UpdateGroupCommand): Promise<GroupResponse> {
    const group = await this.repo.update(id, dto)
    return GroupMapper.toResponse(group)
  }
}
