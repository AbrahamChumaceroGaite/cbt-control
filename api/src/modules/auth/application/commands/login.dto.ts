import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class LoginDto {
  @IsString() @IsNotEmpty() code!:     string
  @IsOptional() @IsString() password?: string
}
