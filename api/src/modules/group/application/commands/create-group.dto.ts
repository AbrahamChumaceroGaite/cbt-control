import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateGroupDto {
  @IsString()   @IsNotEmpty()  name!:       string
  @IsString()   @IsNotEmpty()  courseId!:   string
  @IsOptional() @IsArray()     studentIds?: string[]
}
