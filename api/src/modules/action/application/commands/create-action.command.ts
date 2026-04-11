import type { CreateActionDto } from './create-action.dto'

export class CreateActionCommand {
  constructor(public readonly dto: CreateActionDto) {}
}
