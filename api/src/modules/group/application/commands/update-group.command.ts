import type { UpdateGroupDto } from './update-group.dto'

export class UpdateGroupCommand {
  constructor(
    public readonly id:  string,
    public readonly dto: UpdateGroupDto,
  ) {}
}
