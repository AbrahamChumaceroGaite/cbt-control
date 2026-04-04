import { Global, Module } from '@nestjs/common'
import { SocketService }  from './socket.service'
import { AppGateway }     from './app.gateway'
import { AuthModule }     from '../../modules/auth/auth.module'

@Global()
@Module({
  imports:   [AuthModule],
  providers: [SocketService, AppGateway],
  exports:   [SocketService],
})
export class SocketModule {}
