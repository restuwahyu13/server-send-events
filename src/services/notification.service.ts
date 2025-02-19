import { ApiResponse } from '~/interfaces/apiResponse.interface'
import { Injectable } from '@nestjs/common'
import { Response } from 'express'
import { ServerSendEventsService } from '~/helpers/helper.serverSendEvents'
import { apiResponse } from '~/helpers/helper.apiResponse'

@Injectable()
export class NotificationService {
  constructor(private serverSendEventsService: ServerSendEventsService) {}

  sendSpecificUser(res: Response, user: Record<string, any>): void | ApiResponse {
    try {
      this.serverSendEventsService.subscribeSpecific(res, user, 'notification')
    } catch (e: any) {
      throw apiResponse(e)
    }
  }
}
