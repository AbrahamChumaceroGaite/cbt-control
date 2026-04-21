import { Module }               from '@nestjs/common'
import { CqrsModule }           from '@nestjs/cqrs'
import { JwtModule }            from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { StorageModule }        from '../../infrastructure/storage/storage.module'
import { GameController }       from './presentation/game.controller'
import { GameRepositoryImpl }   from './infrastructure/game.repository.impl'
import { GAME_REPOSITORY }      from './domain/game.repository'
import { CreateGameHandler }    from './application/commands/create-game.handler'
import { UpdateGameHandler }    from './application/commands/update-game.handler'
import { GetAllGamesHandler }   from './application/queries/get-all-games.handler'
import { GetGameBySlugHandler } from './application/queries/get-game-by-slug.handler'
import { JwtAuthGuard }         from '../../common/guards/jwt-auth.guard'
import { RolesGuard }           from '../../common/guards/roles.guard'

const HANDLERS = [
  CreateGameHandler,
  UpdateGameHandler,
  GetAllGamesHandler,
  GetGameBySlugHandler,
]

@Module({
  imports: [
    CqrsModule,
    StorageModule,
    JwtModule.registerAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'secret',
      }),
    }),
  ],
  controllers: [GameController],
  providers: [
    ...HANDLERS,
    JwtAuthGuard,
    RolesGuard,
    { provide: GAME_REPOSITORY, useClass: GameRepositoryImpl },
  ],
})
export class GameModule {}
