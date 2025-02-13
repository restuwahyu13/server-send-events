import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  send(): Promise<number> {
    return this.appService.send();
  }

  @Get('/notification')
  async pushNotiication(@Res() res: Response): Promise<void> {
    await this.appService.pushNotiication(res);
  }
}
