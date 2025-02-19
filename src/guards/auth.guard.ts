import { Injectable, CanActivate, ExecutionContext, HttpStatus as status } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Request } from 'express'
import { JWTVerifyResult, JWTPayload } from 'jose'
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'
import validator from 'validator'

import { EnvironmentService } from '~/configs/env.config'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { Encryption } from '~/helpers/helper.encryption'
import { JwtService } from '~/libs/jwt.lib'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private envService: EnvironmentService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    try {
      const args: HttpArgumentsHost = context.switchToHttp()
      const req: Request = args.getRequest()
      const headers: Record<string, any> = req.headers

      if (!headers.hasOwnProperty('authorization')) {
        throw apiResponse({ stat_code: status.UNAUTHORIZED, error: 'Authorization required' })
      } else if (!Array.isArray(headers.authorization.match('Bearer'))) {
        throw apiResponse({ stat_code: status.UNAUTHORIZED, error: 'Unauthorized invalid token' })
      }

      let authToken: string = headers.authorization.split('Bearer ')[1]
      if (!validator.isJWT(authToken)) {
        throw apiResponse({ stat_code: status.UNAUTHORIZED, error: 'Unauthorized invalid token' })
      }

      const jwtDecode: JwtPayload = jsonwebtoken.decode(authToken) as any
      if (!jwtDecode) {
        throw apiResponse({ stat_code: status.UNAUTHORIZED, error: 'Unauthorized invalid token' })
      }

      const secretKey: string = Buffer.from(`${jwtDecode.aud}:${jwtDecode.iss}:${jwtDecode.sub}:${this.envService.JWT_EXPIRED}`).toString('hex')
      const secretData: Buffer = Buffer.from(jwtDecode.jti, 'hex')
      const jti: string = Encryption.AES256Decrypt(secretKey, secretData).toString()

      const verifyRes: JWTVerifyResult<JWTPayload> = await this.jwtService.verify(jti, authToken)
      if (!verifyRes) {
        throw apiResponse({ stat_code: status.UNAUTHORIZED, error: 'Unauthorized invalid token' })
      }

      // set user id for decorator user access
      req['user'] = { id: jti }

      return true
    } catch (e: any) {
      throw apiResponse(e)
    }
  }
}
