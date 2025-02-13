import { Controller, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  send(): Promise<Record<string, any>> {
    return this.appService.send();
  }

  @Post('/notification')
  async pushNotiication(@Res() res: Response): Promise<void> {
    await this.appService.pushNotiication(res);
  }
}
