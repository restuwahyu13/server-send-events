import { Request, Response } from 'express'

import { ApiResponse } from '~/interfaces/apiResponse.interface'
import { AuthGuard } from '~/guards/auth.guard'
import { EnvironmentService } from '~/configs/env.config'
import { Injectable } from '@nestjs/common'
import { JwtService } from '~/libs/jwt.lib'
import { ServerSendEventsService } from '~/helpers/helper.serverSendEvents'

@Injectable()
export class NotificationService {
  constructor(
    private envService: EnvironmentService,
    private jwtService: JwtService,
    private sseService: ServerSendEventsService,
  ) {}

  sendBroadcast(req: Request, res: Response): void | ApiResponse {
    AuthGuard.canActivateManual(req, this.envService, this.jwtService, this.sseService)
    this.sseService.subscribeBroadcast(res, 'notification')
  }

  sendSpecific(req: Request, res: Response, user: Record<string, any>, id: string): void | ApiResponse {
    AuthGuard.canActivateManual(req, this.envService, this.jwtService, this.sseService)
    this.sseService.subscribeSpecific(res, user, id, 'notification')
  }
}
