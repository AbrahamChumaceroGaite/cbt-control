import 'reflect-metadata'
import { NestFactory }           from '@nestjs/core'
import { ValidationPipe }        from '@nestjs/common'
import { WsAdapter }             from '@nestjs/platform-ws'
import * as cookieParser         from 'cookie-parser'
import * as express              from 'express'
import { AppModule }             from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false })

  app.use(cookieParser())
  app.use(express.json({ limit: '20mb' }))
  app.use(express.urlencoded({ extended: true, limit: '20mb' }))
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3001', credentials: true })
  app.useWebSocketAdapter(new WsAdapter(app))

  await app.listen(process.env.PORT ?? 4001)
  console.log(`API running on port ${process.env.PORT ?? 4001}`)
}
bootstrap()
