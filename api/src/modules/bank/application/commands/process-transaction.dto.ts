import { IsIn, IsOptional, IsString } from 'class-validator'

export class ProcessTransactionDto {
  @IsIn(['approved', 'rejected']) status!: 'approved' | 'rejected'
  @IsOptional() @IsString()       adminNotes?: string
}
