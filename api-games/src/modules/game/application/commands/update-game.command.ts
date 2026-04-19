import type { UpdateGameDto } from '../dtos/update-game.dto'

export class UpdateGameCommand {
  constructor(readonly id: string, readonly dto: UpdateGameDto) {}
}
