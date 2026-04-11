import type { UpdateActionDto } from './update-action.dto'

export class UpdateActionCommand {
  constructor(
    public readonly id:  string,
    public readonly dto: UpdateActionDto,
  ) {}
}
