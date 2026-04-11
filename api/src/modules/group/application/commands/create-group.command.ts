import type { CreateGroupDto } from './create-group.dto'

export class CreateGroupCommand {
  constructor(public readonly dto: CreateGroupDto) {}
}
