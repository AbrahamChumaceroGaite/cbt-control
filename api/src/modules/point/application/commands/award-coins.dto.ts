import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class AwardCoinsDto {
  @IsString()  @IsNotEmpty()  courseId!:  string
  @IsOptional() @IsString()   studentId?: string
  @IsOptional() @IsString()   actionId?:  string
  @IsNumber()                 coins!:     number
  @IsString()  @IsNotEmpty()  reason!:    string
}
