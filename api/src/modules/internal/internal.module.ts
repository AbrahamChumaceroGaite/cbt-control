import { Module }             from '@nestjs/common'
import { InternalController } from './internal.controller'
import { InternalService }    from './internal.service'
import { InternalGuard }      from './guards/internal.guard'

@Module({
  controllers: [InternalController],
  providers:   [InternalService, InternalGuard],
})
export class InternalModule {}
