import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
  @IsString() @IsNotEmpty() code!:      string
  @IsString() @IsNotEmpty() password!:  string
  @IsString() @IsNotEmpty() role!:      string
  @IsOptional() @IsString() studentId?: string
  @IsOptional() @IsString() fullName?:  string
}
