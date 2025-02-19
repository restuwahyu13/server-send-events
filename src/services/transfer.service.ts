import { Injectable, HttpStatus as status } from '@nestjs/common'

import { ApiResponse } from '~/interfaces/apiResponse.interface'
import { ServerSendEventsService } from '~/helpers/helper.serverSendEvents'
import { TransferDTO } from '~/dtos/transfer.dto'
import { apiResponse } from '~/helpers/helper.apiResponse'
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

      const amount: string = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(2000)

      this.serverSendEventsService.publish('notification', {
        userId: userMockReceiver.id,
        message: `You have received balance from ${userMockSender.email} ${amount}`,
      })

      return apiResponse({ stat_code: status.OK, message: `Transfer money to ${userMockReceiver.email} successfully` })
    } catch (e: any) {
      throw apiResponse(e)
    }
  }
}
