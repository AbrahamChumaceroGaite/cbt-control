import { Global, Module } from '@nestjs/common'
import { SocketService } from './socket.service'
import { WsGateway }    from './ws.gateway'
import { AuthModule }   from '../../modules/auth/auth.module'

@Global()
@Module({
  imports:   [AuthModule],
  providers: [SocketService, WsGateway],
  exports:   [SocketService],
})
export class SocketModule {}
