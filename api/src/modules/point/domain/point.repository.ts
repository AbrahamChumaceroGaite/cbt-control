import type { CoinLogEntity } from './coin-log.entity'

export abstract class PointRepository {
  abstract awardCoins(data: {
    courseId:  string
    studentId?: string
    actionId?:  string
    coins:     number
    reason:    string
  }): Promise<CoinLogEntity>
}
