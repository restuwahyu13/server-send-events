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
  pushNotiication(@Res() res: Response): void {
    this.appService.pushNotiication(res);
  }
}
