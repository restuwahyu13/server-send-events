import { CanActivate, ExecutionContext, Injectable, HttpStatus as status } from '@nestjs/common'
import { JWTPayload, JWTVerifyResult } from 'jose'
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'

import { ESseResponseType } from '~/interfaces/sseResponse.interface'
import { Encryption } from '~/helpers/helper.encryption'
import { EnvironmentService } from '~/configs/env.config'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { JwtService } from '~/libs/jwt.lib'
import { Request } from 'express'
import { ServerSendEventsService } from '~/helpers/helper.serverSendEvents'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { sseResponse } from '~/helpers/helper.sseResponse'
import validator from 'validator'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private envService: EnvironmentService,
    private jwtService: JwtService,
  ) {}

  private static async validate(req: Request, jwtService: JwtService, envService: EnvironmentService): Promise<any> {
    try {
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

      const secretKey: string = Buffer.from(`${jwtDecode.aud}:${jwtDecode.iss}:${jwtDecode.sub}:${envService.JWT_EXPIRED}`).toString('hex')
      const secretData: Buffer = Buffer.from(jwtDecode.jti, 'hex')
      const jti: string = Encryption.AES256Decrypt(secretKey, secretData).toString()

      const verifyRes: JWTVerifyResult<JWTPayload> = await jwtService.verify(jti, authToken)
      if (!verifyRes) {
        throw apiResponse({ stat_code: status.UNAUTHORIZED, error: 'Unauthorized invalid token' })
      }

      req['user'] = { id: jti }

      return true
    } catch (e: any) {
      apiResponse(e)
      return false
    }
  }

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

      req['user'] = { id: jti }

      return true
    } catch (e: any) {
      throw apiResponse(e)
    }
  }

  static async canActivateManual(
    req: Request,
    envService: EnvironmentService,
    jwtService: JwtService,
    sseService: ServerSendEventsService,
  ): Promise<void> {
    const isAuth: boolean = await AuthGuard.validate(req, jwtService, envService)

    if (!isAuth) {
      sseService.send(
        'notification',
        sseResponse({ type: ESseResponseType.ERROR, content: { title: 'Unauthorized', description: 'Invalid access token' } }),
      )
    }
  }
}
