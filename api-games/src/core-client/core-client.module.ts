import { Global, Module } from '@nestjs/common'
import { StudentClient }  from './student.client'
import { CoinsClient }    from './coins.client'

@Global()
@Module({
  providers: [StudentClient, CoinsClient],
  exports:   [StudentClient, CoinsClient],
})
export class CoreClientModule {}
