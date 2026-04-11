import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PortalRepository }               from '../../domain/portal.repository'
import { UpdateProfileCommand }           from './update-profile.command'

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand, void> {
  constructor(private readonly repo: PortalRepository) {}

  async execute({ userId, dto }: UpdateProfileCommand): Promise<void> {
    await this.repo.updateProfile(userId, { avatarUrl: dto.avatarUrl, bannerUrl: dto.bannerUrl })
  }
}
