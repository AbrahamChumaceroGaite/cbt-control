import { Module }         from '@nestjs/common'
import { AppController }  from './app.controller'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { ConfigModule }   from '@nestjs/config'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { PrismaModule }   from './infrastructure/prisma/prisma.module'
import { CourseModule } from './modules/course/course.module'
import { StudentModule }from './modules/student/student.module'
import { ActionModule } from './modules/action/action.module'
import { RewardModule } from './modules/reward/reward.module'
import { GroupModule }  from './modules/group/group.module'
import { PointModule }  from './modules/point/point.module'
import { AuthModule }   from './modules/auth/auth.module'
import { PortalModule }  from './modules/portal/portal.module'
import { BackupModule }  from './modules/backup/backup.module'

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CourseModule,
    StudentModule,
    ActionModule,
    RewardModule,
    GroupModule,
    PointModule,
    AuthModule,
    PortalModule,
    BackupModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
