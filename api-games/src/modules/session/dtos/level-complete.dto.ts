import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator'

export class LevelCompleteDto {
  @IsString()
  @IsNotEmpty()
  gameSlug!: string

  @IsInt()
  @Min(1)
  @Max(100)
  levelNumber!: number

  @IsInt()
  @Min(0)
  score!: number

  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string
}
