import { Injectable, HttpStatus as status } from '@nestjs/common'

import { LoginDTO } from '~/dtos/auth.dto'
import { apiResponse } from '~/helpers/helper.apiResponse'
import { ApiResponse } from '~/interfaces/apiResponse.interface'
import { JwtService } from '~/libs/jwt.lib'
import { userMocks } from '~/mocks/user.mock'

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(body: LoginDTO): Promise<ApiResponse> {
    try {
      const userMock: Record<string, any> = userMocks.find(
        (user: Record<string, any>) => user.email === body.email && user.password === body.password,
      )

      if (!userMock) {
        throw apiResponse({ stat_code: status.UNPROCESSABLE_ENTITY, error: 'Invalid email or password' })
      }

      const accessToken: string = await this.jwtService.sign(userMock.id, body)

      return apiResponse({ stat_code: status.OK, message: 'Login successfully', data: { accessToken } })
    } catch (e: any) {
      throw apiResponse(e)
    }
  }
}
