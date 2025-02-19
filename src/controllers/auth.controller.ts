import { Body, Controller, Post } from '@nestjs/common'
import { LoginDTO } from '~/dtos/auth.dto'
import { ApiResponse } from '~/interfaces/apiResponse.interface'
import { AuthService } from '~/services/auth.service'

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() body: LoginDTO): Promise<ApiResponse> {
    return this.authService.login(body)
  }
}
