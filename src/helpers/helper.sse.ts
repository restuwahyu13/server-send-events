import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { RedisService } from 'src/libs/lib.redis';

@Injectable()
export class ServerSendEvents {
  private logger: Logger = new Logger('ServerSendEvents');

  constructor(private readonly redisService: RedisService) {}

  private events(res: Response): void {
    res
      .on('error', (err?: Error) => {
        this.logger.error('SSE error', err);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      })
      .on('close', (args: any) => {
        this.logger.log('SSE close', args);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      })
      .on('finish', (args: any) => {
        this.logger.log('SSE finished', args);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      });

    process
      .on('uncaughtException', (err: Error) => {
        this.logger.log('SSE uncaughtException', err);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      })
      .on('uncaughtExceptionMonitor', (err: Error) => {
        this.logger.log('SSE uncaughtExceptionMonitor', err);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      })
      .on('unhandledRejection', (err: Error) => {
        this.logger.log('SSE unhandledRejection', err);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      })
      .on('rejectionHandled', (err: Error) => {
        this.logger.log('SSE rejectionHandled', err);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      });
  }

  send(res: Response, event: string, message: any): void {
    const headers = new Headers({
      accept: 'text/event-stream',
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
    });
    res.setMaxListeners(0).setHeaders(headers).flushHeaders();

    const uuid: string = randomUUID();
    const content: string = `id: ${uuid}\nevent: ${event}\ndata: ${JSON.stringify({ data: message })}\n\n`;

    res.cork();
    res.write(content);
    process.nextTick(() => res.uncork());

    this.events(res);
  }

  subscribe(res: Response, event: string): void {
    const headers = new Headers({
      accept: 'text/event-stream',
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
    });

    res.setMaxListeners(0).setHeaders(headers).flushHeaders();

    this.redisService.subscribe(event, (message: any) => {
      if (message) {
        const uuid: string = randomUUID();
        const content: string = `id: ${uuid}\nevent: ${event}\ndata: ${JSON.stringify({ data: message })}\n\n`;

        res.cork();
        res.write(content);
        process.nextTick(() => res.uncork());
      } else {
        this.logger.log('Subscribe not received from redis');
      }
    });

    this.events(res);
  }

  publish(event: string, message: any): Promise<number> {
    return this.redisService.publish(event, message);
  }
}
