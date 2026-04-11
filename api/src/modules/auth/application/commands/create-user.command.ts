import { CreateUserDto } from './create-user.dto'

export class CreateUserCommand {
  constructor(public readonly dto: CreateUserDto) {}
}
