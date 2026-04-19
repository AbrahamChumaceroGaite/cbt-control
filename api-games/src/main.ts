import 'reflect-metadata'
import { NestFactory }             from '@nestjs/core'
import { ValidationPipe }          from '@nestjs/common'
import { AppModule }               from './app.module'
import { GlobalExceptionFilter }   from './common/filters/global-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new GlobalExceptionFilter())
  const port = process.env['PORT'] ?? 4003
  await app.listen(port)
  console.log(`api-games running on :${port}`)
}
bootstrap()
