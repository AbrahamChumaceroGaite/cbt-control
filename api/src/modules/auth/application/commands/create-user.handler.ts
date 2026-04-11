import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import * as bcrypt                         from 'bcryptjs'
import { UserRepository }                  from '../../domain/user.repository'
import { UserMapper }                      from '../user.mapper'
import type { UserResponse }               from '@control-aula/shared'
import { CreateUserCommand }               from './create-user.command'

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, UserResponse> {
  constructor(private readonly repo: UserRepository) {}

  async execute({ dto }: CreateUserCommand): Promise<UserResponse> {
    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = await this.repo.create({ ...dto, passwordHash })
    return UserMapper.toResponse(user)
  }
}
