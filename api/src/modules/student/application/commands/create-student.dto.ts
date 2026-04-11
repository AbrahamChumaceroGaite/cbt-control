import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateStudentDto {
  @IsString()   @IsNotEmpty() courseId!: string
  @IsString()   @IsNotEmpty() name!:     string
  @IsOptional() @IsString()   code?:     string
  @IsOptional() @IsString()   email?:    string
  @IsOptional() @IsNumber()   coins?:    number
}
