import { IsString, IsInt, IsPositive, IsIn, MinLength } from 'class-validator'

export class GrantCoinsDto {
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

  @IsIn(['games'])
  sourceModule!: 'games'

  @IsString()
  @MinLength(1)
  idempotencyKey!: string
}
