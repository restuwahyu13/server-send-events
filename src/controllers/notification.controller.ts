import { Controller, Param, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { User } from '~/decorators/user.decorator'
import { NotificationService } from '~/services/notification.service'

@Controller()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('/notification')
  sendBroadcast(@Req() req: Request, @Res() res: Response): void {
    this.notificationService.sendBroadcast(req, res)
  }

  @Post('/notification/:id')
  sendSpecific(@Req() req: Request, @Res() res: Response, @User() user: Record<string, any>, @Param('id') id: string): void {
    this.notificationService.sendSpecific(req, res, user, id)
  }
}
