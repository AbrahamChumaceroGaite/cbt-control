import { IsString, MinLength, IsOptional, IsBoolean, IsInt, IsPositive, Min, Max, Matches } from 'class-validator'

export class UpdateGameDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string

  @IsOptional()
  @IsString()
  @MinLength(2)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase letters, numbers, and hyphens only' })
  slug?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  coverUrl?: string

  @IsOptional()
  @IsString()
  iconEmoji?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(100)
  maxLevels?: number

  @IsOptional()
  @IsInt()
  @IsPositive()
  coinsPerLevelBase?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  coinsPerLevelStep?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  bonusCoins?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  continueCost?: number
}
