import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { EnvironmentService } from '~/configs/env.config'
import { RedisService } from '~/libs/lib.redis'
import { JoseService } from '~/libs/jose.lib'
import { JwtService } from '~/libs/jwt.lib'
import { ServerSendEventsService } from '~/helpers/helper.serverSendEvents'
import { AuthController } from '~/controllers/auth.controller'
import { AuthService } from '~/services/auth.service'
import { TransferController } from '~/controllers/transfer.controller'
import { TransferService } from '~/services/transfer.service'
import { NotificationController } from '~/controllers/notification.controller'
import { NotificationService } from '~/services/notification.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      expandVariables: true,
      isGlobal: true,
      cache: true,
    }),
  ],
  controllers: [AuthController, TransferController, NotificationController],
  providers: [EnvironmentService, RedisService, JoseService, JwtService, ServerSendEventsService, AuthService, NotificationService, TransferService],
  exports: [EnvironmentService, RedisService, JoseService, JwtService, ServerSendEventsService],
})
export class AppModule {}
