import { describe, it, expect } from 'vitest'
import { GamesMapper, getTier } from '../games.mapper'
import type { GameResponse, LevelResponse } from '@control-aula/shared'

const fakeGame: GameResponse = {
  id: 'g1', slug: 'tank-invaders', title: 'Tank Invaders',
  description: 'desc', coverUrl: '', iconEmoji: '🎮', isActive: true,
  maxLevels: 30, coinsPerLevelBase: 5, coinsPerLevelStep: 2,
  bonusCoins: 4, continueCost: 2, createdAt: '2026-01-01',
  emulatorCore: null, gameFileUrl: null, biosFileUrl: null,
}

const makeLevel = (number: number): LevelResponse => ({
  id: `l${number}`, gameId: 'g1', number,
  config: {
    formation: 'standard', speedMult: 1, fireRateMult: 1,
    enemyMix: { light: 1, medium: 0, heavy: 0 }, bunkerCount: 2,
    hasMysteryTank: false, specialEvent: 'none', isBoss: false,
    bossHits: 0, enemyCols: 8, enemyRows: 4,
  },
})

describe('getTier()', () => {
  it('returns Tutorial for levels 1–5',   () => expect(getTier(1)).toBe('Tutorial'))
  it('returns Tutorial for level 5',       () => expect(getTier(5)).toBe('Tutorial'))
  it('returns Normal for levels 6–10',    () => expect(getTier(6)).toBe('Normal'))
  it('returns Hard for levels 11–15',     () => expect(getTier(11)).toBe('Hard'))
  it('returns Elite for levels 16–20',    () => expect(getTier(16)).toBe('Elite'))
  it('returns Nightmare for levels 21–25',() => expect(getTier(21)).toBe('Nightmare'))
  it('returns Inferno for levels 26–30',  () => expect(getTier(26)).toBe('Inferno'))
  it('returns Inferno for level 30',       () => expect(getTier(30)).toBe('Inferno'))
})

describe('GamesMapper', () => {
  describe('toViewModel()', () => {
    it('spreads all original fields', () => {
      const vm = GamesMapper.toViewModel(fakeGame)
      expect(vm.id).toBe('g1')
      expect(vm.title).toBe('Tank Invaders')
      expect(vm.isActive).toBe(true)
    })

    it('computes coinsAtMaxLevel correctly — Tank Invaders level 30 = 63', () => {
      const vm = GamesMapper.toViewModel(fakeGame)
      // 5 + (30 - 1) * 2 = 5 + 58 = 63
      expect(vm.coinsAtMaxLevel).toBe(63)
    })

    it('computes coinsAtMaxLevel for level 1 game = coinsPerLevelBase', () => {
      const vm = GamesMapper.toViewModel({ ...fakeGame, maxLevels: 1 })
      expect(vm.coinsAtMaxLevel).toBe(5)
    })
  })

  describe('toLevelViewModel()', () => {
    it('spreads all original fields', () => {
      const vm = GamesMapper.toLevelViewModel(makeLevel(1))
      expect(vm.id).toBe('l1')
      expect(vm.number).toBe(1)
    })

    it('adds correct tier for each level range', () => {
      expect(GamesMapper.toLevelViewModel(makeLevel(3)).tier).toBe('Tutorial')
      expect(GamesMapper.toLevelViewModel(makeLevel(8)).tier).toBe('Normal')
      expect(GamesMapper.toLevelViewModel(makeLevel(13)).tier).toBe('Hard')
      expect(GamesMapper.toLevelViewModel(makeLevel(18)).tier).toBe('Elite')
      expect(GamesMapper.toLevelViewModel(makeLevel(23)).tier).toBe('Nightmare')
      expect(GamesMapper.toLevelViewModel(makeLevel(28)).tier).toBe('Inferno')
    })
  })

  describe('toEditForm()', () => {
    it('maps all editable fields from a GameViewModel', () => {
      const vm = GamesMapper.toViewModel(fakeGame)
      const form = GamesMapper.toEditForm(vm)
      expect(form.title).toBe('Tank Invaders')
      expect(form.description).toBe('desc')
      expect(form.iconEmoji).toBe('🎮')
      expect(form.coverUrl).toBe('')
      expect(form.isActive).toBe(true)
      expect(form.coinsPerLevelBase).toBe(5)
      expect(form.coinsPerLevelStep).toBe(2)
      expect(form.bonusCoins).toBe(4)
      expect(form.continueCost).toBe(2)
      expect(form.maxLevels).toBe(30)
    })

    it('does not include computed fields like coinsAtMaxLevel', () => {
      const vm = GamesMapper.toViewModel(fakeGame)
      const form = GamesMapper.toEditForm(vm)
      expect('coinsAtMaxLevel' in form).toBe(false)
    })
  })
})
