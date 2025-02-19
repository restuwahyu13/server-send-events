import { Callback, Redis } from 'ioredis'
import { HttpException, Injectable, Logger, HttpStatus as status } from '@nestjs/common'

import { EnvironmentService } from '~/configs/env.config'

@Injectable()
export class RedisService {
  private logger: Logger = new Logger('RedisService')

  private redis: Redis
  private predis: Redis
  private sredis: Redis

  constructor(private envService: EnvironmentService) {
    this.redis = new Redis(this.envService.REDIS_URL, { enableAutoPipelining: true })
    this.predis = new Redis(this.envService.REDIS_URL, { enableAutoPipelining: true, autoResubscribe: false })
    this.sredis = new Redis(this.envService.REDIS_URL, { enableAutoPipelining: true, autoResubscribe: false })
  }

  ttl(key: string): Promise<number> {
    try {
      return this.redis.ttl(key)
    } catch (e: any) {
      throw new HttpException(e, status.FAILED_DEPENDENCY)
    }
  }

  exists(key: string): Promise<number> {
    try {
      return this.redis.exists(key)
    } catch (e: any) {
      throw new HttpException(e, status.FAILED_DEPENDENCY)
    }
  }

  del(key: string): Promise<number> {
    try {
      return this.redis.del(key)
    } catch (e: any) {
      throw new HttpException(e, status.FAILED_DEPENDENCY)
    }
  }

  setEx(key: string, expired: number, data: string | number): Promise<string> {
    try {
      return this.redis.setex(key, expired, data)
    } catch (e: any) {
      throw new HttpException(e, status.FAILED_DEPENDENCY)
    }
  }

  set(key: string, data: string | number): Promise<string> {
    try {
      return this.redis.set(key, data)
    } catch (e: any) {
      throw new HttpException(e, status.FAILED_DEPENDENCY)
    }
  }

  get(key: string): Promise<string> {
    try {
      return this.redis.get(key)
    } catch (e: any) {
      throw new HttpException(e, status.FAILED_DEPENDENCY)
    }
  }

  hset(key: string, field: string, data: Record<string, any>): Promise<number> {
    try {
      return this.redis.hset(key, { [field]: JSON.stringify(data) })
    } catch (e: any) {
      throw new HttpException(e, status.FAILED_DEPENDENCY)
    }
  }

  async hsetEx(key: string, field: string, exp: number, data: Record<string, any>): Promise<number> {
    try {
      const res: Promise<number> = this.redis.hset(key, { [field]: JSON.stringify(data) })
      await this.redis.expire(key, exp)

      return res
    } catch (e: any) {
      throw new HttpException(e, status.FAILED_DEPENDENCY)
    }
  }

  hget(key: string, field: string): Promise<any> {
    try {
      return this.redis.hget(key, field).then((val: string) => JSON.parse(val))
    } catch (e: any) {
      throw new HttpException(e, status.FAILED_DEPENDENCY)
    }
  }

  hexists(key: string, field: string): Promise<number> {
    try {
      return this.redis.hexists(key, field)
    } catch (e: any) {
      throw new HttpException(e, status.FAILED_DEPENDENCY)
    }
  }

  publish(channel: string, message: any) {
    return this.predis.publish(channel, JSON.stringify({ data: message }))
  }

  subscribe(channel: string, cb: Callback<any>) {
    process.nextTick(() => {
      this.sredis.on('message', (ch: string, message: any) => {
        if (ch === channel) {
          this.logger.log('Subscribe channel match')
          cb(message)
        } else {
          this.logger.log('Subscribe channel unmatch')
        }
      })
    })

    this.sredis.subscribe(channel)
  }

  subscribeAsync(channel: string) {
    return new Promise((resolve, _reject) => {
      process.nextTick(() => {
        this.sredis.on('message', (ch: string, message: any) => {
          if (ch === channel) {
            this.logger.log('Subscribe channel match')
            resolve(message)
          } else {
            this.logger.log('Subscribe channel unmatch')
          }
        })
      })

      this.sredis.subscribe(channel)
    })
  }
}
