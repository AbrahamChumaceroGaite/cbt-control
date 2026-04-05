import { IsOptional, IsString, MaxLength } from 'class-validator'
import { ICommandHandler, CommandHandler }  from '@nestjs/cqrs'
import { PortalRepository }                 from '../../domain/portal.repository'

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(500_000) avatarUrl?: string
  @IsOptional() @IsString() @MaxLength(1_000_000) bannerUrl?: string
}

export class UpdateProfileCommand {
  constructor(public readonly userId: string, public readonly dto: UpdateProfileDto) {}
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand, void> {
  constructor(private readonly repo: PortalRepository) {}

  async execute({ userId, dto }: UpdateProfileCommand): Promise<void> {
    await this.repo.updateProfile(userId, { avatarUrl: dto.avatarUrl, bannerUrl: dto.bannerUrl })
  }
}
