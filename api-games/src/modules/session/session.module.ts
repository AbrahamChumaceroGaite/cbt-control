import { Module }                      from '@nestjs/common'
import { JwtModule }                   from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SessionController }           from './session.controller'
import { SessionService }              from './session.service'
import { JwtAuthGuard }                from '../../common/guards/jwt-auth.guard'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'secret',
      }),
    }),
  ],
  controllers: [SessionController],
  providers:   [SessionService, JwtAuthGuard],
})
export class SessionModule {}
