import { IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateCourseDto {
  @IsOptional() @IsString() name?:       string
  @IsOptional() @IsString() level?:      string
  @IsOptional() @IsString() parallel?:   string
  @IsOptional() @IsNumber() classCoins?: number
}
