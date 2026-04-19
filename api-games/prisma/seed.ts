import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type LevelSeed = {
  number:        number
  speedMult:     number
  fireRateMult:  number
  enemyColsCount: number
  enemyRowsCount: number
  bunkerCount:   number
  hasMysteryTank: boolean
  specialEvent:  string
  isBoss:        boolean
  bossHits:      number
  enemyMixLight: number
  enemyMixMedium: number
  enemyMixHeavy: number
}

// Levels 1–5: Tutorial — slow speed, small formations, lots of bunkers
// Levels 6–10: Normal — moderate speed, bigger grids, occasional mystery
// Levels 11–15: Hard — faster, more medium/heavy, mystery tanks, boss at 15
// Levels 16–20: Elite — high speed, heavy-focused, boss at 20
// Levels 21–25: Nightmare — very fast, special events, boss at 25
// Levels 26–30: Inferno — extreme speed, full grids, boss at 30
const LEVELS: LevelSeed[] = [
  // ── Tutorial (1–5) ──────────────────────────────────────────────────────────
  { number:  1, speedMult: 0.80, fireRateMult: 0.80, enemyColsCount:  6, enemyRowsCount: 3, bunkerCount: 4, hasMysteryTank: false, specialEvent: 'none', isBoss: false, bossHits: 0, enemyMixLight: 80, enemyMixMedium: 15, enemyMixHeavy:  5 },
  { number:  2, speedMult: 0.85, fireRateMult: 0.85, enemyColsCount:  6, enemyRowsCount: 3, bunkerCount: 4, hasMysteryTank: false, specialEvent: 'none', isBoss: false, bossHits: 0, enemyMixLight: 80, enemyMixMedium: 15, enemyMixHeavy:  5 },
  { number:  3, speedMult: 0.90, fireRateMult: 0.90, enemyColsCount:  6, enemyRowsCount: 3, bunkerCount: 4, hasMysteryTank: false, specialEvent: 'none', isBoss: false, bossHits: 0, enemyMixLight: 75, enemyMixMedium: 20, enemyMixHeavy:  5 },
  { number:  4, speedMult: 0.95, fireRateMult: 0.90, enemyColsCount:  7, enemyRowsCount: 3, bunkerCount: 4, hasMysteryTank: false, specialEvent: 'none', isBoss: false, bossHits: 0, enemyMixLight: 75, enemyMixMedium: 20, enemyMixHeavy:  5 },
  { number:  5, speedMult: 1.00, fireRateMult: 0.95, enemyColsCount:  7, enemyRowsCount: 3, bunkerCount: 4, hasMysteryTank: false, specialEvent: 'none', isBoss: false, bossHits: 0, enemyMixLight: 70, enemyMixMedium: 25, enemyMixHeavy:  5 },
  // ── Normal (6–10) ───────────────────────────────────────────────────────────
  { number:  6, speedMult: 1.00, fireRateMult: 1.00, enemyColsCount:  7, enemyRowsCount: 4, bunkerCount: 3, hasMysteryTank: false, specialEvent: 'none', isBoss: false, bossHits: 0, enemyMixLight: 65, enemyMixMedium: 28, enemyMixHeavy:  7 },
  { number:  7, speedMult: 1.05, fireRateMult: 1.00, enemyColsCount:  7, enemyRowsCount: 4, bunkerCount: 3, hasMysteryTank: false, specialEvent: 'none', isBoss: false, bossHits: 0, enemyMixLight: 65, enemyMixMedium: 28, enemyMixHeavy:  7 },
  { number:  8, speedMult: 1.10, fireRateMult: 1.05, enemyColsCount:  8, enemyRowsCount: 4, bunkerCount: 3, hasMysteryTank:  true, specialEvent: 'none', isBoss: false, bossHits: 0, enemyMixLight: 60, enemyMixMedium: 30, enemyMixHeavy: 10 },
  { number:  9, speedMult: 1.15, fireRateMult: 1.05, enemyColsCount:  8, enemyRowsCount: 4, bunkerCount: 3, hasMysteryTank: false, specialEvent: 'none', isBoss: false, bossHits: 0, enemyMixLight: 60, enemyMixMedium: 30, enemyMixHeavy: 10 },
  { number: 10, speedMult: 1.20, fireRateMult: 1.10, enemyColsCount:  8, enemyRowsCount: 4, bunkerCount: 3, hasMysteryTank:  true, specialEvent: 'none', isBoss: false, bossHits: 0, enemyMixLight: 55, enemyMixMedium: 33, enemyMixHeavy: 12 },
  // ── Hard (11–15) ────────────────────────────────────────────────────────────
  { number: 11, speedMult: 1.30, fireRateMult: 1.15, enemyColsCount:  8, enemyRowsCount: 4, bunkerCount: 2, hasMysteryTank:  true, specialEvent: 'none',         isBoss: false, bossHits:  0, enemyMixLight: 50, enemyMixMedium: 35, enemyMixHeavy: 15 },
  { number: 12, speedMult: 1.35, fireRateMult: 1.20, enemyColsCount:  8, enemyRowsCount: 4, bunkerCount: 2, hasMysteryTank:  true, specialEvent: 'none',         isBoss: false, bossHits:  0, enemyMixLight: 45, enemyMixMedium: 38, enemyMixHeavy: 17 },
  { number: 13, speedMult: 1.40, fireRateMult: 1.25, enemyColsCount:  9, enemyRowsCount: 4, bunkerCount: 2, hasMysteryTank:  true, specialEvent: 'none',         isBoss: false, bossHits:  0, enemyMixLight: 40, enemyMixMedium: 40, enemyMixHeavy: 20 },
  { number: 14, speedMult: 1.45, fireRateMult: 1.25, enemyColsCount:  9, enemyRowsCount: 4, bunkerCount: 2, hasMysteryTank:  true, specialEvent: 'column_advance', isBoss: false, bossHits:  0, enemyMixLight: 35, enemyMixMedium: 43, enemyMixHeavy: 22 },
  { number: 15, speedMult: 1.50, fireRateMult: 1.30, enemyColsCount:  9, enemyRowsCount: 4, bunkerCount: 2, hasMysteryTank:  true, specialEvent: 'none',         isBoss:  true, bossHits:  5, enemyMixLight: 30, enemyMixMedium: 45, enemyMixHeavy: 25 },
  // ── Elite (16–20) ───────────────────────────────────────────────────────────
  { number: 16, speedMult: 1.55, fireRateMult: 1.35, enemyColsCount:  9, enemyRowsCount: 5, bunkerCount: 2, hasMysteryTank:  true, specialEvent: 'none',       isBoss: false, bossHits:  0, enemyMixLight: 25, enemyMixMedium: 45, enemyMixHeavy: 30 },
  { number: 17, speedMult: 1.60, fireRateMult: 1.40, enemyColsCount: 10, enemyRowsCount: 5, bunkerCount: 2, hasMysteryTank:  true, specialEvent: 'none',       isBoss: false, bossHits:  0, enemyMixLight: 20, enemyMixMedium: 45, enemyMixHeavy: 35 },
  { number: 18, speedMult: 1.70, fireRateMult: 1.45, enemyColsCount: 10, enemyRowsCount: 5, bunkerCount: 1, hasMysteryTank:  true, specialEvent: 'speed_burst', isBoss: false, bossHits:  0, enemyMixLight: 15, enemyMixMedium: 45, enemyMixHeavy: 40 },
  { number: 19, speedMult: 1.75, fireRateMult: 1.50, enemyColsCount: 10, enemyRowsCount: 5, bunkerCount: 1, hasMysteryTank:  true, specialEvent: 'none',       isBoss: false, bossHits:  0, enemyMixLight: 10, enemyMixMedium: 48, enemyMixHeavy: 42 },
  { number: 20, speedMult: 1.80, fireRateMult: 1.55, enemyColsCount: 10, enemyRowsCount: 5, bunkerCount: 1, hasMysteryTank:  true, specialEvent: 'none',       isBoss:  true, bossHits:  8, enemyMixLight: 10, enemyMixMedium: 45, enemyMixHeavy: 45 },
  // ── Nightmare (21–25) ───────────────────────────────────────────────────────
  { number: 21, speedMult: 1.85, fireRateMult: 1.60, enemyColsCount: 10, enemyRowsCount: 5, bunkerCount: 1, hasMysteryTank:  true, specialEvent: 'dive_bomb',      isBoss: false, bossHits:  0, enemyMixLight:  5, enemyMixMedium: 45, enemyMixHeavy: 50 },
  { number: 22, speedMult: 1.95, fireRateMult: 1.65, enemyColsCount: 11, enemyRowsCount: 5, bunkerCount: 1, hasMysteryTank:  true, specialEvent: 'none',           isBoss: false, bossHits:  0, enemyMixLight:  5, enemyMixMedium: 40, enemyMixHeavy: 55 },
  { number: 23, speedMult: 2.00, fireRateMult: 1.70, enemyColsCount: 11, enemyRowsCount: 5, bunkerCount: 1, hasMysteryTank:  true, specialEvent: 'blackout',       isBoss: false, bossHits:  0, enemyMixLight:  5, enemyMixMedium: 35, enemyMixHeavy: 60 },
  { number: 24, speedMult: 2.10, fireRateMult: 1.75, enemyColsCount: 11, enemyRowsCount: 5, bunkerCount: 0, hasMysteryTank:  true, specialEvent: 'column_advance', isBoss: false, bossHits:  0, enemyMixLight:  0, enemyMixMedium: 38, enemyMixHeavy: 62 },
  { number: 25, speedMult: 2.20, fireRateMult: 1.80, enemyColsCount: 11, enemyRowsCount: 5, bunkerCount: 0, hasMysteryTank:  true, specialEvent: 'none',           isBoss:  true, bossHits: 12, enemyMixLight:  0, enemyMixMedium: 35, enemyMixHeavy: 65 },
  // ── Inferno (26–30) ─────────────────────────────────────────────────────────
  { number: 26, speedMult: 2.30, fireRateMult: 1.90, enemyColsCount: 11, enemyRowsCount: 6, bunkerCount: 0, hasMysteryTank:  true, specialEvent: 'none',       isBoss: false, bossHits:  0, enemyMixLight: 0, enemyMixMedium: 30, enemyMixHeavy: 70 },
  { number: 27, speedMult: 2.45, fireRateMult: 2.00, enemyColsCount: 12, enemyRowsCount: 6, bunkerCount: 0, hasMysteryTank:  true, specialEvent: 'dive_bomb',   isBoss: false, bossHits:  0, enemyMixLight: 0, enemyMixMedium: 25, enemyMixHeavy: 75 },
  { number: 28, speedMult: 2.60, fireRateMult: 2.10, enemyColsCount: 12, enemyRowsCount: 6, bunkerCount: 0, hasMysteryTank:  true, specialEvent: 'speed_burst', isBoss: false, bossHits:  0, enemyMixLight: 0, enemyMixMedium: 20, enemyMixHeavy: 80 },
  { number: 29, speedMult: 2.70, fireRateMult: 2.20, enemyColsCount: 12, enemyRowsCount: 6, bunkerCount: 0, hasMysteryTank:  true, specialEvent: 'blackout',    isBoss: false, bossHits:  0, enemyMixLight: 0, enemyMixMedium: 15, enemyMixHeavy: 85 },
  { number: 30, speedMult: 2.80, fireRateMult: 2.30, enemyColsCount: 12, enemyRowsCount: 6, bunkerCount: 0, hasMysteryTank:  true, specialEvent: 'none',        isBoss:  true, bossHits: 20, enemyMixLight: 0, enemyMixMedium: 10, enemyMixHeavy: 90 },
]

async function main() {
  console.log('Seeding Tank Invaders game...')

  const game = await prisma.game.upsert({
    where:  { slug: 'tank-invaders' },
    update: {
      title:             'Tank Invaders',
      description:       'A Space Invaders clone using tanks. Destroy all enemy tanks before they reach you!',
      iconEmoji:         '🎯',
      isActive:          true,
      maxLevels:         30,
      coinsPerLevelBase: 5,
      coinsPerLevelStep: 2,
      bonusCoins:        4,
      continueCost:      2,
    },
    create: {
      slug:              'tank-invaders',
      title:             'Tank Invaders',
      description:       'A Space Invaders clone using tanks. Destroy all enemy tanks before they reach you!',
      iconEmoji:         '🎯',
      isActive:          true,
      maxLevels:         30,
      coinsPerLevelBase: 5,
      coinsPerLevelStep: 2,
      bonusCoins:        4,
      continueCost:      2,
    },
  })

  console.log(`Game upserted: ${game.slug} (id: ${game.id})`)

  // Delete existing levels for this game, then recreate
  await prisma.level.deleteMany({ where: { gameId: game.id } })
  console.log('Existing levels deleted.')

  const levelData = LEVELS.map(l => ({ ...l, gameId: game.id }))
  await prisma.level.createMany({ data: levelData })

  console.log(`Created ${LEVELS.length} levels for ${game.title}.`)

  // ── DOOM ──────────────────────────────────────────────────────────────────
  // DOOM runs via js-dos in the browser. The level system does not apply —
  // the game manages its own progression (4 episodes × 9 maps).
  // Coins are awarded per play session rather than per in-game level.
  console.log('Seeding DOOM...')
  await prisma.game.upsert({
    where:  { slug: 'doom' },
    update: {
      title:             'DOOM',
      description:       'The classic 1993 first-person shooter. Fight through demon-infested levels across four episodes. Save data persists in your browser.',
      iconEmoji:         '💀',
      isActive:          true,
      maxLevels:         36,
      coinsPerLevelBase: 8,
      coinsPerLevelStep: 1,
      bonusCoins:        5,
      continueCost:      0,
    },
    create: {
      slug:              'doom',
      title:             'DOOM',
      description:       'The classic 1993 first-person shooter. Fight through demon-infested levels across four episodes. Save data persists in your browser.',
      iconEmoji:         '💀',
      isActive:          true,
      maxLevels:         36,
      coinsPerLevelBase: 8,
      coinsPerLevelStep: 1,
      bonusCoins:        5,
      continueCost:      0,
    },
  })
  console.log('DOOM seeded.')
  console.log('Seed complete.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
