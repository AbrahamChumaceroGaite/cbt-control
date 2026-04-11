import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(500_000)   avatarUrl?: string
  @IsOptional() @IsString() @MaxLength(1_000_000) bannerUrl?: string
}
