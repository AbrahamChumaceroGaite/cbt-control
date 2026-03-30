import { ICommandHandler, CommandHandler }    from '@nestjs/cqrs'
import { IsNotEmpty, IsOptional, IsString }  from 'class-validator'
import * as bcrypt                           from 'bcryptjs'
import { UserRepository }                    from '../../domain/user.repository'
import { UserMapper }                        from '../user.mapper'
import type { UserResponse }                 from '@control-aula/shared'

export class CreateUserDto {
  @IsString() @IsNotEmpty() code!:       string
  @IsString() @IsNotEmpty() password!:   string
  @IsString() @IsNotEmpty() role!:       string
  @IsOptional() @IsString() studentId?:  string
  @IsOptional() @IsString() fullName?:   string
}

export class CreateUserCommand {
  constructor(public readonly dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, UserResponse> {
  constructor(private readonly repo: UserRepository) {}

  async execute({ dto }: CreateUserCommand): Promise<UserResponse> {
    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = await this.repo.create({ ...dto, passwordHash })
    return UserMapper.toResponse(user)
  }
}
