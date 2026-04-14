import { Global, Module }    from '@nestjs/common'
import { ConfigService }     from '@nestjs/config'
import Redis                 from 'ioredis'

export const REDIS_CLIENT = 'REDIS_CLIENT'

@Global()
@Module({
  providers: [
    {
      provide:    REDIS_CLIENT,
      inject:     [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const url = cfg.get<string>('REDIS_URL') ?? 'redis://localhost:6379'
        const client = new Redis(url, { lazyConnect: true, enableOfflineQueue: false })
        client.on('error', err => {
          // Log but do not crash — Redis is non-critical for app startup
          console.error('[Redis] connection error:', err.message)
        })
        return client
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
