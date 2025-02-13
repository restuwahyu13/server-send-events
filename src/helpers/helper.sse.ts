import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { RedisService } from 'src/libs/lib.redis';

@Injectable()
export class ServerSendEvents {
  private logger: Logger;
  private headers: Headers;

  constructor(private readonly redisService: RedisService) {
    this.logger = new Logger('ServerSendEvents');
    this.headers = new Headers({
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST',
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      accept: 'text/event-stream',
      connection: 'keep-alive',
    });
  }

  private revokeEvents(res: Response): void {
    res.flushHeaders();
    res.removeAllListeners();
    res.end();
    res.socket.destroy();
  }

  private processEvents(res: Response): void {
    res
      .on('error', (err?: Error) => {
        this.logger.error('SSE error', err);
        this.revokeEvents(res);
      })
      .on('close', (args: any) => {
        this.logger.log('SSE close', args);
        this.revokeEvents(res);
      })
      .on('finish', (args: any) => {
        this.logger.log('SSE finished', args);
        this.revokeEvents(res);
      });

    process
      .on('uncaughtException', (err: Error) => {
        this.logger.log('SSE uncaughtException', err);
        this.revokeEvents(res);
      })
      .on('uncaughtExceptionMonitor', (err: Error) => {
        this.logger.log('SSE uncaughtExceptionMonitor', err);
        this.revokeEvents(res);
      })
      .on('unhandledRejection', (err: Error) => {
        this.logger.log('SSE unhandledRejection', err);
        this.revokeEvents(res);
      })
      .on('rejectionHandled', (err: Error) => {
        this.logger.log('SSE rejectionHandled', err);
        this.revokeEvents(res);
      });
  }

  send(res: Response, event: string, message: any): void {
    res.setMaxListeners(0).setHeaders(this.headers);

    const uuid: string = randomUUID();
    const content: string = `id: ${uuid}\nevent: ${event}\ndata: ${JSON.stringify({ data: message })}\n\n`;

    res.socket.cork();
    res.write(content);
    res.socket.uncork();

    this.processEvents(res);
  }

  subscribe(res: Response, event: string): void {
    res.setMaxListeners(0).setHeaders(this.headers);
    res.socket.unref();

    this.redisService.subscribe(event, (message: any) => {
      if (message) {
        const uuid: string = randomUUID();
        const content: string = `id: ${uuid}\nevent: ${event}\ndata: ${JSON.stringify({ data: message })}\n\n`;

        res.socket.cork();
        res.write(content);
        res.socket.uncork();
      } else {
        this.logger.log('Subscribe not received from redis');
      }
    });

    this.processEvents(res);
  }

  publish(event: string, message: any): Promise<number> {
    return this.redisService.publish(event, message);
  }
}
