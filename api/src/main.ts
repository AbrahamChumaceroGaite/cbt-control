import 'reflect-metadata'
import { NestFactory }           from '@nestjs/core'
import { ValidationPipe }        from '@nestjs/common'
import * as cookieParser         from 'cookie-parser'
import { AppModule }             from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3001', credentials: true })

  await app.listen(process.env.PORT ?? 4001)
  console.log(`API running on port ${process.env.PORT ?? 4001}`)
}
bootstrap()
