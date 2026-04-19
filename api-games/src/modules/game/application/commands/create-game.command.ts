import type { CreateGameDto } from '../dtos/create-game.dto'

export class CreateGameCommand {
  constructor(readonly dto: CreateGameDto) {}
}
