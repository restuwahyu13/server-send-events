import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginDTO {
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  password: string
}
