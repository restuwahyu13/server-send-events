import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { User } from '~/decorators/user.decorator'
import { TransferDTO } from '~/dtos/transfer.dto'
import { AuthGuard } from '~/guards/auth.guard'
import { ApiResponse } from '~/interfaces/apiResponse.interface'
import { TransferService } from '~/services/transfer.service'

@UseGuards(AuthGuard)
@Controller({
  path: 'transfer',
  version: '1',
})
export class TransferController {
  constructor(private transferService: TransferService) {}

  @Post('/money')
  transferMoney(@User() user: Record<string, any>, @Body() body: TransferDTO): Promise<ApiResponse> {
    return this.transferService.transferMoney(user, body)
  }
}
