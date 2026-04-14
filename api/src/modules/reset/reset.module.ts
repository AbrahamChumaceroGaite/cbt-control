import { Module }       from '@nestjs/common'
import { ResetService } from './reset.service'
import { PrismaModule } from '../../infrastructure/prisma/prisma.module'
import { BackupModule } from '../backup/backup.module'

@Module({
  imports:   [PrismaModule, BackupModule],
  providers: [ResetService],
})
export class ResetModule {}
