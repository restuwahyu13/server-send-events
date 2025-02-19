import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const User = createParamDecorator((_, ctx: ExecutionContext): Record<string, any> => {
  const req: Request = ctx.switchToHttp().getRequest()
  return req['user']
})
