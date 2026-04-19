import { Module }              from '@nestjs/common'
import { CqrsModule }          from '@nestjs/cqrs'
import { LevelController }     from './presentation/level.controller'
import { LevelRepositoryImpl } from './infrastructure/level.repository.impl'
import { LEVEL_REPOSITORY }    from './domain/level.repository'
import { GetLevelsHandler }    from './application/queries/get-levels.handler'

@Module({
  imports:     [CqrsModule],
  controllers: [LevelController],
  providers: [
    GetLevelsHandler,
    { provide: LEVEL_REPOSITORY, useClass: LevelRepositoryImpl },
  ],
})
export class LevelModule {}
