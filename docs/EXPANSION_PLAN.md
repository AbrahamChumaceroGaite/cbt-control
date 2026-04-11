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

> Análisis exhaustivo basado en lectura completa de los 41 archivos en
> `components/ui/` y `components/shared/`. Versión corregida: 22 candidatos,
> no los 5 del análisis preliminar.

---

### 9.1 Inventario completo — `components/ui/` (26 archivos)

#### TIER 1 — Refactor inmediato, máximo ROI

**`button.tsx`** — 36 líneas
```
Problema: object lookup doble (variant + size) en líneas 16–25.
          El tipo de props se define manualmente en lugar de inferirse.
Variantes: 7 × 4 tamaños = 28 combinaciones sin compound variants
Solución:  cva() con compoundVariants para casos edge (ej: icon+loading)
Impacto:   Es el componente más usado en todo el proyecto. Cambio de mayor
           alcance. VariantProps<typeof buttonVariants> elimina definición manual.
```

**`badge.tsx`** — 28 líneas
```
Problema: objeto de variantes en líneas 13–21, lookup manual [variant].
          7 colores hardcodeados sin tipo derivado.
Variantes: 7 (default, green, amber, red, blue, violet, demo)
Solución:  cva() → badgeVariants exportado. Tipo inferido automáticamente.
Impacto:   Badge se usa en múltiples features. Quick win.
```

**`spinner.tsx`** — 20 líneas
```
Problema: object lookup en línea 13 para 3 tamaños.
          Color hardcodeado border-amber-400 (no variante de color).
Variantes: 3 tamaños. Podría añadir color variant (amber/white/zinc).
Solución:  cva() → spinnerVariants. Añadir color: 'amber'|'white' como nueva variante.
Impacto:   Bajo, pero establece el patrón para los demás.
```

**`grid.tsx`** — 32 líneas
```
Problema: dos object lookups independientes (colsMap + gapMap, líneas 9–20).
          No hay compound variant que valide combinaciones inválidas.
Variantes: cols(5) × gap(3) = 15 combinaciones → CVA compound variant ideal.
Solución:  cva() con variants: { cols, gap }. El inline style para minColWidth
           se mantiene como prop extra (no es un variant, es un valor dinámico).
Impacto:   Grid se usa en todas las secciones de lista.
```

**`status-badge.tsx`** — 38 líneas
```
Problema: lógica de resolución en líneas 21–30 mezcla 3 dimensiones:
          - STATUS_CONFIG object (colores por key)
          - variant (default | request) que cambia el key prefix
          - size (xs | sm) que cambia el tamaño
          Todo en condicionales anidados sin tipo fuerte.
Variantes: status(6) × size(2) × variant(2) = 24 combinaciones
Solución:  cva() con compoundVariants para manejar status+variant.
           STATUS_CONFIG migra a config/component-styles.ts (ver Gap 1).
Impacto:   Alto — status-badge aparece en TxCard, SolicitudesTab, listas admin.
```

---

#### TIER 2 — Refactor en segunda ronda, impacto medio-alto

**`avatar.tsx`** — 38 líneas
```
Problema: sizeMap object en líneas 10–15. hashColor() genera color inline.
Variantes: 4 tamaños (sm, md, lg, xl). No tiene variante de forma (round/square).
Solución:  cva() para size. Añadir shape: 'circle'|'square' como variante futura.
           hashColor() se mantiene — es lógica dinámica, no variante.
```

**`combobox.tsx`** — 123 líneas  ⚠️ Cerca del límite de 120L
```
Problema: size se resuelve con variable `sm` booleana en líneas 55, 63–66.
          Múltiples ternarios inline para height/text/padding.
Variantes: 2 tamaños (sm, default).
Solución:  cva() para la clase del trigger. El dropdown siempre es igual.
Nota:      El archivo está en 123L → al refactorizar verificar que no supere 120L.
```

**`slider.tsx`** (SliderField) — 42 líneas
```
Problema: triple ternario en líneas 25–27 para effectPct → color badge.
          Lógica: ≥80 → emerald, ≥50 → amber, <50 → red.
          Este mismo patrón de "semáforo" aparece en otros componentes.
Variantes: 3 estados de color (good, warning, danger) basados en umbral numérico.
Solución:  cva() con effectLevel: 'good'|'warning'|'danger'.
           El componente padre computa el nivel a partir del número y lo pasa.
           Esto separa la lógica de decisión del estilo visual.
```

**`toast.tsx`** — 20 líneas
**`toast-container.tsx`** — 33 líneas
```
PROBLEMA CRÍTICO: Estos dos archivos son la misma lógica duplicada.
  toast.tsx:           ok     ? emerald / red
  toast-container.tsx: success ? emerald / red
  Ambos renderizan SVG de check/x inline — duplicados literalmente.

Variantes: 2 estados (success, error).
Solución:
  1. Crear toastVariants con cva() en toast.tsx
  2. Eliminar toast.tsx (componente huérfano — no se usa directamente en ningún lugar)
     o convertirlo en el componente base que usa toast-container.tsx
  3. Extraer los SVGs a <CheckIcon> y <XIcon> dentro de toast.tsx y reutilizar
  4. toast-container.tsx importa las variantes, no repite la lógica
```

**`checkbox.tsx`** — 35 líneas
```
Problema: ternario en líneas 25–27 para checked/unchecked.
          Color hardcodeado amber-500 para checked.
Variantes: 2 estados (checked, unchecked). Potencial: color variant (amber | purple).
Solución:  cva() con data-state o checked variant.
           Exportar CheckboxVariants para heredar el tipo.
```

**`tabs.tsx`** — 44 líneas
```
Problema: ternario en líneas 27–29 por cada tab para active/inactive.
          El badge del tab es amber hardcodeado (línea 35).
Variantes: active/inactive state per tab item.
Solución:  cva() para el item del tab. Separar TabItem como sub-componente.
           Exportar tabItemVariants para tests.
```

**`modal.tsx`** — 32 líneas
```
Problema: prop `lg?: boolean` en lugar de `size?: 'sm'|'md'|'lg'|'xl'`.
          Ternario en línea 17 para max-w.
          El botón de cierre (líneas 21–25) es inline, debería ser <Button>.
Variantes: size('sm'=max-w-md | 'lg'=max-w-2xl). Extensible a 'sm'|'md'|'lg'|'xl'.
Solución:  Cambiar lg boolean → size: 'md'|'lg' (no-breaking si default='md').
           cva() para modalVariants.
           Botón X → <Button variant="ghost" size="icon">.
```

**`drawer.tsx`** — 54 líneas
```
Problema: ternario en línea 38 para side.
          El botón de cierre (línea 45) es inline <button>.
          style={{ zIndex: 'var(--z-drawer)' as unknown as number }} — cast feo.
Variantes: side: 'left'|'right'.
Solución:  cva() para drawerPanelVariants.
           Botón X → <Button variant="ghost" size="icon">.
           zIndex: usar className con z-[var(--z-drawer)] en lugar de style.
```

**`tooltip.tsx`** — 25 líneas
```
Problema: ternario en línea 15 para side (posición) y líneas 18–20 para arrow.
Variantes: side: 'top'|'bottom'. Extensible: 'top'|'bottom'|'left'|'right'.
Solución:  cva() con tooltipVariants para wrapper + arrowVariants para el triángulo.
```

**`input.tsx`** — 44 líneas
```
Problema: padding condicional en líneas 25–26 dependiendo de startIcon e isPassword.
          No es un variant clásico — es una combinación de presencia de iconos.
Variantes: withStartIcon: boolean, withEndIcon: boolean → compound variant de padding.
Solución:  cva() con compoundVariants:
           [{ withStartIcon: true } → 'pl-8']
           [{ withEndIcon: true }   → 'pr-8']
           Esto documenta explícitamente la dependencia.
```

**`popover.tsx`** — 45 líneas
```
Problema: ternario en línea 34 para align.
          style={{ zIndex: 'var(--z-dropdown)' as unknown as number }} — cast feo.
          Duplicado con Drawer en el patrón de zIndex vía style.
Variantes: align: 'left'|'right'.
Solución:  cva() para popoverContentVariants.
           z-[var(--z-dropdown)] como clase CSS en lugar de style prop.
```

---

#### TIER 3 — Sin CVA pero con abstracción pendiente

**`card.tsx`** — 22 líneas
```
Estado:   Compuesto de sub-componentes puros (Card, CardHeader, CardContent...).
          Sin variantes — solo cn() para merge de className.
Problema: NO es CVA. Pero falta un compound component más rico como abe-s-ui:
          CardIconContainer, CardEffect (colores por efecto), CardVariant.
Acción:   Agregar variantes de Card cuando se implemente la sección de blocks/
          para Academic y Games. Por ahora: no tocar.
```

**`select.tsx`** — 15 líneas  
**`textarea.tsx`** — 15 líneas
```
Estado: Wrappers simples sin variantes. 
Problema: No tienen size ni variant — solo wrappean el elemento nativo.
          select.tsx debería ser Combobox en la mayoría de usos (ya migrado).
Acción: Añadir size: 'sm'|'md' cuando se necesite. No urgente.
```

**`search-input.tsx`** — 28 líneas
```
Estado: Sin variantes visuales.
Problema: No tiene size. Internamente renderiza Input (que sí se refactoriza).
Acción: Recibe el beneficio de Input automáticamente. No tocar.
```

---

### 9.2 Inventario completo — `components/shared/` (15 archivos)

#### CVA/Abstracción requerida

**`ConfirmDialog.tsx`** — 62 líneas
```
PROBLEMA DOBLE:
  1. CVA: línea 30–32 re-implementa lógica de color que ya tiene Button.
     btnClass se calcula manualmente con un ternario amber/red.
  2. BOTONES INLINE: líneas 44–55 tienen dos <button> sin usar <Button>.
     El cancelar es outline, el confirmar es amber o destructive.

Solución:
  - Eliminar btnClass completamente
  - Botón cancelar  → <Button variant="outline" className="flex-1">
  - Botón confirmar → <Button variant={variant === 'red' ? 'destructive' : 'amber'} loading={loading}>
  - cva() para el ícono contenedor si se añaden más variantes de color de ícono
```

**`FilterPills.tsx`** — 43 líneas
```
PROBLEMA DOBLE:
  1. CVA: líneas 21–23 y 31–35 definen el color activo/inactivo inline.
     accentColor prop resuelve 'amber' vs 'purple' en 2 strings de clase separadas.
  2. BOTONES INLINE: cada pill es un <button> inline en líneas 28–38.
     Son pills/tabs → no son el Button genérico, pero sí CVA candidatos.

Solución:
  - cva() → pillVariants con variants: { accent: 'amber'|'purple', active: boolean }
  - compoundVariant: accent=amber + active=true → bg-amber-500/15 text-amber-300...
  - compoundVariant: accent=purple + active=true → bg-purple-600/20 text-purple-300...
  - Las pills usan <button> con className={pillVariants({accent, active})} — correcto
    (No es el Button genérico, es un atom propio con su propio CVA)
```

**`NotificationItem.tsx`** — 53 líneas
```
Problema: SEVERITY_DOT y SEVERITY_BG son Records hardcodeados en líneas 6–18.
          Los mismos colores de severidad (emerald/red/blue/amber) aparecen en:
          - NotificationItem (dot + border)
          - NotificationBell (badge de unread)
          - status-badge.tsx (colores de estado)
          - slider.tsx (badge de effectPct)
          Cuatro fuentes de verdad para el mismo sistema de colores semáforo.

Solución:
  - Crear config/component-styles.ts con:
      SEVERITY_STYLES: Record<Severity, { dot: string, border: string, text: string }>
      EFFECT_LEVEL_STYLES: Record<'good'|'warning'|'danger', { bg: string, text: string }>
  - NotificationItem importa SEVERITY_STYLES en vez de definir sus propios Records
  - slider.tsx importa EFFECT_LEVEL_STYLES
  - status-badge.tsx importa STATUS_STYLES
  - Resultado: un único lugar para cambiar colores de estado en toda la app
```

**`FilterPopover.tsx`** — 52 líneas
```
Problema: Botón "Limpiar filtros" en líneas 40–46 es un <button> inline.
          Tiene text-xs, gap-1.5, hover:text-zinc-300 hardcodeados.
Solución: <Button variant="ghost" size="sm" onClick={...}> con X icon.
          Ya usa <Button> para el trigger principal — consistencia.
```

**`Pagination.tsx`** — 56 líneas
```
Estado:   YA usa <Button> correctamente para los botones de página (líneas 42–50).
Problema: El <select> de page size en líneas 30–37 es nativo y tiene clases inline.
          Debería ser un Combobox para consistencia con el resto de la app.
Solución: Reemplazar <select> → <Combobox size="sm" options={PAGE_SIZES.map(...)}/>.
          Nota: PAGE_SIZES como options array se convierte en una constante exportable.
```

**`FloatingNav.tsx`** — 39 líneas
```
Problema: active state se resuelve con cn('nav-item', active === t.id && 'active').
          Usa clases CSS globales ('nav-item', 'active', 'nav-icon', 'nav-label')
          — probablemente en globals.css — no en Tailwind.
Análisis: Este componente depende de CSS externo, no de Tailwind classes.
          CVA aquí requeriría migrar ese CSS a clases de Tailwind.
Acción:   Baja prioridad. No tocar hasta que se requiera personalización.
```

#### Sin cambios requeridos

**`CardActions.tsx`** — Simple overlay con dos botones de acción (icon-only). OK.  
**`SectionHeader.tsx`** — Composición pura, iconClass como prop string. OK.  
**`FormField.tsx`** — Wrapper de label + error. Sin variantes. OK.  
**`CourseSelect.tsx`** — Template string en className. Mejorable pero no urgente.  
**`LogoutModal.tsx`** — Modal de confirmación simple. OK.  
**`PushPrompt.tsx`** — Tiene inline `style={{ background: 'rgba(...)' }}`. Convertir a clase Tailwind `bg-amber-500/10`. Mínimo impacto.  
**`ConditionalSocketProvider.tsx`** — Sin styling. OK.  

---

### 9.3 Mapa completo de problemas — todos los componentes

| # | Archivo | Problema exacto | Líneas afectadas | Tipo | Prioridad |
|---|---------|-----------------|------------------|------|-----------|
| 1 | `ui/button.tsx` | Object lookup doble variant+size | 16–25 | CVA | 🔴 TIER 1 |
| 2 | `ui/badge.tsx` | Object lookup variant | 13–21 | CVA | 🔴 TIER 1 |
| 3 | `ui/spinner.tsx` | Object lookup size | 13 | CVA | 🔴 TIER 1 |
| 4 | `ui/grid.tsx` | Dos object lookups cols+gap | 9–20 | CVA compound | 🔴 TIER 1 |
| 5 | `ui/status-badge.tsx` | Condicionales anidados 3 dims | 21–30 | CVA compound | 🔴 TIER 1 |
| 6 | `ui/avatar.tsx` | Object lookup size | 10–15 | CVA | 🟡 TIER 2 |
| 7 | `ui/combobox.tsx` | Ternarios inline de size | 55, 63–66 | CVA | 🟡 TIER 2 |
| 8 | `ui/slider.tsx` | Triple ternario effectPct | 25–27 | CVA + config | 🟡 TIER 2 |
| 9 | `ui/toast.tsx` | Ternario ok → emerald/red + SVG inline | 8–14 | CVA + extracción | 🟡 TIER 2 |
| 10 | `ui/toast-container.tsx` | Duplica lógica de toast.tsx | 15–26 | Eliminar duplicado | 🟡 TIER 2 |
| 11 | `ui/checkbox.tsx` | Ternario checked → amber | 25–27 | CVA | 🟡 TIER 2 |
| 12 | `ui/tabs.tsx` | Ternario active/inactive por tab | 27–29 | CVA | 🟡 TIER 2 |
| 13 | `ui/modal.tsx` | Boolean lg + botón X inline | 17, 21–25 | CVA + Button | 🟡 TIER 2 |
| 14 | `ui/drawer.tsx` | Ternario side + botón X inline + style cast | 38, 45, 31/41 | CVA + Button | 🟡 TIER 2 |
| 15 | `ui/tooltip.tsx` | Ternario side + arrow duplicado | 15, 18–20 | CVA | 🟡 TIER 2 |
| 16 | `ui/input.tsx` | Padding condicional startIcon+password | 25–26 | CVA compound | 🟡 TIER 2 |
| 17 | `ui/popover.tsx` | Ternario align + style cast | 34, 37 | CVA | 🟡 TIER 2 |
| 18 | `shared/ConfirmDialog.tsx` | Re-implementa Button variant + botones inline | 30–55 | CVA + Button | 🟡 TIER 2 |
| 19 | `shared/FilterPills.tsx` | Colores inline + pills sin CVA | 21–35 | CVA pill atom | 🟡 TIER 2 |
| 20 | `shared/NotificationItem.tsx` | SEVERITY Records duplicados | 6–18 | config/ centralizar | 🟡 TIER 2 |
| 21 | `shared/FilterPopover.tsx` | Botón "Limpiar" inline | 40–46 | Button | 🟢 TIER 3 |
| 22 | `shared/Pagination.tsx` | `<select>` nativo para page size | 30–37 | Combobox | 🟢 TIER 3 |

**Total: 22 componentes. El análisis anterior reportó 5. Los 17 faltantes son reales.**

---

### 9.4 Gaps de abstracción transversales

**Gap A — `config/component-styles.ts` (no existe)**
```typescript
// Actualmente estos colores están duplicados en 4+ archivos:
// notification-item.tsx → SEVERITY_DOT, SEVERITY_BG
// status-badge.tsx      → STATUS_CONFIG
// slider.tsx            → triple ternario emerald/amber/red
// toast.tsx             → emerald-950, red-950

// Lo que falta crear:
export const SEVERITY_STYLES = {
  positive: { dot: 'bg-emerald-400', border: 'border-l-emerald-500/40', text: 'text-emerald-400' },
  negative: { dot: 'bg-red-400',     border: 'border-l-red-500/40',     text: 'text-red-400'     },
  info:     { dot: 'bg-blue-400',    border: 'border-l-blue-500/40',    text: 'text-blue-400'    },
  default:  { dot: 'bg-amber-400',   border: 'border-l-amber-500/40',   text: 'text-amber-400'   },
} as const

export const EFFECT_LEVEL_STYLES = {
  good:    { bg: 'bg-emerald-950', text: 'text-emerald-400' },
  warning: { bg: 'bg-amber-950',   text: 'text-amber-400'   },
  danger:  { bg: 'bg-red-950',     text: 'text-red-400'     },
} as const
```

**Gap B — Toast duplicado**
```
toast.tsx         → componente standalone (huérfano, no se importa en ningún consumer)
toast-container.tsx → el que realmente se usa (conectado a Zustand)
Misma lógica: ok/success → emerald, error → red, mismo SVG de check/x

Acción: Fusionar. Toast como componente puro interno de ToastContainer.
        O: Toast acepta children y ToastContainer lo instancia.
        Resultado: -33 líneas de código duplicado.
```

**Gap C — `style` casts feos en Drawer y Popover**
```typescript
// Drawer línea 31 y 41 + Popover línea 37:
style={{ zIndex: 'var(--z-drawer)' as unknown as number }}

// Debería ser simplemente una clase Tailwind:
className="z-[var(--z-drawer)]"   // Tailwind JIT soporta CSS variables
// o definir las variables en tailwind.config.ts como z-index tokens
```

**Gap D — Botones inline en componentes shared**
```
ConfirmDialog   → 2 <button> sin usar <Button>  (ya detectado en la tarea anterior)
FilterPopover   → 1 <button> "Limpiar filtros"
FilterPills     → N <button> pills (correcto usarlos aquí, pero necesitan CVA propio)
NotificationItem → 2 <button> icon-only (correctos como están — son utility icons)
```

**Gap E — `useBreakpoint` hook inexistente**
```typescript
// No existe en hooks/. Responsividad solo con sm:/md:/lg: Tailwind.
// Casos donde se necesita lógicamente:
// - NotificationBell: panel width diferente en mobile (ya corregido con CSS)
// - Portal: RecipientPicker podría mostrar Drawer en mobile, Popover en desktop
// - Academic/Games: layouts que cambian drásticamente por breakpoint

// Implementación (ref: abe-s-ui):
export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  const [bp, setBp] = useState<'mobile'|'tablet'|'desktop'>('desktop')
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setBp(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop')
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return bp
}
```

---

### 9.5 Plan de refactor CVA — fases concretas

**Prerequisito**
```bash
# Instalar CVA en workspace web
pnpm add class-variance-authority --filter @control-aula/web
```

**Fase A — Core atoms (Tier 1, máximo impacto)**
```
Rama: refactor/web-cva-core-atoms

□ config/component-styles.ts   → SEVERITY_STYLES, EFFECT_LEVEL_STYLES, STATUS_STYLES
□ ui/button.tsx                → buttonVariants = cva(...) + VariantProps export
□ ui/badge.tsx                 → badgeVariants = cva(...)
□ ui/spinner.tsx               → spinnerVariants = cva(...) + color variant añadida
□ ui/grid.tsx                  → gridVariants = cva(...) compound cols×gap
□ ui/status-badge.tsx          → statusBadgeVariants = cva(...) importa de config/
□ Tests: typecheck ✓ lint ✓ build ✓ (no hay tests de componentes UI puros)
```

**Fase B — Estado y tamaño (Tier 2a)**
```
Rama: refactor/web-cva-state-variants

□ ui/avatar.tsx      → avatarVariants = cva(...)
□ ui/combobox.tsx    → comboboxVariants (trigger), verificar ≤120L
□ ui/checkbox.tsx    → checkboxVariants con checked compound
□ ui/tabs.tsx        → tabItemVariants = cva(...)
□ ui/slider.tsx      → SliderBadge interno con effectLevelVariants, importa config/
□ ui/input.tsx       → inputVariants compound: withStartIcon × withEndIcon
□ Tests: typecheck ✓ lint ✓ build ✓ 284 web tests ✓
```

**Fase C — Posicionamiento y overlays (Tier 2b)**
```
Rama: refactor/web-cva-overlays

□ ui/toast.tsx           → toastVariants = cva(...), extraer <CheckIcon> <XIcon>
□ ui/toast-container.tsx → reutiliza toastVariants, elimina duplicado
□ ui/modal.tsx           → modalVariants (size: 'md'|'lg'), botón X → <Button>
□ ui/drawer.tsx          → drawerPanelVariants (side), botón X → <Button>, fix zIndex
□ ui/tooltip.tsx         → tooltipVariants (side), arrowVariants
□ ui/popover.tsx         → popoverContentVariants (align), fix zIndex style cast
□ Tests: typecheck ✓ lint ✓ build ✓
```

**Fase D — Shared components y gaps (Tier 2c + Tier 3)**
```
Rama: refactor/web-cva-shared

□ shared/ConfirmDialog.tsx   → eliminar btnClass, usar Button variant prop
□ shared/FilterPills.tsx     → pillVariants = cva(...) con accent × active compound
□ shared/NotificationItem.tsx → importar SEVERITY_STYLES de config/
□ shared/FilterPopover.tsx   → "Limpiar" → <Button variant="ghost" size="sm">
□ shared/Pagination.tsx      → <select> → <Combobox size="sm">
□ shared/PushPrompt.tsx      → estilo rgba → clase Tailwind
□ hooks/useBreakpoint.ts     → nuevo hook
□ Tests: typecheck ✓ lint ✓ build ✓ 284 web tests ✓
```

**Regla de oro para cada refactor CVA:**
```typescript
// 1. Exportar siempre el tipo inferido
export type ButtonVariants = VariantProps<typeof buttonVariants>

// 2. No cambiar la API pública (mismos nombres de prop)
// Antes: variant?: 'default' | 'ghost' | ...
// Después: variant?: ButtonVariants['variant']  ← equivalente, tipado más fuerte

// 3. defaultVariants en cva() en lugar de default en desestructuración
const buttonVariants = cva(base, {
  variants: { variant: { ... }, size: { ... } },
  defaultVariants: { variant: 'default', size: 'md' }
})

// 4. Pasar className siempre al final para permitir override
className={cn(buttonVariants({ variant, size }), className)}
```

---

### 9.6 Audit de Features — CVA adicionales (12 candidatos confirmados)

La sección 9.3 cubre los 22 componentes de `components/ui/` y `components/shared/`.
Esta sección cubre los patrones encontrados dentro de los 54 archivos `.tsx` en `features/`.

---

#### 9.6.1 Mapa completo — features

| # | Archivo | Líneas | Patrón | Descripción | Tipo | Prioridad |
|---|---------|--------|--------|-------------|------|-----------|
| 23 | `portal/ui/PerfilTab.tsx` | 29–37 | Object map 6 colores | `CAT_COLOR: Record<string, {dot,text,bg,border}>` — categorías de coin log | CVA color variant | 🔴 HIGH |
| 24 | `portal/ui/components/DiscountCarousel.tsx` | 9–15 | Array de 5 gradients | `DEAL_GRADIENTS` con `{bg, accent, glow}` por índice de carousel | CVA theme variant | 🔴 HIGH |
| 25 | `aula/ui/StudentRanking.tsx` | 23–28 | Ternario encadenado × 3 | Rank badge: gold (i=0) / silver (i=1) / bronze (i=2) / rest | CVA `rank` variant | 🔴 HIGH |
| 26 | `aula/ui/StudentRanking.tsx` | 40–44 | Ternario encadenado × 3 | Reward button: reached / isNextR / default — cada uno con shadow y cursor distintos | CVA `state` variant | 🔴 HIGH |
| 27 | `usuarios/ui/UserCard.tsx` | 10–17 | 3 variables derivadas de `isAdmin` | `aura`, `avatarCls`, `roleCls` — purple (admin) vs blue (student) | CVA `role` variant | 🟡 MEDIUM |
| 28 | `recompensas/ui/RewardCard.tsx` | 36–41 | Ternario type + compound inactive | `type: 'class' | 'individual'` → blue/rose + `!isActive → opacity-60` | CVA compound | 🟡 MEDIUM |
| 29 | `tienda/ui/TxCard.tsx` | 16 | Ternario 1 nivel | `PENDING ? bg-zinc-900/80 : bg-zinc-900/40` para el fondo de la card | CVA `status` variant | 🟡 MEDIUM |
| 30 | `aula/ui/RecentHistory.tsx` | 21–23 | Ternario coins | `coins > 0 → emerald` / `=== 0 → blue` / `< 0 → rose` para indicator dot | CVA / `config/` | 🟡 MEDIUM |
| 31 | `usuarios/ui/UserCard.tsx` | 35 | Ternario activo | `isActive ? 'text-emerald-400' : 'text-zinc-600'` — mismo patrón en 3+ lugares | config/component-styles | 🟢 LOW |
| 32 | `portal/ui/RecompensasTab.tsx` | ~150 | Layout featured | `isFeatured ? col-span-2 : ''` en grid — alternate featured item | CVA grid compound | 🟢 LOW |
| 33 | `solicitudes/ui/SolicitudCard.tsx` | ~16–39 | Conditional render | Status PENDING → muestra botones de acción. Patrón igual que TxCard | CVA `status` variant | 🟢 LOW |
| 34 | `aula/ui/AwardModal.tsx` | 22–25 | Object map (recién añadido) | `MODE_ACTIVE_STYLES` — ya corregido a mapa estático, pero extrae a shared si AwardModal se reutiliza | config/ si se reutiliza | 🟢 LOW |

---

#### 9.6.2 Detalles de los 4 HIGH — código exacto

**#23 — `CAT_COLOR` en `PerfilTab.tsx`**
```typescript
// portal/ui/PerfilTab.tsx líneas 29-37 (ACTUAL)
const CAT_COLOR: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  green:  { dot: 'bg-green-400',   text: 'text-green-400',   bg: 'bg-green-400/10',   border: 'border-green-400/20' },
  blue:   { dot: 'bg-blue-400',    text: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20' },
  red:    { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20' },
  amber:  { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
  purple: { dot: 'bg-purple-400',  text: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20' },
  mag:    { dot: 'bg-fuchsia-400', text: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/20' },
}
const fallbackCat = { dot: 'bg-zinc-500', text: 'text-zinc-400', bg: 'bg-zinc-700/30', border: 'border-zinc-700/40' }
```
Este patrón es **idéntico** al `SEVERITY` de `NotificationItem.tsx` (4 colores).
El Gap A de la sección 9.4 ya lo documenta — ambos deben moverse a `config/component-styles.ts`.
Un componente `CoinLogCategoryBadge` o `ColorDotBadge` con CVA eliminaría ~60L duplicadas.

---

**#24 — `DEAL_GRADIENTS` en `DiscountCarousel.tsx`**
```typescript
// portal/ui/components/DiscountCarousel.tsx líneas 9-15 (ACTUAL)
const DEAL_GRADIENTS = [
  { bg: 'from-rose-950 via-zinc-950 to-zinc-950',    accent: '#f43f5e', glow: 'bg-rose-500/20'    },
  { bg: 'from-violet-950 via-zinc-950 to-zinc-950',  accent: '#8b5cf6', glow: 'bg-violet-500/20'  },
  { bg: 'from-amber-950 via-zinc-950 to-zinc-950',   accent: '#f59e0b', glow: 'bg-amber-500/20'   },
  { bg: 'from-sky-950 via-zinc-950 to-zinc-950',     accent: '#0ea5e9', glow: 'bg-sky-500/20'     },
  { bg: 'from-emerald-950 via-zinc-950 to-zinc-950', accent: '#10b981', glow: 'bg-emerald-500/20' },
]
// Se usa como: const theme = DEAL_GRADIENTS[idx % DEAL_GRADIENTS.length]
```
Problema: `accent` es un hex en `style={}` (no Tailwind). No es un bug, pero mezcla paradigmas.
Si games/academic necesitan cards temáticas similares → mover a `config/component-styles.ts` como `THEME_GRADIENTS`.

---

**#25 + #26 — `StudentRanking.tsx` (dos CVAs en un mismo componente)**
```typescript
// Rank badge (líneas 23-28)
cn('w-7 h-7 rounded-full...',
  i === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :  // oro
  i === 1 ? 'bg-zinc-300/20 text-zinc-300 border border-zinc-300/30'   :  // plata
  i === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30':  // bronce
  'text-zinc-600 border border-zinc-800'                                    // resto
)

// Reward button state (líneas 40-44)
cn('w-7 h-7 rounded-full...',
  reached  ? 'bg-amber-400 border-amber-200 text-amber-900 shadow-[...] hover:scale-125 cursor-pointer' :
  isNextR  ? 'bg-zinc-900 border-emerald-500/50 text-zinc-500 animate-pulse' :
  'bg-zinc-900 border-zinc-800 text-zinc-600 opacity-40 cursor-default grayscale'
)
```
Ambos son candidatos a componentes extraíbles con CVA:
- `RankBadge` → variant: `'1st' | '2nd' | '3rd' | 'default'`
- `RewardMilestoneButton` → variant: `'reached' | 'next' | 'locked'`
El componente `StudentRanking.tsx` (57L) quedaría en ~30L.

---

#### 9.6.3 Shared patterns cross-feature

Tres patrones se repiten en ≥2 features distintas:

**Patrón A — Color dot/badge (CAT_COLOR == SEVERITY)**
```
PerfilTab.tsx      → CAT_COLOR (6 colores, 4 keys: dot+text+bg+border)
NotificationItem   → SEVERITY_DOT + SEVERITY_BG (mismo patrón, 4 colores)
RecentHistory.tsx  → dot de coins (3 colores: emerald/blue/rose)
UserCard.tsx       → indicator activo/inactivo (2 colores)

→ TODOS pertenecen a config/component-styles.ts → SEVERITY_STYLES
→ Elimina ~40L distribuidas en 4 archivos
```

**Patrón B — Type badge (class vs individual)**
```
recompensas/RewardCard.tsx  → type: 'class' | 'individual' → blue/rose badge
portal/RecompensasTab.tsx   → mismo badge renderizado en el portal de alumno

→ Crear shared/RewardTypeBadge.tsx con CVA
→ Elimina duplicación entre panel admin y portal estudiante
```

**Patrón C — Role variant (admin vs student colors)**
```
usuarios/UserCard.tsx     → isAdmin → purple/blue (aura+avatar+role badge)
portal/PerfilTab.tsx      → PerfilTab renderiza info del estudiante (solo blue)
                           → Si se añade vista admin al portal → mismo patrón

→ Extender UserCard con CVA role variant
→ Si es solo 1 uso: mantener como está (acceptable)
```

---

#### 9.6.4 No hay CVA en estas features (confirmado)

| Feature | Por qué no hay CVA |
|---------|--------------------|
| `acciones/` | AccionesSection usa FilterSelect/FilterPopover externos. Cards estáticas. |
| `backup/` | ExportPanel/ImportPanel usan Button/Checkbox existentes. Sin variantes. |
| `cursos/` | CursoCard styling completamente estático. |
| `grupos/` | GroupCard styling completamente estático. |
| `dashboard/` | Un único componente de página. Ternarios de uso único = aceptables inline. |
| `estudiantes/` | CoinRangeFilter usa slider. EstudianteRow tiene un badge simple aceptable. |
| `notifications/` | La UI real está en `components/shared/` — ya auditada en §9.3. |

---

#### 9.6.5 Resumen total del proyecto

| Fuente | Candidatos | HIGH | MEDIUM | LOW |
|--------|-----------|------|--------|-----|
| `components/ui/` (§9.3) | 19 | 5 | 12 | 2 |
| `components/shared/` (§9.3) | 3 | 0 | 2 | 1 |
| **Features (§9.6)** | **12** | **4** | **4** | **4** |
| **TOTAL** | **34** | **9** | **18** | **7** |

**Impacto estimado si se implementan todos los HIGH + MEDIUM:**
- Líneas eliminadas: ~200–250L (duplicación + boilerplate de ternarios)
- Componentes nuevos (shared): `RankBadge`, `RewardMilestoneButton`, `RewardTypeBadge`, `ColorDotBadge`
- Config entries nuevas: `CAT_COLOR → SEVERITY_STYLES`, `DEAL_GRADIENTS → THEME_GRADIENTS`
- Features sin tocar (no tienen CVA): 7 de 14

---

#### 9.6.6 Fase E — Features CVA (nueva fase de refactor)

```
Rama: refactor/web-cva-features

Prerequisito: Fase A completada (config/component-styles.ts creado)

□ config/component-styles.ts   → añadir CAT_COLOR → SEVERITY_STYLES (6 colores) + THEME_GRADIENTS
□ components/shared/RankBadge.tsx          → CVA rank: '1st'|'2nd'|'3rd'|'default'
□ components/shared/RewardMilestoneButton.tsx → CVA state: 'reached'|'next'|'locked'
□ components/shared/RewardTypeBadge.tsx    → CVA type: 'class'|'individual'
□ portal/ui/PerfilTab.tsx       → importar SEVERITY_STYLES de config/, eliminar CAT_COLOR local
□ aula/ui/StudentRanking.tsx    → usar RankBadge + RewardMilestoneButton (57L → ~30L)
□ recompensas/ui/RewardCard.tsx → usar RewardTypeBadge (47L → ~30L)
□ portal/ui/RecompensasTab.tsx  → usar RewardTypeBadge (eliminar badge duplicado)
□ usuarios/ui/UserCard.tsx      → UserCard a CVA role variant (optional — solo 1 uso real)

Tests: typecheck ✓ lint ✓ build ✓ 284 web tests ✓
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
