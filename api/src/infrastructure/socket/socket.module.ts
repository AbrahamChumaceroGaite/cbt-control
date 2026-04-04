import { Global, Module } from '@nestjs/common'
import { SocketService }  from './socket.service'
import { AppGateway }     from './app.gateway'
import { AuthModule }     from '../../modules/auth/auth.module'
import { PrismaModule }   from '../prisma/prisma.module'

@Global()
@Module({
  imports:   [AuthModule, PrismaModule],
  providers: [SocketService, AppGateway],
  exports:   [SocketService],
})
export class SocketModule {}
