import { Module }               from '@nestjs/common'
import { ConfigModule }         from '@nestjs/config'
import { APP_INTERCEPTOR }      from '@nestjs/core'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { PrismaModule }         from './infrastructure/prisma/prisma.module'
import { StorageModule }        from './infrastructure/storage/storage.module'
import { CoreClientModule }     from './core-client/core-client.module'
import { GameModule }           from './modules/game/game.module'
import { LevelModule }          from './modules/level/level.module'
import { SessionModule }        from './modules/session/session.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    CoreClientModule,
    GameModule,
    LevelModule,
    SessionModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
