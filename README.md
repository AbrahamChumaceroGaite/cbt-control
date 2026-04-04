# CBT Control Aula

Sistema de gamificación para el aula desarrollado con arquitectura **Clean Architecture + CQRS pragmático**. Permite a los docentes gestionar cursos, alumnos, grupos y otorgar monedas (coins) por comportamientos y logros. Los estudiantes acceden a su portal personal para ver su progreso y canjear recompensas.

---

## Tabla de contenidos

1. [Características principales](#características-principales)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Arquitectura](#arquitectura)
4. [Módulos del API](#módulos-del-api)
5. [Frontend](#frontend)
6. [Configuración local](#configuración-local)
7. [Base de datos](#base-de-datos)
8. [Docker](#docker)
9. [Push Notifications](#push-notifications)

---

## Características principales

### Panel de Administración

| Sección | Descripción |
|---------|-------------|
| **Aula (Dashboard)** | Línea de tiempo de recompensas de clase, ranking de alumnos, historial reciente. Selector de curso integrado junto al botón "Otorgar Coins". |
| **Otorgar Coins** | Modal de 3 pasos: ① seleccionar destinatarios (clase completa o alumnos individuales con búsqueda y chips), ② elegir acción del catálogo, ③ confirmar con resumen y total de coins. Ejecución paralela con `Promise.all`. |
| **Cursos** | CRUD completo. Al editar un curso se puede ajustar manualmente el contador de `classCoins`. |
| **Alumnos** | Tabla con búsqueda por nombre/código, filtro de rango de coins (doble slider), importación masiva desde Excel (.xlsx). |
| **Grupos** | CRUD de equipos de trabajo dentro de un curso. Selector de curso en la barra de acciones. |
| **Tienda** | Sección unificada con sub-tabs: **Acciones** (catálogo de comportamientos valorizados) y **Premios** (recompensas canjeables). |
| **Solicitudes** | Gestión de canjes solicitados por los alumnos: aprobar o rechazar. Badge en la barra de navegación muestra el total de solicitudes. |
| **Admin** | Gestión de usuarios del sistema (roles admin/student), configuración de notificaciones push. |

### Portal del Estudiante

- **Perfil**: monedas actuales, tramo desbloqueado, historial de transacciones.
- **Premios**: catálogo de recompensas individuales canjeables con las monedas propias.
- **Mis Solicitudes**: historial de canjes con estado (pendiente / aprobado / rechazado). Badge con total de solicitudes.

### Notificaciones Push

- Suscripción Web Push (VAPID) desde el navegador del alumno.
- El docente puede enviar notificaciones desde el panel de Admin.
- Servicio Worker registrado automáticamente en el portal del estudiante.

---

## Estructura del proyecto

```
cbt-control-aula/                  (raíz npm workspaces)
├── shared/    @control-aula/shared — tipos TypeScript compartidos frontend ↔ backend
├── api/       @control-aula/api   — NestJS, puerto 4001
├── web/       @control-aula/web   — Next.js App Router, puerto 3001
├── nginx/                          — configuración Nginx para producción
└── docker-compose.yml
```

Cada workspace tiene su propio `package.json`. La raíz solo administra la instalación conjunta.

---

## Arquitectura

### Flujo de datos (ejemplo: listar cursos)

```
Browser → GET /api/cursos
  → Next.js rewrite → NestJS :4001/api/cursos
    → CourseController
      → QueryBus → GetCoursesHandler
        → CourseRepository (abstract, dominio)
          → CourseRepositoryImpl (Prisma, infraestructura)
            → SQLite (dev) / PostgreSQL (prod)
          ← CourseEntity[]
        ← CourseMapper.toResponse(entity)[]
      ← CourseResponse[]  (@control-aula/shared)
    ← IApiResponse<CourseResponse[]>
  ← JSON { code, status, data, message }
← apiFetch<CourseResponse[]>('/api/cursos') → data
```

### Capas del API (`api/src/`)

| Capa | Directorio | Responsabilidad |
|------|-----------|----------------|
| **Presentación** | `modules/[x]/[x].controller.ts` | HTTP: valida input, delega a CommandBus/QueryBus |
| **Aplicación** | `modules/[x]/application/` | Commands + Handlers, Queries + Handlers, Mappers |
| **Dominio** | `modules/[x]/domain/` | Entidades (interfaces) y contratos de repositorio |
| **Infraestructura** | `modules/[x]/infrastructure/` | Implementaciones Prisma de los repositorios |
| **Común** | `common/` | `TransformInterceptor`, `GlobalExceptionFilter`, `JwtAuthGuard`, `@CurrentUser`, `@ResponseMessage` |

### CQRS pragmático

Sin event sourcing ni event bus. Solo `CommandBus` y `QueryBus` de `@nestjs/cqrs`.

```ts
// Command + Handler en el mismo archivo (escritura)
export class CreateCourseCommand { constructor(public readonly dto: CreateCourseDto) {} }

@CommandHandler(CreateCourseCommand)
export class CreateCourseHandler implements ICommandHandler<CreateCourseCommand, CourseResponse> {
  async execute({ dto }) {
    const entity = await this.repo.create(dto)
    return CourseMapper.toResponse(entity)
  }
}
```

### Formato de respuesta estándar

`TransformInterceptor` (registrado como `APP_INTERCEPTOR`) envuelve automáticamente cada respuesta:

```ts
{ code: number, status: 'success' | 'error', data: T | null, message: string }
```

El mensaje proviene del decorador `@ResponseMessage('texto')`. `GlobalExceptionFilter` convierte excepciones al mismo formato. En el frontend, `apiFetch<T>()` desenvuelve `.data` y lanza en caso de error.

### Transacciones atómicas (coins)

`PointService` en el API actualiza en una sola `prisma.$transaction()`:
- `course.classCoins` (si la acción afecta la clase)
- `student.coins` (si la acción afecta individuos)
- Un registro `CoinLog` (historial inmutable)

### Paquete shared (`shared/src/types/`)

Solo tipos TypeScript sin código de runtime. Se compila antes que `api` y `web`.

```
api-response.ts       IApiResponse<T>
user.types.ts         UserRole, SessionPayload, UserResponse, UserDetailResponse, UserCreateInput
course.types.ts       CourseResponse, CourseDetail, CourseInput
student.types.ts      StudentResponse, CoinLogResponse, TramoEntry, StudentInput, AwardCoinInput
action.types.ts       ActionResponse, ActionInput
reward.types.ts       RewardResponse, RedemptionResponse, RedemptionFullResponse, RewardInput
group.types.ts        GroupResponse, GroupMember, GroupInput
portal.types.ts       PortalStudentResponse
```

`SessionPayload` se define en `shared/` porque tanto el API (JWT strategy, guards) como el frontend (middleware edge runtime) lo necesitan.

---

## Módulos del API

| Módulo | Rutas | Descripción |
|--------|-------|-------------|
| `course` | `GET/POST/PUT/DELETE /api/cursos` | CRUD cursos + ajuste de `classCoins` |
| `student` | `GET/POST/PUT/DELETE /api/estudiantes`, `POST /api/estudiantes/import` | CRUD alumnos + importación masiva |
| `action` | `GET/POST/PUT/DELETE /api/acciones` | Catálogo de comportamientos valorados |
| `reward` | `GET/POST/PUT/DELETE /api/recompensas` | Tienda de recompensas |
| `reward` | `GET/PATCH/DELETE /api/solicitudes` | Gestión de canjes (SolicitudesController) |
| `group` | `GET/POST/PUT/DELETE /api/grupos` | Grupos de alumnos por curso |
| `point` | `POST /api/puntos` | Otorgar coins (transacción atómica) |
| `auth` | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | Autenticación JWT con cookie HttpOnly |
| `auth` | `GET/POST/DELETE /api/usuarios` | Gestión de usuarios del sistema (UserController) |
| `portal` | `GET /api/portal/me`, `GET /api/portal/recompensas`, `POST /api/portal/solicitudes` | Portal del estudiante |
| `push` | `POST /api/push/subscribe`, `DELETE /api/push/unsubscribe`, `POST /api/push/send` | Web Push VAPID |
| `notifications` | `GET /api/notifications` | Historial de notificaciones recibidas |
| `backup` | `GET /api/backup` | Descarga JSON completo de la base de datos |

---

## Frontend

### Diseño de capas (`web/src/`)

```
lib/           utilidades sin estado: apiFetch, jwt edge-safe, ACTION_COLORS, cn()
    ↓
services/      un objeto por dominio: coursesService, studentsService, pointsService…
    ↓
components/    ui/ — primitivos reutilizables (Button, Modal, Input, Toast…)
               shared/ — compuestos de sección (SectionHeader, Pagination,
                          CardActions, CourseSelect, FloatingNav)
    ↓
features/      secciones de UI por dominio con lógica propia
    ↓
app/           páginas Next.js como orquestadores delgados de estado y layout
```

### Páginas principales

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/login` | `app/login/page.tsx` | Formulario de autenticación |
| `/` | `app/page.tsx` | Dashboard admin (tabs: Aula, Cursos, Alumnos, Grupos, Tienda, Solicitudes, Admin) |
| `/portal` | `app/portal/page.tsx` | Portal del estudiante (tabs: Perfil, Premios, Mis Solicitudes) |

### Componentes compartidos clave

| Componente | Descripción |
|-----------|-------------|
| `SectionHeader` | Barra de herramientas unificada: icono + título + subtítulo + filtros + búsqueda + acciones. Altura `h-8` consistente en todos los controles. |
| `FloatingNav` | Barra de navegación flotante genérica (pill). Usada tanto por el admin como por el portal del estudiante. Soporta badges. |
| `CourseSelect` | Select de curso reutilizable, colocado estratégicamente en cada sección que lo necesita (Aula, Alumnos, Grupos). |
| `Pagination` | Paginación con control de tamaño de página. Default: 5 items/página. |
| `CardActions` | Botones de editar/eliminar para tarjetas de contenido. |

### Protección de rutas

`src/middleware.ts` corre en el Edge Runtime:
- Sin sesión → redirige a `/login`.
- Rol `student` → solo puede acceder a `/portal`, `/api/portal/*`, `/api/auth/*`, `/api/notifications`, `/api/push`.
- Rol `admin` → acceso completo.

---

## Configuración local

### Requisitos

- Node.js >= 18.17
- SQLite (desarrollo) / PostgreSQL >= 14 (producción)

### Variables de entorno

**`api/.env`** (copiar de `api/.env.example`):
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="cambiar-en-produccion"
PORT=4001
WEB_ORIGIN=http://localhost:3001
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:admin@example.com"
```

**`web/.env`** (copiar de `web/.env.example`):
```env
API_URL=http://localhost:4001
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
```

Para generar las claves VAPID:
```bash
npx web-push generate-vapid-keys
```

### Instalación y desarrollo

```bash
# Instalar todas las dependencias desde la raíz
npm install

# Compilar el paquete shared (requerido antes que api y web)
npm run build:shared

# Primera vez: aplicar schema y poblar la BD
cd api && npx prisma db push && npm run db:seed && cd ..

# Iniciar en terminales separadas
npm run dev:api    # NestJS  → http://localhost:4001
npm run dev:web    # Next.js → http://localhost:3001
```

### Comandos útiles (desde `api/`)

```bash
npx prisma db push      # Aplicar cambios del schema a SQLite
npm run db:seed         # Repoblar BD desde src/data/
npm run db:studio       # Abrir Prisma Studio en :5555
```

### Build de producción

```bash
npm run build   # shared → api → web (en orden)
```

### Datos iniciales (`api/src/data/`)

| Archivo | Contenido |
|---------|-----------|
| `courses.ts` | Cursos S2A, S2B, S2C con planta asignada |
| `students.ts` | Nóminas por curso (`STUDENTS_BY_COURSE`) |
| `actions.ts` | Catálogo de acciones con categoría y coins |
| `rewards.ts` | Recompensas de clase e individuales |
| `tramos.ts` | Definición de T1–T7 y colores de categorías (`ACTION_COLORS`) |

Para agregar cursos, alumnos o ajustar puntos: editar `src/data/` y correr `npm run db:seed`.

---

## Base de datos

### Diagrama de relaciones

```
Course ─── Student ─── CoinLog ─── Action
   │           │
   │           ├── GroupMember ── Group ── Course
   │           ├── RedemptionRequest ── Reward
   │           └── StudentRedemption ── Reward
   │
   └── Redemption ── Reward

User ─── Student (vínculo opcional al portal)
PushSubscription ─── User
```

### Entidades principales

| Entidad | Campos clave | Descripción |
|---------|-------------|-------------|
| `Course` | `name`, `level`, `parallel`, `classCoins` | Clase académica con monedas grupales |
| `Student` | `name`, `code`, `email`, `coins`, `courseId` | Alumno con coins individuales |
| `Action` | `name`, `coins`, `category`, `affectsClass`, `affectsStudent`, `isActive` | Comportamiento valorado |
| `CoinLog` | `coins`, `reason`, `studentId?`, `courseId`, `actionId?` | Historial inmutable |
| `Reward` | `name`, `icon`, `coinsRequired`, `type` (`class`/`individual`), `isActive` | Recompensa canjeable |
| `RedemptionRequest` | `studentId`, `rewardId`, `status` (`pending`/`approved`/`rejected`) | Solicitud de canje del alumno |
| `Group` | `name`, `courseId` | Equipo de trabajo |
| `User` | `code`, `password` (hash), `role`, `fullName` | Cuenta de acceso al sistema |
| `PushSubscription` | `endpoint`, `p256dh`, `auth`, `userId` | Suscripción Web Push |

---

## Docker

### Arquitectura de contenedores

```
docker-compose.yml
├── api    → :4001  NestJS (multi-stage, standalone)
├── web    → :3001  Next.js (multi-stage, standalone output)
└── nginx  → :80   Reverse proxy: /api/* → api, /* → web
```

### Persistencia

SQLite con volumen Docker (`sqlite_data`) montado en `/app/data/prod.db`. Persiste entre reinicios. Para escalado horizontal, cambiar `DATABASE_URL` a PostgreSQL.

### Entrypoint automático

`api/docker-entrypoint.sh` ejecuta `prisma db push && npm run db:seed` antes de arrancar, garantizando que la BD esté migrada y con datos iniciales en cada despliegue.

```bash
# Construir y levantar todos los servicios
docker compose up --build

# Producción en background
docker compose up -d --build
```

---

## Push Notifications

El sistema usa la Web Push API con claves VAPID.

**Flujo de suscripción (estudiante):**
1. `usePushNotifications()` hook registra el Service Worker (`/sw.js`).
2. Llama a `Notification.requestPermission()` y `registration.pushManager.subscribe(...)`.
3. Envía la suscripción al API: `POST /api/push/subscribe`.

**Envío de notificación (docente):**
1. Desde el panel Admin → sección Notificaciones.
2. El API llama a `web-push.sendNotification()` a todas las suscripciones activas del usuario objetivo.

**Logout limpio:**
- `unsubscribeForLogout()` elimina la suscripción del navegador y llama a `DELETE /api/push/unsubscribe` antes de cerrar sesión.

---

Ing. Abraham CG — 2026 · All rights reserved
