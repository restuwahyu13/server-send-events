import { Injectable, Logger } from '@nestjs/common';
import { Callback, Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private logger: Logger = new Logger('RedisService');

  private predis: Redis;
  private sredis: Redis;

  constructor() {
    this.predis = new Redis({ enableAutoPipelining: true });
    this.sredis = new Redis({ enableAutoPipelining: true });
  }

  publish(channel: string, message: any) {
    return this.predis.publish(channel, JSON.stringify({ data: message }));
  }

  subscribe(channel: string, cb: Callback<any>) {
    this.sredis.on('message', (ch: string, message: any) => {
      if (ch === channel) {
        this.logger.log('Subscribe channel match');
        cb(message);
      } else {
        this.logger.log('Subscribe channel unmatch');
      }
    });
    this.sredis.subscribe(channel);
  }

  subscribeAsync(channel: string) {
    return new Promise((resolve, _reject) => {
      this.sredis.on('message', (ch: string, message: any) => {
        if (ch === channel) {
          this.logger.log('Subscribe channel match');
          resolve(message);
        } else {
          this.logger.log('Subscribe channel unmatch');
        }
      });
      this.sredis.subscribe(channel);
    });
  }
}
