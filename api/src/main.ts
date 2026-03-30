import 'reflect-metadata'
import { NestFactory }           from '@nestjs/core'
import { ValidationPipe }        from '@nestjs/common'
import { AppModule }             from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3001' })

  await app.listen(process.env.PORT ?? 4001)
  console.log(`API running on port ${process.env.PORT ?? 4001}`)
}
bootstrap()
