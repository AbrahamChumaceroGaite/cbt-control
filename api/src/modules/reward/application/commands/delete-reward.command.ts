import { IsUUID } from 'class-validator'

export class DeleteRewardCommand {
  @IsUUID('4')
  readonly id: string

  constructor(id: string) {
    this.id = id
  }
}
