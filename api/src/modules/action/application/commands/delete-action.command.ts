import { IsUUID } from 'class-validator'

export class DeleteActionCommand {
  @IsUUID('4')
  readonly id: string

  constructor(id: string) {
    this.id = id
  }
}
