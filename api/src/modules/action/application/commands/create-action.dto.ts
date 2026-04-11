import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateActionDto {
  @IsString()  @IsNotEmpty()  name!:           string
  @IsNumber()                 coins!:           number
  @IsOptional() @IsString()   category?:        string
  @IsOptional() @IsBoolean()  affectsClass?:    boolean
  @IsOptional() @IsBoolean()  affectsStudent?:  boolean
}
