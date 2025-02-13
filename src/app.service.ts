import { Injectable } from '@nestjs/common';
import { RedisService } from './libs/lib.redis';
import { ServerSendEvents } from './helpers/helper.sse';
import { Response } from 'express';

@Injectable()
export class AppService {
  constructor(private readonly sseService: ServerSendEvents) {}

  async send(): Promise<Record<string, any>> {
    const pub: number = await this.sseService.publish('notification', { message: 'Hello World!' });
    return { message: pub > 0 ? 'SSE send message success' : 'SSE send message failed' };
  }

  pushNotiication(res: Response): void {
    this.sseService.subscribe(res, 'notification');
  }
}
