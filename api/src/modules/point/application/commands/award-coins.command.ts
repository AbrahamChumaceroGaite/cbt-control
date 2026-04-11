import { AwardCoinsDto } from './award-coins.dto'

export class AwardCoinsCommand {
  constructor(public readonly dto: AwardCoinsDto) {}
}
