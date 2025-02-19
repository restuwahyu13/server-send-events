import { Controller, Post, Res } from '@nestjs/common'
import { Response } from 'express'
import { User } from '~/decorators/user.decorator'
import { ApiResponse } from '~/interfaces/apiResponse.interface'
import { NotificationService } from '~/services/notification.service'

// @UseGuards(AuthSSEGuard)
@Controller()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('/notification')
  sendSpecificUser(@Res() res: Response, @User() user: Record<string, any>): void | ApiResponse {
    this.notificationService.sendSpecificUser(res, user)
  }
}
