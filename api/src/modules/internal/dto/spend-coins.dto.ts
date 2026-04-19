import { IsString, IsInt, IsPositive, MinLength } from 'class-validator'

export class SpendCoinsDto {
  @IsString()
  @MinLength(1)
  studentId!: string

  @IsInt()
  @IsPositive()
  amount!: number

  @IsString()
  @MinLength(1)
  reason!: string

  @IsString()
  @MinLength(1)
  sourceId!: string

  @IsString()
  @MinLength(1)
  idempotencyKey!: string
}
