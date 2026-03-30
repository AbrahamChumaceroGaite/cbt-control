import { Module }           from '@nestjs/common'
import { BackupController } from './backup.controller'
import { AuthModule }       from '../auth/auth.module'

@Module({
  imports:     [AuthModule],
  controllers: [BackupController],
})
export class BackupModule {}
