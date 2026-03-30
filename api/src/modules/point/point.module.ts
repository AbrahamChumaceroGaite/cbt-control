import { Module }               from '@nestjs/common'
import { CqrsModule }            from '@nestjs/cqrs'
import { PointController }       from './point.controller'
import { PointRepository }       from './domain/point.repository'
import { PointRepositoryImpl }   from './infrastructure/point.repository.impl'
import { AwardCoinsHandler }     from './application/commands/award-coins.command'

@Module({
  imports:     [CqrsModule],
  controllers: [PointController],
  providers:   [
    { provide: PointRepository, useClass: PointRepositoryImpl },
    AwardCoinsHandler,
  ],
})
export class PointModule {}
