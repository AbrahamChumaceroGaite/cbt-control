import { ICommandHandler, CommandHandler }    from '@nestjs/cqrs'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { ActionRepository } from '../../domain/action.repository'
import { ActionMapper }     from '../action.mapper'
import type { ActionResponse } from '@control-aula/shared'

export class CreateActionDto {
  @IsString()  @IsNotEmpty()  name!:              string
  @IsNumber()                 coins!:              number
  @IsOptional() @IsString()   category?:           string
  @IsOptional() @IsBoolean()  affectsClass?:       boolean
  @IsOptional() @IsBoolean()  affectsStudent?:     boolean
}

export class CreateActionCommand {
  constructor(public readonly dto: CreateActionDto) {}
}

@CommandHandler(CreateActionCommand)
export class CreateActionHandler implements ICommandHandler<CreateActionCommand, ActionResponse> {
  constructor(private readonly repo: ActionRepository) {}

  async execute({ dto }: CreateActionCommand): Promise<ActionResponse> {
    const action = await this.repo.create(dto)
    return ActionMapper.toResponse(action)
  }
}
