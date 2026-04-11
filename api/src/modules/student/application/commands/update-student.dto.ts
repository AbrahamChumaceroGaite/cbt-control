import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateStudentDto {
  @IsOptional() @IsString() name?:   string
  @IsOptional() @IsString() code?:   string
  @IsOptional() @IsString() email?:  string
  @IsOptional() @IsNumber() coins?:  number
  @IsOptional() @IsArray()  tramos?: string[]
}
