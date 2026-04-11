import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateActionDto {
  @IsOptional() @IsString()   name?:           string
  @IsOptional() @IsNumber()   coins?:          number
  @IsOptional() @IsString()   category?:       string
  @IsOptional() @IsBoolean()  affectsClass?:   boolean
  @IsOptional() @IsBoolean()  affectsStudent?: boolean
  @IsOptional() @IsBoolean()  isActive?:       boolean
}
