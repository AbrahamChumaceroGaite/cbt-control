import { IsUUID } from 'class-validator'

export class DeleteGroupCommand {
  @IsUUID('4')
  readonly id: string

  constructor(id: string) {
    this.id = id
  }
}
