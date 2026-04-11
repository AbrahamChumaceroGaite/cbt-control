# CBT-CONTROL — Plan de Expansión de Módulos
## Academic + Games como servicios internos del monorepo

> Documento de arquitectura, base de datos y plan de acción.
> Versión: 1.0 — Fecha: 2026-04-11
> Estado: BORRADOR — pendiente de aprobación antes de implementar.

---

## Índice

1. [Visión general y decisión arquitectónica](#1-visión-general-y-decisión-arquitectónica)
2. [Estructura del monorepo](#2-estructura-del-monorepo)
3. [Bases de datos — Schemas profesionales](#3-bases-de-datos--schemas-profesionales)
   - 3.1 [Core DB (existente)](#31-core-db-existente--referencia)
   - 3.2 [Academic DB](#32-academic-db--api-academic)
   - 3.3 [Games DB](#33-games-db--api-games)
4. [Comunicación entre servicios](#4-comunicación-entre-servicios)
5. [Arquitectura de API (NestJS)](#5-arquitectura-de-api-nestjs)
6. [Arquitectura Frontend (Next.js)](#6-arquitectura-frontend-nextjs)
7. [Branch strategy y CI/CD](#7-branch-strategy-y-cicd)
8. [Plan de acción por fases](#8-plan-de-acción-por-fases)
9. [Refactor CVA — Componentes UI](#9-refactor-cva--componentes-ui)

---

## 1. Visión general y decisión arquitectónica

### El contexto

`cbt-control-aula` es un monorepo npm workspaces con tres paquetes:
- `api/` — NestJS, puerto 4001, SQLite via Prisma
- `web/` — Next.js 14 App Router
- `shared/` — tipos compartidos `@control-aula/shared`

Se quieren agregar **dos módulos independientes**:
- **Academic** — materias, unidades, actividades, tareas; otorgan coins
- **Games** — juegos educativos; consumen y otorgan coins

### Decisión: Módulos NestJS internos con BD propia por servicio

Se descarta microservicios reales (repos separados, API gateway, mTLS, service mesh) porque:
- El equipo es pequeño y el overhead operacional no se justifica
- Un solo `docker-compose` y un solo pipeline es más robusto en esta etapa
- SQLite (y en el futuro PostgreSQL) permite múltiples archivos de BD en el mismo host

**Lo que SÍ se hace:**
- Cada módulo corre en su **propio proceso NestJS** (puerto separado)
- Cada módulo tiene su **propio `schema.prisma`** y su propia BD
- Los módulos **nunca acceden directamente** a la BD del Core — consumen su API HTTP
- El frontend tiene **rutas separadas** por módulo bajo el mismo dominio
- Las branches son **totalmente aisladas** — nunca tocan `api/src/` ni los features core de `web/`

```
┌─────────────────────────────────────────────────────┐
│                  CBT-CONTROL (monorepo)              │
│                                                     │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │   api/   │   │ api-academic/│   │  api-games/ │ │
│  │ :4001    │   │ :4002        │   │  :4003      │ │
│  │ core.db  │   │ academic.db  │   │  games.db   │ │
│  └────┬─────┘   └──────┬───────┘   └──────┬──────┘ │
│       │                │                  │         │
│       │◄───────────────┘──────────────────┘         │
│       │          HTTP (internal only)               │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │                    web/ (:3000)                 ││
│  │  /           → Core (coins, rewards, bank)      ││
│  │  /portal     → Student portal (core)            ││
│  │  /academic   → Academic module                  ││
│  │  /games      → Games module                     ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

---

## 2. Estructura del monorepo

```
cbt-control-aula/
│
├── api/                              ← Core (existente, no se toca)
│   ├── prisma/schema.prisma
│   └── src/modules/
│       ├── action/, reward/, user/, course/, ...
│
├── api-academic/                     ← NUEVO — servicio académico
│   ├── package.json                  ← name: "@control-aula/api-academic"
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── vitest.config.ts
│   ├── prisma/
│   │   ├── schema.prisma             ← BD académica
│   │   └── migrations/
│   └── src/
│       ├── main.ts                   ← listen on 4002
│       ├── app.module.ts
│       ├── common/
│       │   ├── constants/
│       │   ├── guards/               ← Re-usa JwtStrategy, valida token del Core
│       │   └── interceptors/
│       ├── core-client/              ← HTTP client hacia api/:4001
│       │   ├── core-client.module.ts
│       │   ├── users.client.ts       ← GET /api/usuarios/:id
│       │   └── coins.client.ts       ← POST /api/coins/grant (endpoint nuevo en Core)
│       └── modules/
│           ├── subject/              ← Materias
│           ├── unit/                 ← Unidades
│           ├── activity/             ← Actividades/Tareas/Quizzes
│           ├── submission/           ← Entregas de alumnos
│           ├── grade/                ← Calificaciones
│           └── enrollment/           ← Inscripción a materias
│
├── api-games/                        ← NUEVO — servicio de juegos
│   ├── package.json                  ← name: "@control-aula/api-games"
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── vitest.config.ts
│   ├── prisma/
│   │   ├── schema.prisma             ← BD de juegos
│   │   └── migrations/
│   └── src/
│       ├── main.ts                   ← listen on 4003
│       ├── app.module.ts
│       ├── core-client/
│       │   ├── users.client.ts
│       │   └── coins.client.ts
│       └── modules/
│           ├── game/                 ← Catálogo de juegos
│           ├── session/              ← Partidas individuales
│           ├── leaderboard/          ← Rankings por curso/global
│           ├── achievement/          ← Logros desbloqueables
│           └── coin-event/           ← Log de coins ganados en juegos
│
├── web/                              ← Frontend (existente)
│   └── src/
│       ├── app/
│       │   ├── (core)/               ← Rutas actuales (no se tocan)
│       │   ├── academic/             ← NUEVO: /academic/**
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx          ← Dashboard académico
│       │   │   ├── subjects/[id]/
│       │   │   └── admin/            ← Panel admin académico
│       │   └── games/                ← NUEVO: /games/**
│       │       ├── layout.tsx
│       │       ├── page.tsx          ← Lobby de juegos
│       │       └── [gameId]/
│       ├── features/
│       │   ├── (core features actuales — no se tocan)
│       │   ├── academic/             ← NUEVO feature slice
│       │   │   ├── domain/types.ts
│       │   │   ├── infrastructure/
│       │   │   │   ├── subject.service.ts
│       │   │   │   ├── unit.service.ts
│       │   │   │   └── activity.service.ts
│       │   │   ├── application/
│       │   │   │   ├── useSubjects.ts
│       │   │   │   ├── useUnits.ts
│       │   │   │   └── useActivity.ts
│       │   │   └── ui/
│       │   │       ├── SubjectCard.tsx
│       │   │       ├── UnitAccordion.tsx
│       │   │       └── ActivityList.tsx
│       │   └── games/                ← NUEVO feature slice
│       │       ├── domain/types.ts
│       │       ├── infrastructure/
│       │       ├── application/
│       │       └── ui/
│       └── config/
│           └── routes.ts             ← Agregar ACADEMIC_ROUTES y GAMES_ROUTES
│
├── shared/                           ← Tipos compartidos (existente)
│   └── src/
│       ├── types/ (existentes)
│       ├── academic.ts               ← NUEVO: tipos Academic exportados
│       └── games.ts                  ← NUEVO: tipos Games exportados
│
├── package.json                      ← Agregar workspaces: api-academic, api-games
└── docker-compose.yml                ← Agregar servicios academic y games
```

---

## 3. Bases de datos — Schemas profesionales

### 3.1 Core DB (existente — referencia)

Las entidades clave que los módulos Academic y Games referencian **por ID lógico**
(nunca por FK directa — son BDs distintas):

```
User        { id, name, email, role, avatarUrl, coins, courseId }
Course      { id, name, code, isActive }
CoinLog     { id, studentId, amount, type, sourceId, sourceType }
```

El Core expondrá un endpoint interno nuevo:
```
POST /internal/coins/grant
Body: { studentId, amount, reason, sourceId, sourceModule: 'academic' | 'games' }
Authorization: Bearer <INTERNAL_SECRET>
```

---

### 3.2 Academic DB — `api-academic`

#### Diseño conceptual

```
Subject (Materia) ─── pertenece a un Course (ID lógico del Core)
  └── Unit (Unidad) ─── ordenada dentro de la materia
        └── Activity (Actividad) ─── puede ser TASK | QUIZ | ASSIGNMENT | RESOURCE
              ├── ActivityAttachment (archivos adjuntos del profesor)
              └── Submission (Entrega del alumno)
                    ├── SubmissionAttachment (archivos del alumno)
                    └── Grade (Calificación con rubrica)

Enrollment ─── alumno inscripto a una materia (studentId del Core)
Progress   ─── progreso del alumno por unidad (% completado)
```

#### Schema Prisma completo

```prisma
// api-academic/prisma/schema.prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../node_modules/.prisma/academic-client"
  binaryTargets = ["native"]
}

datasource db {
  provider = "sqlite"
  url      = env("ACADEMIC_DATABASE_URL")
}

// ─────────────────────────────────────────────
// CATÁLOGO ACADÉMICO
// ─────────────────────────────────────────────

model Subject {
  id          String   @id @default(uuid())
  courseId    String                          // FK lógica → Core.Course.id
  name        String
  description String?
  iconEmoji   String   @default("📚")
  colorHex    String   @default("#6366f1")    // Color de la materia para la UI
  isActive    Boolean  @default(true)
  order       Int      @default(0)
  createdById String                          // FK lógica → Core.User.id (admin)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  units       Unit[]
  enrollments Enrollment[]

  @@index([courseId])
  @@index([courseId, isActive])
}

model Unit {
  id          String   @id @default(uuid())
  subjectId   String
  subject     Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  title       String
  description String?
  order       Int                              // Orden dentro de la materia
  isPublished Boolean  @default(false)         // El admin controla visibilidad
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  activities  Activity[]
  progress    UnitProgress[]

  @@index([subjectId])
  @@index([subjectId, order])
}

model Activity {
  id             String       @id @default(uuid())
  unitId         String
  unit           Unit         @relation(fields: [unitId], references: [id], onDelete: Cascade)
  title          String
  description    String?
  type           ActivityType
  order          Int
  isPublished    Boolean      @default(false)
  publishedAt    DateTime?

  // Configuración de coins
  coinsReward    Int          @default(0)      // Coins al completar/aprobar
  coinsOnSubmit  Int          @default(0)      // Coins solo por entregar (≤ coinsReward)

  // Configuración de plazos
  dueDate        DateTime?
  allowLate      Boolean      @default(false)
  latePenaltyPct Float        @default(0)      // % de penalización si entrega tarde (0-100)

  // Configuración de evaluación
  maxScore       Float        @default(100)
  passingScore   Float        @default(60)     // Puntaje mínimo para ganar coins completos
  maxAttempts    Int          @default(1)      // Máximo de intentos de entrega
  isGraded       Boolean      @default(true)

  // Configuración de Quiz (solo si type = QUIZ)
  timeLimit      Int?                          // Minutos para completar el quiz
  shuffleItems   Boolean      @default(false)

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  attachments    ActivityAttachment[]
  submissions    Submission[]

  @@index([unitId])
  @@index([unitId, order])
  @@index([dueDate])
}

enum ActivityType {
  TASK        // Tarea de texto libre
  ASSIGNMENT  // Entrega de archivo
  QUIZ        // Cuestionario con preguntas
  RESOURCE    // Material de lectura (sin entrega)
  DISCUSSION  // Foro de discusión
}

model ActivityAttachment {
  id         String   @id @default(uuid())
  activityId String
  activity   Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  name       String
  url        String
  mimeType   String
  sizeBytes  Int
  createdAt  DateTime @default(now())

  @@index([activityId])
}

// ─────────────────────────────────────────────
// QUIZ ENGINE
// ─────────────────────────────────────────────

model QuizQuestion {
  id         String       @id @default(uuid())
  activityId String                              // FK → Activity (type=QUIZ)
  text       String
  type       QuestionType
  order      Int
  points     Float        @default(1)
  imageUrl   String?

  options    QuizOption[]
  answers    QuizAnswer[]

  @@index([activityId])
}

enum QuestionType {
  SINGLE_CHOICE    // Una opción correcta
  MULTIPLE_CHOICE  // Varias opciones correctas
  TRUE_FALSE
  SHORT_TEXT       // Revisión manual
}

model QuizOption {
  id         String       @id @default(uuid())
  questionId String
  question   QuizQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  text       String
  isCorrect  Boolean      @default(false)
  order      Int

  @@index([questionId])
}

// ─────────────────────────────────────────────
// ENTREGAS Y CALIFICACIONES
// ─────────────────────────────────────────────

model Submission {
  id           String           @id @default(uuid())
  activityId   String
  activity     Activity         @relation(fields: [activityId], references: [id], onDelete: Cascade)
  studentId    String                               // FK lógica → Core.User.id
  attemptNumber Int             @default(1)
  status       SubmissionStatus @default(DRAFT)
  textContent  String?                              // Para TASK y DISCUSSION
  submittedAt  DateTime?
  isLate       Boolean          @default(false)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  attachments  SubmissionAttachment[]
  quizAnswers  QuizAnswer[]
  grade        Grade?

  @@unique([activityId, studentId, attemptNumber])
  @@index([activityId])
  @@index([studentId])
  @@index([status])
}

enum SubmissionStatus {
  DRAFT       // Borrador (el alumno aún no entregó)
  SUBMITTED   // Entregado, esperando revisión
  REVIEWING   // El docente está revisando
  GRADED      // Calificado
  RETURNED    // Devuelto al alumno para re-entrega
}

model SubmissionAttachment {
  id           String     @id @default(uuid())
  submissionId String
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  name         String
  url          String
  mimeType     String
  sizeBytes    Int
  createdAt    DateTime   @default(now())

  @@index([submissionId])
}

model QuizAnswer {
  id           String       @id @default(uuid())
  submissionId String
  submission   Submission   @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  questionId   String
  question     QuizQuestion @relation(fields: [questionId], references: [id])
  selectedOptionIds String  // JSON array de IDs seleccionados
  textAnswer   String?      // Para SHORT_TEXT
  isCorrect    Boolean?     // null = pendiente revisión manual
  pointsEarned Float?

  @@unique([submissionId, questionId])
  @@index([submissionId])
}

model Grade {
  id             String     @id @default(uuid())
  submissionId   String     @unique
  submission     Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  gradedById     String                             // FK lógica → Core.User.id (docente/admin)
  score          Float                              // 0 - activity.maxScore
  feedback       String?
  coinsGranted   Int        @default(0)             // Coins efectivamente otorgados
  coinsGrantedAt DateTime?
  gradedAt       DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  @@index([gradedById])
}

// ─────────────────────────────────────────────
// INSCRIPCIÓN Y PROGRESO
// ─────────────────────────────────────────────

model Enrollment {
  id          String           @id @default(uuid())
  subjectId   String
  subject     Subject          @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  studentId   String                                // FK lógica → Core.User.id
  enrolledAt  DateTime         @default(now())
  status      EnrollmentStatus @default(ACTIVE)
  droppedAt   DateTime?

  unitProgress UnitProgress[]

  @@unique([subjectId, studentId])
  @@index([studentId])
  @@index([subjectId])
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  DROPPED
}

model UnitProgress {
  id           String     @id @default(uuid())
  enrollmentId String
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  unitId       String
  unit         Unit       @relation(fields: [unitId], references: [id], onDelete: Cascade)
  completedPct Float      @default(0)               // 0-100 calculado automáticamente
  startedAt    DateTime   @default(now())
  completedAt  DateTime?

  @@unique([enrollmentId, unitId])
  @@index([enrollmentId])
}
```

---

### 3.3 Games DB — `api-games`

#### Diseño conceptual

```
Game (Catálogo) ─── define el juego, reglas, rewards
  └── GameSession ─── una partida de un alumno
        ├── SessionEvent ─── eventos en tiempo real (movimientos, puntos)
        └── SessionResult ─── resultado final + coins ganados

Leaderboard ─── vista materializada: ranking por juego + curso
Achievement ─── logros: condiciones que al cumplirse desbloquean badges + coins
PlayerAchievement ─── logro desbloqueado por un alumno
```

#### Schema Prisma completo

```prisma
// api-games/prisma/schema.prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../node_modules/.prisma/games-client"
  binaryTargets = ["native"]
}

datasource db {
  provider = "sqlite"
  url      = env("GAMES_DATABASE_URL")
}

// ─────────────────────────────────────────────
// CATÁLOGO DE JUEGOS
// ─────────────────────────────────────────────

model Game {
  id            String      @id @default(uuid())
  slug          String      @unique            // Identificador técnico: "word-scramble"
  name          String
  description   String?
  thumbnailUrl  String?
  type          GameType
  status        GameStatus  @default(DRAFT)

  // Configuración de coins
  coinsPerWin   Int         @default(0)        // Coins por ganar
  coinsPerPlay  Int         @default(0)        // Coins por jugar (independiente del resultado)
  maxCoinsDaily Int         @default(0)        // Límite diario de coins ganables (0 = sin límite)

  // Configuración de mecánica
  config        String                         // JSON: parámetros específicos del juego
  minPlayers    Int         @default(1)
  maxPlayers    Int         @default(1)
  estimatedMins Int         @default(5)

  // Restricciones
  minLevel      Int         @default(1)        // Nivel mínimo del jugador para acceder
  requiredCoins Int         @default(0)        // Coins necesarios para jugar (entrada)

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  sessions      GameSession[]
  achievements  Achievement[]
  dailyLimits   DailyCoinsLimit[]

  @@index([status])
  @@index([type])
}

enum GameType {
  SOLO        // Un jugador vs CPU o tiempo
  VERSUS      // Alumno vs alumno (mismo curso)
  COOPERATIVE // Equipo vs tiempo
  QUIZ        // Preguntas con respuesta rápida
  PUZZLE      // Juego de lógica o vocabulario
}

enum GameStatus {
  DRAFT       // Configuración en progreso
  ACTIVE      // Disponible para jugar
  SEASONAL    // Solo disponible en fechas específicas
  ARCHIVED    // Retirado
}

// ─────────────────────────────────────────────
// PARTIDAS
// ─────────────────────────────────────────────

model GameSession {
  id          String        @id @default(uuid())
  gameId      String
  game        Game          @relation(fields: [gameId], references: [id])
  courseId    String                            // FK lógica → Core.Course.id
  status      SessionStatus @default(LOBBY)

  // Jugadores (siempre almacenados como JSON — evita FK dinámica)
  players     String                            // JSON: [{ studentId, name, avatarUrl }]
  maxPlayers  Int           @default(1)

  // Timing
  startedAt   DateTime?
  endedAt     DateTime?
  durationSec Int?                              // Calculado al cerrar

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  events      SessionEvent[]
  results     SessionResult[]

  @@index([gameId])
  @@index([courseId])
  @@index([status])
  @@index([createdAt])
}

enum SessionStatus {
  LOBBY       // Esperando jugadores
  ACTIVE      // En progreso
  PAUSED
  COMPLETED
  ABANDONED
}

model SessionEvent {
  id          String      @id @default(uuid())
  sessionId   String
  session     GameSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  studentId   String                            // FK lógica → quién generó el evento
  type        String                            // "ANSWER", "MOVE", "POWERUP", "SCORE", etc.
  payload     String                            // JSON: datos del evento
  occurredAt  DateTime    @default(now())

  @@index([sessionId])
  @@index([sessionId, studentId])
}

model SessionResult {
  id              String      @id @default(uuid())
  sessionId       String
  session         GameSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  studentId       String                        // FK lógica → Core.User.id
  position        Int                           // 1ro, 2do, etc.
  score           Float       @default(0)
  didWin          Boolean     @default(false)
  coinsEarned     Int         @default(0)
  coinsGranted    Boolean     @default(false)   // Si ya se enviaron al Core
  coinsGrantedAt  DateTime?
  metadata        String?                       // JSON: stats adicionales (hits, misses, etc.)
  createdAt       DateTime    @default(now())

  @@unique([sessionId, studentId])
  @@index([studentId])
  @@index([gameId: false])    // Para queries de leaderboard
  @@index([coinsGranted])
}

// ─────────────────────────────────────────────
// LÍMITE DIARIO DE COINS
// ─────────────────────────────────────────────

model DailyCoinsLimit {
  id          String   @id @default(uuid())
  gameId      String
  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  studentId   String
  date        DateTime @default(now())          // Solo la fecha importa (truncar a día)
  coinsEarned Int      @default(0)

  @@unique([gameId, studentId, date])
  @@index([gameId, date])
}

// ─────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────

model LeaderboardEntry {
  id          String   @id @default(uuid())
  gameId      String
  courseId    String
  studentId   String
  period      Period   @default(WEEKLY)
  periodKey   String                            // "2026-W15", "2026-04", "2026", "all"

  totalScore  Float    @default(0)
  totalWins   Int      @default(0)
  totalPlays  Int      @default(0)
  totalCoins  Int      @default(0)
  rank        Int?                              // Calculado en job nocturno

  lastUpdated DateTime @default(now())

  @@unique([gameId, courseId, studentId, period, periodKey])
  @@index([gameId, courseId, period, periodKey])
  @@index([gameId, period, periodKey, totalScore])
}

enum Period {
  DAILY
  WEEKLY
  MONTHLY
  ALLTIME
}

// ─────────────────────────────────────────────
// LOGROS (ACHIEVEMENTS)
// ─────────────────────────────────────────────

model Achievement {
  id              String          @id @default(uuid())
  gameId          String?                         // null = logro global (todos los juegos)
  game            Game?           @relation(fields: [gameId], references: [id])
  slug            String          @unique
  name            String
  description     String
  iconEmoji       String          @default("🏆")
  badgeUrl        String?
  rarity          AchievementRarity @default(COMMON)

  // Condición (evaluada en el backend al cerrar sesión)
  conditionType   String                          // "WIN_STREAK", "SCORE_THRESHOLD", "TOTAL_PLAYS", etc.
  conditionValue  Float                           // Valor objetivo
  coinsReward     Int             @default(0)

  isSecret        Boolean         @default(false) // No visible hasta desbloquear
  isActive        Boolean         @default(true)

  createdAt       DateTime        @default(now())
  players         PlayerAchievement[]

  @@index([gameId])
  @@index([rarity])
}

enum AchievementRarity {
  COMMON
  UNCOMMON
  RARE
  EPIC
  LEGENDARY
}

model PlayerAchievement {
  id              String      @id @default(uuid())
  achievementId   String
  achievement     Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  studentId       String                          // FK lógica → Core.User.id
  courseId        String                          // FK lógica → Core.Course.id
  unlockedAt      DateTime    @default(now())
  coinsGranted    Boolean     @default(false)
  coinsGrantedAt  DateTime?
  sessionId       String?                         // Sesión en la que se desbloqueó

  @@unique([achievementId, studentId])
  @@index([studentId])
}

// ─────────────────────────────────────────────
// NIVEL DE JUGADOR (PROGRESIÓN)
// ─────────────────────────────────────────────

model PlayerProfile {
  id            String   @id @default(uuid())
  studentId     String   @unique               // FK lógica → Core.User.id
  xp            Int      @default(0)           // Experiencia acumulada (solo en games)
  level         Int      @default(1)           // Nivel calculado desde XP
  totalWins     Int      @default(0)
  totalPlays    Int      @default(0)
  winStreak     Int      @default(0)           // Victorias consecutivas actuales
  bestStreak    Int      @default(0)
  totalCoinsEarned Int   @default(0)
  lastPlayedAt  DateTime?
  updatedAt     DateTime @updatedAt
}
```

---

## 4. Comunicación entre servicios

### Reglas de ownership de datos

| Dato | Dueño | Quién puede escribirlo | Cómo lo leen los demás |
|---|---|---|---|
| Usuarios, roles | Core (api/) | Solo Core | HTTP GET /api/usuarios/:id |
| Cursos | Core (api/) | Solo Core | HTTP GET /api/cursos |
| Coins del alumno | Core (api/) | Solo Core vía endpoint interno | POST /internal/coins/grant |
| CoinLog | Core (api/) | Solo Core | No se expone |
| Materias, unidades | Academic | Solo Academic | HTTP directo desde web |
| Entregas, calificaciones | Academic | Solo Academic | HTTP directo desde web |
| Sesiones de juego | Games | Solo Games | HTTP directo desde web |
| Logros | Games | Solo Games | HTTP directo desde web |

### Endpoint interno en Core

```typescript
// api/src/modules/coins/presentation/internal-coins.controller.ts
// Solo accesible desde la red interna (no expuesto en API pública)

POST /internal/coins/grant
Authorization: Internal-Key <INTERNAL_API_KEY>  // Variable de entorno, nunca en código
Body: {
  studentId: string
  amount: number
  reason: string               // Descripción legible
  sourceModule: 'academic' | 'games'
  sourceId: string             // ID de la entidad que generó la recompensa
  idempotencyKey: string       // Para evitar doble-otorgamiento
}
Response: { coinLogId: string, newBalance: number }
```

### Flujo de otorgamiento de coins (ejemplo Academic)

```
Docente califica submission
  → Grade creada en Academic DB
  → GradeCreatedEvent (dentro de api-academic)
  → CoinsGranterService llama POST /internal/coins/grant
  → Core crea CoinLog + actualiza coins del alumno
  → Core emite WS COINS_UPDATED
  → Web (portal del alumno) recibe WS, actualiza saldo
  → Academic marca grade.coinsGrantedAt = now()
```

### Autenticación

- El token JWT lo emite **solo el Core** (api/)
- `api-academic` y `api-games` validan el token con **la misma `JWT_SECRET`**
- No hay re-emisión ni token exchange entre servicios
- Los endpoints internos usan un header `Internal-Key` diferente al JWT

---

## 5. Arquitectura de API (NestJS)

Cada servicio nuevo sigue exactamente la misma arquitectura limpia del Core:

```
src/modules/{name}/
├── domain/
│   ├── {name}.entity.ts          ← Validaciones de negocio
│   └── {name}.repository.ts      ← Interface del repositorio
├── application/
│   ├── dtos/
│   │   ├── create-{name}.dto.ts
│   │   └── update-{name}.dto.ts
│   ├── commands/
│   │   ├── create-{name}.command.ts
│   │   ├── create-{name}.handler.ts
│   │   ├── update-{name}.command.ts
│   │   └── update-{name}.handler.ts
│   ├── queries/
│   │   ├── get-{name}.handler.ts
│   │   └── list-{name}.handler.ts
│   └── mappers/
│       └── {name}.mapper.ts
├── infrastructure/
│   └── prisma-{name}.repository.ts
└── presentation/
    └── {name}.controller.ts
```

**Diferencia clave con Core:** Cada módulo tiene además un `core-client/` que usa `HttpModule` de NestJS para llamar al Core:

```typescript
// api-academic/src/core-client/coins.client.ts
@Injectable()
export class CoinsClient {
  constructor(private readonly httpService: HttpService) {}

  async grant(dto: GrantCoinsDto): Promise<GrantCoinsResponse> {
    const url = `${process.env.CORE_API_URL}/internal/coins/grant`
    const { data } = await firstValueFrom(
      this.httpService.post<GrantCoinsResponse>(url, dto, {
        headers: { 'Internal-Key': process.env.INTERNAL_API_KEY },
      })
    )
    return data
  }
}
```

---

## 6. Arquitectura Frontend (Next.js)

### Routing

```
app/
├── (core)/              ← Grupo de rutas core (layout con sidebar actual)
│   ├── layout.tsx
│   ├── page.tsx          ← Dashboard coins
│   └── ...
├── academic/             ← Layout propio (puede reusar el sidebar con tab activo)
│   ├── layout.tsx        ← AcademicLayout — reutiliza AppShell pero resalta "Academic"
│   ├── page.tsx          ← Lista de materias del alumno
│   ├── subjects/
│   │   └── [subjectId]/
│   │       ├── page.tsx  ← Unidades de la materia
│   │       └── [unitId]/
│   │           ├── page.tsx          ← Actividades de la unidad
│   │           └── activities/[id]/
│   │               └── page.tsx      ← Detalle de actividad / entrega
│   └── admin/            ← Panel admin (solo role=admin)
│       ├── subjects/
│       ├── activities/
│       └── submissions/  ← Para calificar
└── games/
    ├── layout.tsx
    ├── page.tsx          ← Lobby: lista de juegos disponibles
    └── [gameId]/
        ├── page.tsx      ← Pantalla del juego
        └── leaderboard/
            └── page.tsx
```

### Config de rutas

```typescript
// web/src/config/routes.ts — AGREGAR al final (no modificar el core)
export const ACADEMIC_API = {
  BASE: '/api/academic',
  SUBJECTS: {
    BASE:     '/api/academic/subjects',
    BY_ID:    (id: string) => `/api/academic/subjects/${id}`,
    UNITS:    (id: string) => `/api/academic/subjects/${id}/units`,
    ENROLL:   (id: string) => `/api/academic/subjects/${id}/enroll`,
  },
  UNITS: {
    BASE:     '/api/academic/units',
    BY_ID:    (id: string) => `/api/academic/units/${id}`,
    ACTIVITIES: (id: string) => `/api/academic/units/${id}/activities`,
  },
  ACTIVITIES: {
    BASE:     '/api/academic/activities',
    BY_ID:    (id: string) => `/api/academic/activities/${id}`,
    SUBMIT:   (id: string) => `/api/academic/activities/${id}/submit`,
  },
} as const

export const GAMES_API = {
  BASE: '/api/games',
  GAMES: {
    BASE:     '/api/games/games',
    BY_ID:    (id: string) => `/api/games/games/${id}`,
  },
  SESSIONS: {
    BASE:     '/api/games/sessions',
    BY_ID:    (id: string) => `/api/games/sessions/${id}`,
    JOIN:     (id: string) => `/api/games/sessions/${id}/join`,
    EVENTS:   (id: string) => `/api/games/sessions/${id}/events`,
  },
  LEADERBOARD: {
    BASE:     '/api/games/leaderboard',
  },
} as const
```

### Proxy en Next.js

```typescript
// web/next.config.ts — rewrites para enrutar /api/academic → :4002
// y /api/games → :4003 sin exponer los puertos internos al cliente

async rewrites() {
  return [
    { source: '/api/academic/:path*', destination: `${process.env.ACADEMIC_API_URL}/api/:path*` },
    { source: '/api/games/:path*',    destination: `${process.env.GAMES_API_URL}/api/:path*`    },
  ]
}
```

---

## 7. Branch strategy y CI/CD

### Branches

```
main          ← legacy/backup
develop       ← integración activa
  ├── feature/academic-core     ← solo toca api-academic/ y web/src/features/academic/
  ├── feature/academic-admin    ← panel admin para materias/calificaciones
  ├── feature/games-core        ← solo toca api-games/ y web/src/features/games/
  └── feature/games-{nombre}    ← juego específico
production    ← código aprobado
deploy        ← merge final para despliegue
```

**Regla de aislamiento (obligatoria):**

Ningún commit en `feature/academic-*` o `feature/games-*` modifica:
- `api/src/`              ← Excepto `api/src/modules/coins/` para el endpoint interno
- `web/src/features/(core features)`
- `web/src/app/(core)/`
- `shared/src/types/(core types)`

Si se necesita modificar el Core → PR separado en `develop` con scope `api` o `web`.

### CI/CD — GitHub Actions a agregar

```yaml
# .github/workflows/ci-academic.yml
on:
  push:
    paths:
      - 'api-academic/**'
      - 'shared/**'
      - '.github/workflows/ci-academic.yml'

jobs:
  academic:
    steps:
      - npm run build -w shared
      - cd api-academic && npx prisma generate
      - node_modules/.bin/vitest run --config api-academic/vitest.config.ts
      - npm run build -w api-academic
```

```yaml
# .github/workflows/ci-games.yml
# Análogo a ci-academic.yml
```

### docker-compose

```yaml
# docker-compose.yml — agregar a los servicios existentes
  api-academic:
    build: ./api-academic
    ports: ["4002:4002"]
    environment:
      - ACADEMIC_DATABASE_URL=file:./data/academic.db
      - CORE_API_URL=http://api:4001
      - INTERNAL_API_KEY=${INTERNAL_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - academic-data:/app/data
    depends_on: [api]

  api-games:
    build: ./api-games
    ports: ["4003:4003"]
    environment:
      - GAMES_DATABASE_URL=file:./data/games.db
      - CORE_API_URL=http://api:4001
      - INTERNAL_API_KEY=${INTERNAL_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - games-data:/app/data
    depends_on: [api]

volumes:
  academic-data:
  games-data:
```

---

## 8. Plan de acción por fases

### Fase 0 — Preparación Core (1 sesión)
Antes de crear ningún workspace nuevo, agregar al Core:

```
□ Endpoint interno POST /internal/coins/grant
□ Validación de idempotencyKey (evitar doble-otorgamiento)
□ Pruebas unitarias del endpoint
□ Variable INTERNAL_API_KEY en .env
```

### Fase 1 — Scaffold de api-academic (1 sesión)
```
□ Crear api-academic/ como workspace npm
□ Configurar NestJS + Prisma + Vitest
□ Aplicar schema Academic completo (migrations)
□ Core-client con HttpModule (usuarios, coins)
□ CI pipeline ci-academic.yml
□ Docker service en docker-compose.yml
```

### Fase 2 — Módulos Academic Backend (2-3 sesiones)
```
□ subject/  — CRUD completo con permisos admin/teacher
□ unit/     — CRUD con publicación controlada (isPublished)
□ activity/ — CRUD + tipos (TASK, QUIZ, ASSIGNMENT, RESOURCE)
□ submission/ — Entregas con adjuntos
□ grade/    — Calificación + otorgamiento de coins vía core-client
□ enrollment/ — Inscripción automática por courseId
□ Tests unitarios: entities + handlers + mappers
```

### Fase 3 — Frontend Academic (2-3 sesiones)
```
□ Rutas /academic/** en Next.js
□ feature/academic/domain/types.ts
□ Servicios por entidad (subject, unit, activity, submission)
□ Hooks: useSubjects, useUnits, useActivities, useSubmission
□ UI: SubjectCard, UnitAccordion, ActivityList, SubmissionForm
□ Panel admin: formularios de creación/edición, lista de entregas
□ Link en sidebar del Core hacia /academic
```

### Fase 4 — Scaffold de api-games (1 sesión)
```
□ Análogo a Fase 1 para api-games
□ Schema Games completo
□ CI pipeline ci-games.yml
```

### Fase 5 — Módulos Games Backend (2 sesiones)
```
□ game/ — Catálogo con configuración JSON
□ session/ — Ciclo de vida completo (LOBBY → ACTIVE → COMPLETED)
□ leaderboard/ — Cálculo de rankings por periodo
□ achievement/ — Evaluación de condiciones al cerrar sesión
□ coin-event/ — Log y otorgamiento con idempotency
□ Tests unitarios completos
```

### Fase 6 — Frontend Games (2-3 sesiones)
```
□ Rutas /games/** en Next.js
□ Lobby: lista de juegos disponibles por courseId
□ GameFrame: componente que carga el juego (iframe o componente React)
□ Leaderboard UI por juego
□ Achievements UI
□ Link en sidebar del Core hacia /games
□ WebSocket events para actualizaciones en tiempo real (score, coins)
```

---

## 9. Refactor CVA — Componentes UI

> Análisis completo del estado actual y qué se refactoriza.

### Estado actual de `components/ui/`

| Componente | Variantes | Patrón actual | CVA candidato |
|---|---|---|---|
| `button.tsx` | 7 variantes × 4 tamaños | Object lookup manual | ✅ TIER 1 |
| `badge.tsx` | 7 variantes | Object lookup manual | ✅ TIER 1 |
| `spinner.tsx` | 3 tamaños | Object lookup manual | ✅ TIER 1 |
| `grid.tsx` | 5 cols × 3 gaps | Object lookup manual | ✅ TIER 1 |
| `status-badge.tsx` | 6 status × 2 tamaños | Condicionales anidados | ✅ TIER 1 |
| `avatar.tsx` | 4 tamaños | Object lookup manual | ✅ TIER 2 |
| `combobox.tsx` | 2 tamaños | Condicional inline | ✅ TIER 2 |
| `modal.tsx` | 1 bool (`lg`) | Boolean → 2 variantes | ✅ TIER 3 |
| `drawer.tsx` | `side` left/right | Condicional | ✅ TIER 3 |
| `tooltip.tsx` | `side` top/bottom | Condicional | ✅ TIER 3 |
| `card.tsx` | Ninguna | `cn()` solo | ❌ No aplica |
| `input.tsx` | Ninguna | Lógica de toggle | ❌ No aplica |
| `label.tsx` | Ninguna | Estático | ❌ No aplica |

### Gaps de abstracción encontrados

**Gap 1 — Colors de estado duplicados**
`status-badge.tsx` y `notification-item.tsx` definen colores de severidad por separado.
**Solución:** `config/component-styles.ts` con los mapas centralizados.

**Gap 2 — `ConfirmDialog` re-implementa variante de Button**
Lines 30-32 de `confirm-dialog.tsx` repiten lógica de amber/red que ya está en Button.
**Solución:** Pasar `variant` como prop y delegar a `<Button>`.

**Gap 3 — `FilterPills` hardcodea colores de acento**
`filter-pills.tsx` lines 21-23 definen `amber` vs `purple` inline.
**Solución:** Exponer `accentVariant: 'amber' | 'purple'` y resolverlo con CVA.

**Gap 4 — Sin `useBreakpoint` hook**
La responsividad se maneja con clases Tailwind `sm:` / `md:` pero no hay forma programática de saber en qué breakpoint está la app.
**Solución:** `hooks/useBreakpoint.ts` (ref: abe-s-ui implementation).

### Plan de refactor CVA (por prioridad)

```
FASE A — Instalar CVA y refactorizar Tier 1
  □ pnpm add -w class-variance-authority     ← agregar al root
  □ button.tsx   → buttonVariants con CVA
  □ badge.tsx    → badgeVariants con CVA
  □ spinner.tsx  → spinnerVariants con CVA
  □ grid.tsx     → gridVariants con CVA (compound: cols × gap)
  □ status-badge.tsx → statusBadgeVariants con CVA

FASE B — Config centralización de colores
  □ Crear config/component-styles.ts con mapas de severidad y status
  □ Actualizar notification-item.tsx y status-badge.tsx para importar de ahí

FASE C — Tier 2 y hooks nuevos
  □ avatar.tsx   → avatarVariants con CVA
  □ combobox.tsx → comboboxVariants con CVA
  □ hooks/useBreakpoint.ts  → "mobile" | "tablet" | "desktop"

FASE D — Tier 3 (opcional, baja prioridad)
  □ modal.tsx, drawer.tsx, tooltip.tsx → side/size variants con CVA

REGLA: Cada refactor CVA debe:
  1. Exportar VariantProps<typeof xxxVariants> para que los consumidores
     hereden los tipos automáticamente
  2. No cambiar la API pública del componente (mismos props names)
  3. Pasar todos los tests existentes sin modificación
```

---

## Decisiones pendientes de aprobación

Antes de iniciar cualquier implementación, confirmar:

```
□ ¿Se usa SQLite para academic y games (igual que Core) o PostgreSQL?
□ ¿El panel admin de Academic es accesible desde la misma sesión admin del Core?
  (Si sí → solo proteger con JwtAuthGuard + role=admin, sin login separado)
□ ¿Los juegos son componentes React propios o iframes externos?
□ ¿El Leaderboard de Games incluye a TODOS los cursos o solo al del estudiante?
□ ¿El endpoint /internal/coins/grant necesita aprobación del admin o es automático?
  (Recomendado: automático para Academic al calificar, automático para Games al completar)
□ ¿Se implementa Fase 0 (endpoint interno) antes de cualquier otra fase?
  (Recomendado: sí — es el contrato de integración base)
```

---

*Este documento debe ser revisado y aprobado antes de escribir una sola línea de código.*
*Una vez aprobado, se convierte en la fuente de verdad para la implementación.*
