// ─── Level configuration (stored as JSON in DB) ───────────────────────────────
export type LevelFormation =
  | 'standard' | 'v-shape' | 'diamond' | 'cross'
  | 'pyramid'  | 'scattered' | 'dense' | 'column'

export type LevelSpecialEvent =
  | 'none' | 'speed_burst' | 'dive_bomb' | 'column_advance' | 'blackout'

export type LevelConfig = {
  formation:      LevelFormation
  speedMult:      number        // 1.0 = base speed
  fireRateMult:   number        // 1.0 = base fire rate
  enemyMix:       { light: number; medium: number; heavy: number } // fractions, sum = 1
  bunkerCount:    number        // 0–4
  hasMysteryTank: boolean
  specialEvent:   LevelSpecialEvent
  isBoss:         boolean
  bossHits:       number        // 0 when !isBoss
  enemyCols:      number        // default: 8
  enemyRows:      number        // default: 4
}

// ─── Game catalog ─────────────────────────────────────────────────────────────
export type GameResponse = {
  id:                string
  slug:              string     // 'tank-invaders'
  title:             string
  description:       string
  coverUrl:          string
  iconEmoji:         string
  isActive:          boolean
  maxLevels:         number
  coinsPerLevelBase: number
  coinsPerLevelStep: number
  bonusCoins:        number
  continueCost:      number
  createdAt:         string
}

export type GameCreateInput = {
  slug:               string
  title:              string
  description?:       string
  coverUrl?:          string
  iconEmoji?:         string
  isActive?:          boolean
  maxLevels?:         number
  coinsPerLevelBase?: number
  coinsPerLevelStep?: number
  bonusCoins?:        number
  continueCost?:      number
}

export type GameUpdateInput = Partial<Omit<GameCreateInput, 'slug'>>

// ─── Level ────────────────────────────────────────────────────────────────────
export type LevelResponse = {
  id:     string
  gameId: string
  number: number
  config: LevelConfig
}

// ─── Player profile ───────────────────────────────────────────────────────────
export type PlayerProfileResponse = {
  id:               string
  studentId:        string
  gameId:           string
  currentLevel:     number
  maxLevelReached:  number
  totalCoinsEarned: number
  totalCoinsSpent:  number
  totalSessions:    number
  bestScore:        number
  totalScore:       number
  lastPlayedAt:     string | null
}

// ─── Session ──────────────────────────────────────────────────────────────────
export type SessionOutcome = 'level_complete' | 'game_over' | 'abandoned'

export type GameSessionResponse = {
  id:            string
  studentId:     string
  gameId:        string
  startLevel:    number
  endLevel:      number | null
  finalScore:    number
  outcome:       SessionOutcome
  coinsEarned:   number
  coinsSpent:    number
  continuesUsed: number
  durationSec:   number | null
  startedAt:     string
  endedAt:       string | null
}

export type StartSessionInput = {
  gameId:     string
  startLevel: number
}

export type SessionEventType =
  | 'level_start' | 'level_complete' | 'continue_used'
  | 'game_over'   | 'bonus_earned'   | 'achievement_unlocked'

export type SessionEventInput = {
  type:     SessionEventType
  level:    number
  score:    number
  payload?: Record<string, unknown>
}

export type EndSessionInput = {
  endLevel:    number
  finalScore:  number
  outcome:     SessionOutcome
  durationSec: number
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export type LeaderboardEntryResponse = {
  id:          string
  gameId:      string
  studentId:   string
  studentName: string
  courseId:    string
  courseName:  string
  bestScore:   number
  maxLevel:    number
  coinsEarned: number
  period:      string            // 'YYYY-WNN'
}

// ─── Achievements ─────────────────────────────────────────────────────────────
export type AchievementConditionType =
  | 'reach_level' | 'score_session' | 'no_continues' | 'sessions_count'

export type AchievementResponse = {
  id:             string
  gameId:         string
  slug:           string
  title:          string
  description:    string
  iconEmoji:      string
  conditionType:  AchievementConditionType
  conditionValue: number
  coinReward:     number
  unlocked?:      boolean        // true when returned in player context
  unlockedAt?:    string | null
}

// ─── Internal API (Core ↔ api-games) ─────────────────────────────────────────
export type InternalGrantCoinsRequest = {
  studentId:      string
  amount:         number
  reason:         string
  sourceId:       string        // sessionId or achievementId
  sourceModule:   'games'
  idempotencyKey: string
}

export type InternalSpendCoinsRequest = {
  studentId:      string
  amount:         number
  reason:         string
  sourceId:       string
  idempotencyKey: string
}

export type InternalStudentResponse = {
  id:         string
  name:       string
  courseId:   string
  courseName: string
  coins:      number
  role:       string
}

export type InternalCoinOpResponse = {
  studentId:      string
  newBalance:     number
  idempotencyKey: string
  alreadyApplied: boolean  // true when idempotency key matched (no-op)
}
