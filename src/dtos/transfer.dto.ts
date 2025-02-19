import { IsEmail, IsNumber } from 'class-validator'

export class TransferDTO {
  @IsEmail()
  sender: string

  @IsEmail()
  receiver: string

  @IsNumber({ allowInfinity: false, allowNaN: false })
  amount: string
}
