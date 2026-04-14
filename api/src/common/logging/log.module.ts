import { Global, Module } from '@nestjs/common'
import { LogService }     from './log.service'
import { RedisModule }    from '../../infrastructure/redis/redis.module'

@Global()
@Module({
  imports:   [RedisModule],
  providers: [LogService],
  exports:   [LogService],
})
export class LogModule {}
