import { Injectable, HttpStatus as status } from '@nestjs/common'

import { ApiResponse } from '~/interfaces/apiResponse.interface'
import { ESseResponseType } from '~/interfaces/sseResponse.interface'
import { ServerSendEventsService } from '~/helpers/helper.serverSendEvents'
import { TransferDTO } from '~/dtos/transfer.dto'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { sseResponse } from '~/helpers/helper.sseResponse'
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

      const amount: string = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(body.amount)

      this.serverSendEventsService.send(
        'notification',
        sseResponse({
          id: userMockReceiver.id,
          type: ESseResponseType.INFO,
          content: {
            title: 'Transfer successfully',
            description: `You have received balance from ${userMockSender.email} ${amount}`,
          },
        }),
      )

      return apiResponse({ stat_code: status.OK, message: `Transfer money to ${userMockReceiver.email} successfully` })
    } catch (e: any) {
      throw apiResponse(e)
    }
  }
}
