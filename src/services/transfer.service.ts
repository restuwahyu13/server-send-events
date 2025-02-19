import { Injectable, HttpStatus as status } from '@nestjs/common'

import { TransferDTO } from '~/dtos/transfer.dto'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { ServerSendEventsService } from '~/helpers/helper.serverSendEvents'
import { ApiResponse } from '~/interfaces/apiResponse.interface'
import { userMocks } from '~/mocks/user.mock'

@Injectable()
export class TransferService {
  constructor(private serverSendEventsService: ServerSendEventsService) {}

  async transferMoney(_user: Record<string, any>, body: TransferDTO): Promise<ApiResponse> {
    try {
      const userMockSender: Record<string, any> = userMocks.find((user: Record<string, any>) => user.email === body.sender)
      const userMockReceiver: Record<string, any> = userMocks.find((user: Record<string, any>) => user.email === body.receiver)

      if (!userMockSender || !userMockReceiver) {
        throw apiResponse({ stat_code: status.UNPROCESSABLE_ENTITY, error: 'Sender or Receiver account not registered' })
      }

      this.serverSendEventsService.publish('notification', {
        userId: userMockReceiver.id,
        message: `Transfer money to ${userMockReceiver.email} successfully`,
      })

      return apiResponse({ stat_code: status.OK, message: `Transfer money to ${userMockReceiver.email} successfully` })
    } catch (e: any) {
      throw apiResponse(e)
    }
  }
}
