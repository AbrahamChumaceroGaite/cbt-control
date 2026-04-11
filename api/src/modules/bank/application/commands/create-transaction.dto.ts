import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateTransactionDto {
  @IsString() @IsNotEmpty() toStudentId!: string
  @IsNumber()  @Min(1)      amount!:      number
  @IsOptional() @IsString() notes?:       string
}
