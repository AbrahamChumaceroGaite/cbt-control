import { ICommandHandler, CommandHandler }    from '@nestjs/cqrs'
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'
import { ActionRepository } from '../../domain/action.repository'
import { ActionMapper }     from '../action.mapper'
import type { ActionResponse } from '@control-aula/shared'

export class UpdateActionDto {
  @IsOptional() @IsString()  name?:           string
  @IsOptional() @IsNumber()  coins?:          number
  @IsOptional() @IsString()  category?:       string
  @IsOptional() @IsBoolean() affectsClass?:   boolean
  @IsOptional() @IsBoolean() affectsStudent?: boolean
  @IsOptional() @IsBoolean() isActive?:       boolean
}

export class UpdateActionCommand {
  constructor(public readonly id: string, public readonly dto: UpdateActionDto) {}
}

@CommandHandler(UpdateActionCommand)
export class UpdateActionHandler implements ICommandHandler<UpdateActionCommand, ActionResponse> {
  constructor(private readonly repo: ActionRepository) {}

  async execute({ id, dto }: UpdateActionCommand): Promise<ActionResponse> {
    const action = await this.repo.update(id, dto)
    return ActionMapper.toResponse(action)
  }
}
