import { Module }               from '@nestjs/common'
import { ConfigModule }         from '@nestjs/config'
import { APP_INTERCEPTOR }      from '@nestjs/core'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { PrismaModule }         from './infrastructure/prisma/prisma.module'
import { CoreClientModule }     from './core-client/core-client.module'
import { GameModule }           from './modules/game/game.module'
import { LevelModule }          from './modules/level/level.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CoreClientModule,
    GameModule,
    LevelModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
