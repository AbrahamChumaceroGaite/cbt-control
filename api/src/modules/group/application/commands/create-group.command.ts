import { ICommandHandler, CommandHandler }    from '@nestjs/cqrs'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { GroupRepository } from '../../domain/group.repository'
import { GroupMapper }     from '../group.mapper'
import type { GroupResponse } from '@control-aula/shared'

export class CreateGroupDto {
  @IsString()  @IsNotEmpty()    name!:        string
  @IsString()  @IsNotEmpty()    courseId!:    string
  @IsOptional() @IsArray()      studentIds?:  string[]
}

export class CreateGroupCommand {
  constructor(public readonly dto: CreateGroupDto) {}
}

@CommandHandler(CreateGroupCommand)
export class CreateGroupHandler implements ICommandHandler<CreateGroupCommand, GroupResponse> {
  constructor(private readonly repo: GroupRepository) {}

  async execute({ dto }: CreateGroupCommand): Promise<GroupResponse> {
    const group = await this.repo.create(dto)
    return GroupMapper.toResponse(group)
  }
}
