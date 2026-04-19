import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject }                          from '@nestjs/common'
import { CreateGameCommand }               from './create-game.command'
import { GameEntity }                      from '../../domain/game.entity'
import { GAME_REPOSITORY }                 from '../../domain/game.repository'
import type { GameRepository }             from '../../domain/game.repository'
import { GameMapper }                      from '../game.mapper'
import type { GameResponse }               from '@control-aula/shared'

@CommandHandler(CreateGameCommand)
export class CreateGameHandler implements ICommandHandler<CreateGameCommand, GameResponse> {
  constructor(
    @Inject(GAME_REPOSITORY) private readonly repo: GameRepository,
  ) {}

  async execute({ dto }: CreateGameCommand): Promise<GameResponse> {
    const entity = GameEntity.create(dto)
    return GameMapper.toResponse(await this.repo.create(entity))
  }
}
