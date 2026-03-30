import { Module }               from '@nestjs/common'
import { CqrsModule }            from '@nestjs/cqrs'
import { JwtModule }             from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthController, UserController } from './auth.controller'
import { UserRepository }        from './domain/user.repository'
import { UserRepositoryImpl }    from './infrastructure/user.repository.impl'
import { LoginHandler }          from './application/commands/login.command'
import { CreateUserHandler }     from './application/commands/create-user.command'
import { GetUsersHandler }       from './application/queries/get-users.query'
import { JwtAuthGuard }          from '../../common/guards/jwt-auth.guard'

const handlers = [LoginHandler, CreateUserHandler, GetUsersHandler]

@Module({
  imports: [
    CqrsModule,
    JwtModule.registerAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret:      cfg.get<string>('JWT_SECRET') ?? 'cbt-dev-secret-change-in-prod',
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [AuthController, UserController],
  providers:   [
    { provide: UserRepository, useClass: UserRepositoryImpl },
    JwtAuthGuard,
    ...handlers,
  ],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
