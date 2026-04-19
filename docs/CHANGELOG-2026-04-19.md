# CHANGELOG — 2026-04-19

## feat(web): Games Library tab — Steam-style UI

Added the **Games** tab to the admin dashboard, wiring the web frontend to the
existing `api-games` service. Admins can browse the game catalogue and inspect
level tiers for each game.

### New files — `web/src/features/games/`

| File | Description |
|------|-------------|
| `domain/types.ts` | `GameViewModel`, `LevelViewModel`, `LevelTier`, `TIER_RANGES` |
| `infrastructure/games.service.ts` | `getAll`, `getBySlug`, `getLevels` — proxied to api-games |
| `application/games.mapper.ts` | `toViewModel` (adds `coinsAtMaxLevel`), `toLevelViewModel` (adds `tier`) |
| `application/useGames.ts` | State: load games, select game + load levels, clear selection |
| `ui/GamesSection.tsx` | Section shell — grid of cards or detail panel |
| `ui/components/GameCard.tsx` | Steam-style card: emoji cover, title, coins range, level count |
| `ui/components/GameDetailPanel.tsx` | Stats row + tier table + back navigation |
| `ui/components/TierTable.tsx` | 6 color-coded tier chips (Tutorial → Inferno) with boss indicator |

Tests: 21 unit tests — service ×3, mapper ×8, hook ×5, `getTier` ×5.

### Modified

| File | Change |
|------|--------|
| `web/next.config.js` | Add `/api-games/*` proxy rewrite → `GAMES_API_URL` (default: `http://localhost:4003`) |
| `web/src/config/routes.ts` | Add `API_ROUTES.GAMES.{BASE, BY_SLUG, LEVELS}` |
| `web/src/features/dashboard/domain/types.ts` | Add `'games'` to `AppTab` union |
| `web/src/features/dashboard/ui/DashboardPage.tsx` | `Gamepad2` icon tab in `FloatingNav`; `<GamesSection />` on `tab === 'games'` |

---

## fix(infra): api-games service infrastructure

Fixed the missing infrastructure that prevented api-games from running.

### New files

| File | Description |
|------|-------------|
| `api-games/.env` | Development env — `JWT_SECRET`, `INTERNAL_SECRET`, `CORE_API_URL`, `DATABASE_URL` |
| `api-games/Dockerfile` | Multi-stage Node 20-alpine image; compiles shared + api-games |
| `api-games/docker-entrypoint.sh` | `prisma db push` + seed + `node dist/main` |

### Modified

| File | Change |
|------|--------|
| `api/.env` | Added `INTERNAL_SECRET` (must match `api-games/.env`) |
| `docker-compose.yml` | Added `api-games` service with `games_data` volume; web depends on it; `GAMES_API_URL` injected into web |

### Database

`academic.db` created and seeded:
- `db:push` — created all 8 tables from `schema.prisma`
- `db:seed` — inserted Tank Invaders game + 30 levels (6 tiers)

---

## chore: CI workflow + api-games documentation

| File | Description |
|------|-------------|
| `.github/workflows/ci-api-games.yml` | CI: build shared → run vitest on api-games |
| `api-games/CLAUDE.md` | Full service documentation: how to run, architecture, endpoints, coins flow, integration plan |

---

## Pending (Fase 2+)

- `api-games/src/modules/profile/` — PlayerProfile per student+game
- `api-games/src/modules/session/` — StartSession, EndSession, RegisterEvent, UseContinue
- `api-games/src/modules/leaderboard/` — weekly per-course leaderboard
- `web/src/features/games/` — play page (iframe + postMessage integration with cbt-games)
- `docker-compose.yml` — serve `cbt-games/` static files (nginx or CDN)
