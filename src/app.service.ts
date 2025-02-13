import { Injectable } from '@nestjs/common';
import { RedisService } from './libs/lib.redis';
import { ServerSendEvents } from './helpers/helper.sse';
import { Response } from 'express';

@Injectable()
export class AppService {
  constructor(private readonly sseService: ServerSendEvents) {}

  send(): Promise<number> {
    return this.sseService.publish('text', { message: 'Hello World!' });
  }

  pushNotiication(res: Response): void {
    this.sseService.subscribe(res, 'text');
  }
}
