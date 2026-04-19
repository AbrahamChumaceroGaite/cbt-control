# CLAUDE.md — api-games
# Servicio de Juegos — cbt-control-aula monorepo

> Lee este archivo antes de tocar cualquier código en api-games/.
> Este servicio sigue exactamente las mismas reglas de arquitectura que api/,
> documentadas en el CLAUDE.md raíz del monorepo.

---

## ¿Qué es api-games?

Servicio NestJS independiente (puerto **4003**) que gestiona el catálogo de
juegos educativos, sesiones de juego, perfiles de jugador, leaderboards y
logros. Nunca toca la BD del Core (`api/`) directamente — se comunica a través
del endpoint interno protegido.

```
cbt-games/          ← Juego Tank Invaders (vanilla JS/HTML5) — ejecutado en el navegador
api-games/          ← Backend del ecosistema games (este servicio)
api/                ← Core: coins, estudiantes, cursos — puerto 4001
web/                ← Frontend Next.js — puerto 3001
```

---

## Cómo correr en desarrollo

### 1. Variables de entorno

```bash
cp api-games/.env.example api-games/.env
```

Editar `api-games/.env`:
```
PORT=4003
NODE_ENV=development
JWT_SECRET="cbt-control-aula-jwt-secret-change-in-prod"  # DEBE ser igual al de api/.env
CORE_API_URL=http://localhost:4001
INTERNAL_SECRET="tu-secreto-compartido"                  # DEBE ser igual al de api/.env
DATABASE_URL="file:./prisma/academic.db"
```

> **CRÍTICO:** `JWT_SECRET` e `INTERNAL_SECRET` deben ser idénticos en `api/.env`
> y `api-games/.env`. Si no coinciden, los tokens JWT fallan y las llamadas internas
> devuelven 401.

### 2. Instalar dependencias

```bash
# Desde la raíz del monorepo:
npm install
```

### 3. Crear y poblar la base de datos

```bash
# Desde api-games/ o con -w:
cd api-games
npx prisma db push          # crea academic.db con todas las tablas
npx ts-node prisma/seed.ts  # inserta Tank Invaders + 30 niveles
```

O desde la raíz:
```bash
npm run db:push -w @control-aula/api-games
npm run db:seed -w @control-aula/api-games
```

### 4. Levantar el servicio

```bash
# Desarrollo (watch mode):
npm run dev:api-games

# Producción:
npm run build:api-games
node api-games/dist/main.js
```

### 5. Verificar que funciona

```bash
curl http://localhost:4003/api/games
# Debe devolver: { code: 200, status: "success", data: [...] }
```

---

## Base de datos (SQLite — academic.db)

```
api-games/prisma/
├── schema.prisma     ← 7 modelos
├── seed.ts           ← Tank Invaders + 30 niveles
└── academic.db       ← generado por prisma db push (gitignored)
```

### Modelos

| Modelo | Descripción |
|--------|------------|
| `Game` | Catálogo de juegos (Tank Invaders, futuros juegos) |
| `Level` | Configuración de los 30 niveles por juego |
| `PlayerProfile` | Progreso del estudiante por juego (nivel actual, max alcanzado, coins ganados) |
| `GameSession` | Una sesión = un intento de nivel (inicio, fin, score, coins, continúas usados) |
| `SessionEvent` | Eventos dentro de una sesión (kill, bonus, game_over, etc.) |
| `LeaderboardEntry` | Ranking semanal por curso |
| `Achievement` | Definición de logros por juego |
| `PlayerAchievement` | Logros desbloqueados por estudiante |

---

## Arquitectura del módulo

```
api-games/src/
├── main.ts                          ← Puerto 4003, ValidationPipe, GlobalExceptionFilter
├── app.module.ts                    ← ConfigModule, PrismaModule, CoreClientModule, GameModule, LevelModule
├── common/
│   ├── filters/global-exception.filter.ts     ← HTTP exceptions → { code, status, data, message }
│   ├── interceptors/transform.interceptor.ts   ← Wraps respuestas exitosas en IApiResponse<T>
│   ├── guards/jwt-auth.guard.ts                ← Verifica cookie cbt_session o Bearer token
│   ├── guards/roles.guard.ts                   ← Verifica @Roles() en el controlador
│   ├── decorators/roles.decorator.ts
│   ├── decorators/response-message.decorator.ts
│   └── constants/roles.ts                      ← ROLES.ADMIN | TEACHER | STUDENT
├── infrastructure/
│   └── prisma/                                 ← PrismaService (global) — academic.db
└── core-client/
    ├── student.client.ts    ← GET /internal/student/:id — obtiene perfil del Core
    ├── coins.client.ts      ← POST /internal/coins/grant y /spend — transfiere coins
    └── core-client.module.ts (global)
```

### Módulos de dominio

```
modules/
├── game/      ← Catálogo CRUD (admin); GET público para el menú de juegos
└── level/     ← Consulta de configuración de niveles (read-only, público)
```

**Módulos pendientes de implementar (Fase 2+):**
```
modules/
├── profile/   ← GET/crear PlayerProfile por estudiante + juego
├── session/   ← StartSession, EndSession, RegisterEvent, UseContinue
├── leaderboard/ ← Ranking semanal por curso
└── achievement/ ← Definición y desbloqueo de logros
```

---

## Endpoints disponibles

### Públicos (sin auth)
```
GET  /api/games                    → Lista todos los juegos activos
GET  /api/games/:slug              → Detalle de un juego por slug
GET  /api/games/:gameId/levels     → Lista los 30 niveles del juego
```

### Admin (requiere JWT con role=admin)
```
POST   /api/games                  → Crear nuevo juego en el catálogo
PATCH  /api/games/:id              → Actualizar juego (activar/desactivar, cambiar cover, etc.)
```

---

## Flujo de coins (arquitectura)

El juego **nunca modifica coins directamente en la BD del Core**. Siempre pasa
por el endpoint interno:

```
1. Estudiante completa nivel N en Tank Invaders (cbt-games, navegador)
2. Web frontend (o cbt-games via postMessage) → api-games POST /api/sessions/:id/end
3. api-games calcula coins: game.coinsForLevel(N) + bonus_if_earned
4. api-games → POST http://localhost:4001/internal/coins/grant
      { studentId, amount, reason, sourceModule: 'games', sourceId: sessionId,
        idempotencyKey: sessionId }
5. Core actualiza student.coins y crea CoinLog inmutable
6. api-games devuelve { newBalance, alreadyApplied } al frontend
7. Frontend actualiza la UI con el nuevo balance

Continuar nivel:
3b. api-games → POST http://localhost:4001/internal/coins/spend
      { studentId, amount: 2, reason: 'Continue', sourceId: sessionId,
        idempotencyKey: `${sessionId}-continue-${count}` }
```

**Idempotencia:** Cada operación tiene un `idempotencyKey` único. Si la petición
se repite (retry, reconexión), el Core detecta el key en `CoinLog.reason` y
devuelve el balance actual sin aplicar de nuevo — `alreadyApplied: true`.

**Admins/profesores infinitos:** `StudentClient.getStudent()` devuelve `role`.
Si `role !== 'student'`, api-games salta el check de saldo y otorga lives
ilimitadas — nunca llama a `/internal/coins/spend`.

---

## Fórmula de coins por nivel

```typescript
// game.coinsForLevel(level: number)
coins = coinsPerLevelBase + (level - 1) * coinsPerLevelStep
// Tank Invaders: base=5, step=2
// Nivel  1 →  5 coins
// Nivel  2 →  7 coins
// Nivel 10 → 23 coins
// Nivel 20 → 43 coins
// Nivel 30 → 63 coins

// + hasta 4 coins de bonus (tiempo + score)
// Cada continúa cuesta 2 coins al estudiante
```

---

## Cómo se integra con Tank Invaders (cbt-games)

El juego existe en `cbt-games/` como HTML5 vanilla JS. La integración con el
frontend web se hace mediante **iframe + postMessage**:

```
web/app/(main)/games/[slug]/play/page.tsx   ← Página que embebe el iframe
  │
  ├── <iframe src="/games/tank-invaders/index.html" />
  │     ↑ cbt-games/ debe ser servido como estáticos (Fase 2)
  │
  └── window.addEventListener('message', handler)
        Escucha eventos del juego:
        - { type: 'LEVEL_COMPLETE', level, score, time }
        - { type: 'GAME_OVER', level, score }
        - { type: 'CONTINUE_REQUESTED' }
        - { type: 'SESSION_START', gameSlug }

cbt-games/src/main.js  (modificar en Fase 2):
  window.parent.postMessage({ type: 'LEVEL_COMPLETE', level, score, time }, '*')
```

**El flujo completo (Fase 2):**
```
1. Estudiante abre /games → ve menú Steam-style con todas las cards
2. Click en Tank Invaders → /games/tank-invaders → descripción + niveles
3. Click "Jugar" → POST /api/sessions (crea GameSession) → /games/tank-invaders/play
4. Página play embebe iframe con el juego
5. Juego envía eventos via postMessage
6. Frontend llama api-games para registrar eventos, ganar coins, usar continúas
7. Al terminar → score final, coins ganados, leaderboard actualizado
```

---

## 30 Niveles — Tank Invaders

| Tier | Niveles | Velocidad | Boss | Eventos especiales |
|------|---------|-----------|------|--------------------|
| Tutorial | 1–5 | 0.80–1.00 | ✗ | — |
| Normal | 6–10 | 1.00–1.20 | ✗ | mystery tank en 8 y 10 |
| Hard | 11–15 | 1.30–1.50 | ✓ @15 (5 hits) | column_advance en 14 |
| Elite | 16–20 | 1.55–1.80 | ✓ @20 (8 hits) | speed_burst en 18 |
| Nightmare | 21–25 | 1.85–2.20 | ✓ @25 (12 hits) | dive_bomb@21, blackout@23 |
| Inferno | 26–30 | 2.30–2.80 | ✓ @30 (20 hits) | dive_bomb@27, speed_burst@28, blackout@29 |

---

## Cómo acceder (estado actual vs pendiente)

### ✅ LISTO — Backend
- `GET /api/games` devuelve Tank Invaders (una vez seeded)
- `GET /api/games/tank-invaders` devuelve detalle del juego
- `GET /api/games/:gameId/levels` devuelve los 30 niveles con su configuración
- El Core acepta `POST /internal/coins/grant` y `/spend` con `X-Internal-Secret`

### ⬜ PENDIENTE — Para que el menú y el juego funcionen (Fase 2)

1. **Frontend — `/games` route** en `web/`:
   ```
   web/src/features/games/           ← feature completa
   web/src/app/(main)/games/         ← páginas: index, [slug], [slug]/play
   ```

2. **Módulos api-games** pendientes:
   - `modules/profile/` — GET/crear PlayerProfile
   - `modules/session/` — StartSession, EndSession, RegisterEvent, UseContinue
   - `modules/leaderboard/` — ranking semanal

3. **cbt-games integración** — añadir `postMessage` al juego de tanques

4. **Servir cbt-games** — como estáticos (nginx, next public, o CDN)

5. **Panel admin** en web — subir cover, activar/desactivar juegos (`PATCH /api/games/:id`)

---

## Tests

```bash
# Desde la raíz del monorepo:
node_modules/.bin/vitest run --config api-games/vitest.config.ts

# Con cobertura:
node_modules/.bin/vitest run --config api-games/vitest.config.ts --coverage
```

**Estado actual:** 5 archivos, 24 tests — todos pasando.

```
modules/game/domain/__tests__/game.entity.spec.ts     ← 20 tests (validaciones + coinsForLevel)
modules/game/application/__tests__/game.mapper.spec.ts
modules/game/application/__tests__/create-game.handler.spec.ts
modules/level/application/__tests__/level.mapper.spec.ts
modules/level/application/__tests__/get-levels.handler.spec.ts
```

---

## Reglas de arquitectura (específicas de api-games)

Las mismas reglas del CLAUDE.md raíz aplican. Adicionalmente:

1. **`CoreClientModule` es global** — inyectar `StudentClient` o `CoinsClient` en cualquier
   handler sin importar el módulo explícitamente.

2. **`PrismaModule` es global** — inyectar `PrismaService` directamente donde sea necesario.

3. **Nunca importar desde `api/`** — cero dependencias de código entre api/ y api-games/.
   Solo comparten `@control-aula/shared` (tipos).

4. **Idempotency key obligatorio** en toda llamada a `CoinsClient.grant()` y `.spend()`.
   Formato recomendado: `${sessionId}-level-${levelNumber}` para grants,
   `${sessionId}-continue-${count}` para spends.

5. **El rol del usuario define el comportamiento:**
   - `role === 'student'` → límite real de coins, lives limitadas
   - `role === 'teacher'` o `'admin'` → getStudent() pero no gastar coins, vidas infinitas
