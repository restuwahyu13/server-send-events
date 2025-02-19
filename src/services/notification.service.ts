import { Injectable } from '@nestjs/common'
import { Response } from 'express'

import { apiResponse } from '~/helpers/helper.apiResponse'
import { ServerSendEventsService } from '~/helpers/helper.serverSendEvents'
import { ApiResponse } from '~/interfaces/apiResponse.interface'

@Injectable()
export class NotificationService {
  constructor(private serverSendEventsService: ServerSendEventsService) {}

  sendSpecificUser(res: Response, user: Record<string, any>): void | ApiResponse {
    try {
      this.serverSendEventsService.subscribe(res, user, 'notification')
    } catch (e: any) {
      throw apiResponse(e)
    }
  }
}
