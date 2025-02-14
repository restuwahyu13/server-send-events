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
  pushNotiication(@Res() res: Response): void {
    this.appService.pushNotiication(res);
  }
}
