import { CallHandler, ExecutionContext, HttpStatus, HttpStatus as status, Injectable } from '@nestjs/common'
import { HttpArgumentsHost, NestInterceptor } from '@nestjs/common/interfaces'
import { Request, Response } from 'express'
import { OutgoingMessage } from 'http'
import { map, Observable } from 'rxjs'

@Injectable()
export class AppInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<OutgoingMessage> {
    const ctx: HttpArgumentsHost = context.switchToHttp()
    const req: Request = ctx.getRequest()
    const res: Response = ctx.getResponse()

    return next.handle().pipe(
      map((value) => {
        if (req.method === 'POST' && res.statusCode === HttpStatus.CREATED) {
          res.status(status.OK)
        }

        return value
      }),
    )
  }
}
