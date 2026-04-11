import { SubscribeDto } from './subscribe.dto'

export class SubscribeCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: SubscribeDto,
  ) {}
}
