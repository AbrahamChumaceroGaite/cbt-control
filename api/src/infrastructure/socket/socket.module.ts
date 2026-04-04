import { Global, Module } from '@nestjs/common'
import { SocketService }  from './socket.service'
import { SseController }  from './sse.controller'
import { AuthModule }     from '../../modules/auth/auth.module'

@Global()
@Module({
  imports:     [AuthModule],
  providers:   [SocketService],
  controllers: [SseController],
  exports:     [SocketService],
})
export class SocketModule {}
