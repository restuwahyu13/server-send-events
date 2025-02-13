import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { RedisService } from 'src/libs/lib.redis';

@Injectable()
export class ServerSendEvents {
  constructor(private readonly redisService: RedisService) {}

  subscribe(res: Response, event: string): void {
    res.writeHead(200, {
      accept: 'text/event-stream',
      connection: 'keep-alive',
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
    });

    res.flushHeaders();

    this.redisService.subscribe(event, (result: any) => {
      const content: string = `event: ${event}\ndata: ${result}\n\n`;

      res.cork();
      res.write(content);
      process.nextTick(() => {
        res.uncork();
        res.socket.unref();
      });
    });

    res.on('close', () => {
      res.socket.destroy();
      res.end();
    });
  }

  publish(event: string, message: any) {
    return this.redisService.publish(event, message);
  }

  send(res: Response, event: string, message: any): void {
    res.writeHead(200, {
      accept: 'text/event-stream',
      connection: 'keep-alive',
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
    });
    res.flushHeaders();

    const content: string = `event: ${event}\ndata: ${JSON.stringify({ data: message })}\n\n`;
    res.write(content);

    res.on('close', () => res.end());
  }
}
