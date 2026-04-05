import { Module }       from '@nestjs/common'
import { ResetService } from './reset.service'
import { PrismaModule } from '../../infrastructure/prisma/prisma.module'

@Module({
  imports:   [PrismaModule],
  providers: [ResetService],
})
export class ResetModule {}
