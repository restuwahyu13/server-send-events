import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class EnvironmentService {
  NODE_ENV: string
  HOST: string
  PORT: number
  REDIS_URL: string
  JWT_EXPIRED: number

  constructor(private configService: ConfigService) {
    this.NODE_ENV = this.configService.get('NODE_ENV')
    this.HOST = this.configService.get('HOST') || '0.0.0.0'
    this.PORT = this.configService.get('PORT') || 3000
    this.REDIS_URL = this.configService.get('REDIS_URL')
    this.JWT_EXPIRED = this.configService.get('JWT_EXPIRED') || 3600
  }
}
