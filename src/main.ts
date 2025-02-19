import 'reflect-metadata'
import 'express-async-errors'

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'

import { AppErrorException } from '~/app.exception'
import { AppInterceptor } from '~/app.interceptor'
import { AppModule } from '~/app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { NestFactory } from '@nestjs/core'
import compression from 'compression'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import nocache from 'nocache'
import zlib from 'zlib'

class Application {
  private app: NestExpressApplication
  private logger: Logger
  private host: string
  private port: number

  constructor() {
    this.logger = new Logger('HttpServer')
    this.host = process.env.HOST
    this.port = +process.env.PORT
  }

  private async setupApplication(): Promise<void> {
    this.app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true })
  }

  private globalConfig(): void {
    this.app.useGlobalPipes(new ValidationPipe({ transform: true }))
    this.app.useGlobalFilters(new AppErrorException())
    this.app.useGlobalInterceptors(new AppInterceptor())
    this.app.enableVersioning({ type: VersioningType.URI })
    this.app.enableShutdownHooks()
    this.app.enableCors()
    this.app.disable('x-powered-by')
  }

  private globalMiddleware(): void {
    this.app.use(nocache())
    this.app.use(helmet())
    this.app.use(express.json({ limit: +process.env.INBOUND_SIZE_MAX }))
    this.app.use(express.raw({ limit: +process.env.INBOUND_SIZE_MAX }))
    this.app.use(express.urlencoded({ limit: +process.env.INBOUND_SIZE_MAX, extended: true }))
    this.app.use(
      hpp({ checkBody: true, checkQuery: true, whitelist: ['questions', 'oldquestions'], checkBodyOnlyForContentType: 'application/json' }),
    )
    this.app.use(
      compression({
        strategy: zlib.constants.Z_RLE,
        level: zlib.constants.Z_BEST_COMPRESSION,
        memLevel: zlib.constants.Z_BEST_COMPRESSION,
      }),
    )
  }

  private serverListening(): void {
    this.app.listen(this.port, this.host, () => this.logger.log(`Server listening on port ${this.port}`))
  }

  async bootstrapping(): Promise<void> {
    await this.setupApplication()
    this.globalConfig()
    this.globalMiddleware()
    this.serverListening()
  }
}

/**
 * @description boostraping app and run app with env development | production | staging | testing
 */

;((): void => {
  new Application().bootstrapping()
})()
