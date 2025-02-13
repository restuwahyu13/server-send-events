import { Injectable } from '@nestjs/common';
import { Callback, Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private predis: Redis;
  private sredis: Redis;

  constructor() {
    this.predis = new Redis({ enableAutoPipelining: true });
    this.sredis = new Redis({ enableAutoPipelining: true });
  }

  publish(channel: string, message: any) {
    return this.predis.publish(channel, JSON.stringify({ data: message }));
  }

  subscribe(channel: string, callback: Callback<any>) {
    this.sredis.on('message', (ch: string, message: any) => {
      if (ch === channel) {
        callback(message);
      }
    });
    this.sredis.subscribe(channel);
  }
}
