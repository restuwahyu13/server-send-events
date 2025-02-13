import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ServerSendEvents } from './helpers/helper.sse';
import { RedisService } from './libs/lib.redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      expandVariables: true,
      isGlobal: true,
      cache: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, RedisService, ServerSendEvents],
  exports: [RedisService, ServerSendEvents],
})
export class AppModule {}
