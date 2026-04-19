import type { LevelConfig, LevelFormation, LevelSpecialEvent } from '@control-aula/shared'

export class LevelEntity {
  private constructor(
    readonly id:             string,
    readonly gameId:         string,
    readonly number:         number,
    readonly speedMult:      number,
    readonly fireRateMult:   number,
    readonly enemyCols:      number,
    readonly enemyRows:      number,
    readonly bunkerCount:    number,
    readonly hasMysteryTank: boolean,
    readonly specialEvent:   string,
    readonly isBoss:         boolean,
    readonly bossHits:       number,
    readonly enemyMixLight:  number,
    readonly enemyMixMedium: number,
    readonly enemyMixHeavy:  number,
  ) {}

  static fromRecord(r: {
    id: string; gameId: string; number: number
    speedMult: number; fireRateMult: number
    enemyColsCount: number; enemyRowsCount: number
    bunkerCount: number; hasMysteryTank: boolean
    specialEvent: string; isBoss: boolean; bossHits: number
    enemyMixLight: number; enemyMixMedium: number; enemyMixHeavy: number
  }): LevelEntity {
    return new LevelEntity(
      r.id, r.gameId, r.number,
      r.speedMult, r.fireRateMult,
      r.enemyColsCount, r.enemyRowsCount,
      r.bunkerCount, r.hasMysteryTank,
      r.specialEvent, r.isBoss, r.bossHits,
      r.enemyMixLight, r.enemyMixMedium, r.enemyMixHeavy,
    )
  }

  toConfig(): LevelConfig {
    return {
      formation:      'standard' as LevelFormation,
      speedMult:      this.speedMult,
      fireRateMult:   this.fireRateMult,
      enemyMix: {
        light:  this.enemyMixLight,
        medium: this.enemyMixMedium,
        heavy:  this.enemyMixHeavy,
      },
      bunkerCount:    this.bunkerCount,
      hasMysteryTank: this.hasMysteryTank,
      specialEvent:   this.specialEvent as LevelSpecialEvent,
      isBoss:         this.isBoss,
      bossHits:       this.bossHits,
      enemyCols:      this.enemyCols,
      enemyRows:      this.enemyRows,
    }
  }
}
