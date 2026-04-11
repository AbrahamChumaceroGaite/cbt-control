import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ProcessRedemptionDto {
  @IsString() @IsNotEmpty() @IsIn(['approved', 'rejected']) status!: string
  @IsOptional() @IsString() notes?: string
}
