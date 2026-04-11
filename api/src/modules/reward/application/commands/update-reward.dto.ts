import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateRewardDto {
  @IsOptional() @IsString()   name?:          string
  @IsOptional() @IsString()   description?:   string
  @IsOptional() @IsString()   icon?:          string
  @IsOptional() @IsNumber()   coinsRequired?: number
  @IsOptional() @IsNumber()   discount?:      number
  @IsOptional() @IsString()   type?:          string
  @IsOptional() @IsBoolean()  isGlobal?:      boolean
  @IsOptional() @IsBoolean()  isActive?:      boolean
}
