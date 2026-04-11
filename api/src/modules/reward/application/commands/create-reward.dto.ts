import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateRewardDto {
  @IsString()   @IsNotEmpty()  name!:          string
  @IsNumber()                  coinsRequired!: number
  @IsOptional() @IsString()    description?:   string
  @IsOptional() @IsString()    icon?:          string
  @IsOptional() @IsString()    type?:          string
  @IsOptional() @IsBoolean()   isGlobal?:      boolean
  @IsOptional() @IsNumber()    discount?:      number
}
