import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException }       from '@nestjs/common'
import { UpdateGameCommand }               from './update-game.command'
import { GameEntity }                      from '../../domain/game.entity'
import { GAME_REPOSITORY }                 from '../../domain/game.repository'
import type { GameRepository }             from '../../domain/game.repository'
import { GameMapper }                      from '../game.mapper'
import type { GameResponse }               from '@control-aula/shared'

@CommandHandler(UpdateGameCommand)
export class UpdateGameHandler implements ICommandHandler<UpdateGameCommand, GameResponse> {
  constructor(
    @Inject(GAME_REPOSITORY) private readonly repo: GameRepository,
  ) {}

  async execute({ id, dto }: UpdateGameCommand): Promise<GameResponse> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundException(`Game ${id} not found`)

    const updated = GameEntity.create({
      id:                existing.id,
      slug:              dto.slug              ?? existing.slug,
      title:             dto.title             ?? existing.title,
      description:       dto.description       ?? existing.description,
      coverUrl:          dto.coverUrl          ?? existing.coverUrl,
      iconEmoji:         dto.iconEmoji         ?? existing.iconEmoji,
      isActive:          dto.isActive          ?? existing.isActive,
      maxLevels:         dto.maxLevels         ?? existing.maxLevels,
      coinsPerLevelBase: dto.coinsPerLevelBase  ?? existing.coinsPerLevelBase,
      coinsPerLevelStep: dto.coinsPerLevelStep  ?? existing.coinsPerLevelStep,
      bonusCoins:        dto.bonusCoins         ?? existing.bonusCoins,
      continueCost:      dto.continueCost       ?? existing.continueCost,
      createdAt:         existing.createdAt,
    })

    return GameMapper.toResponse(await this.repo.update(updated))
  }
}
