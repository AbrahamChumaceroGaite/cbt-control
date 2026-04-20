import { IsNotEmpty, IsString } from 'class-validator'

export class ContinueGameDto {
  @IsString()
  @IsNotEmpty()
  gameSlug!: string

  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string
}
