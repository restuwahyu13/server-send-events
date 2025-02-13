import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { RedisService } from 'src/libs/lib.redis';

@Injectable()
export class ServerSendEvents {
  private logger: Logger = new Logger('ServerSendEvents');

  constructor(private readonly redisService: RedisService) {}

  async subscribe(res: Response, event: string): Promise<void> {
    const headers = new Headers({
      accept: 'text/event-stream',
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
    });

    res.setMaxListeners(0).setHeaders(headers).flushHeaders();

    this.redisService.subscribe(event, (result) => {
      if (result) {
        const content: string = `event: ${event}\ndata: ${result}\n\n`;
        res.cork();
        res.write(content);
        process.nextTick(() => res.uncork());
      } else {
        this.logger.log('Subscribe not received from redis');
      }
    });

    res
      .on('error', (e) => {
        this.logger.error('SSE error', e);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      })
      .on('close', (result) => {
        this.logger.log('SSE close', result);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      })
      .on('finish', (result) => {
        this.logger.log('SSE finished', result);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      });

    process
      .on('uncaughtException', (result) => {
        this.logger.log('SSE uncaughtException', result);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      })
      .on('uncaughtExceptionMonitor', (result) => {
        this.logger.log('SSE uncaughtExceptionMonitor', result);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      })
      .on('unhandledRejection', (result) => {
        this.logger.log('SSE unhandledRejection', result);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
      })
      .on('rejectionHandled', (result) => {
        this.logger.log('SSE rejectionHandled', result);

        res.socket.unref();
        res.socket.destroy();
        res.removeAllListeners().end();
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
