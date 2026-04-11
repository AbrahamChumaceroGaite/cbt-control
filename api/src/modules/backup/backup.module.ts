import { Module }           from '@nestjs/common'
import { BackupController } from './presentation/backup.controller'
import { BackupService }    from './application/backup.service'
import { AuthModule }       from '../auth/auth.module'
import { PrismaModule }     from '../../infrastructure/prisma/prisma.module'

@Module({
  imports:     [AuthModule, PrismaModule],
  controllers: [BackupController],
  providers:   [BackupService],
})
export class BackupModule {}
