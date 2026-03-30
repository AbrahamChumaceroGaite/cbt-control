# CBT Control Aula

Sistema de gamificación y gestión de puntos para el aula. Arquitectura **Clean Architecture + CQRS pragmático**, con backend NestJS desacoplado del frontend Next.js y un paquete interno de tipos compartidos.

---

## Estructura del proyecto (npm workspaces)

```
cbt-control-aula/
├── shared/       @control-aula/shared — tipos compartidos frontend ↔ backend
├── api/          @control-aula/api    — NestJS, puerto 4001
└── web/          @control-aula/web    — Next.js App Router, puerto 3001
```

Cada workspace tiene su propio `package.json`. La raíz solo administra la instalación conjunta vía npm workspaces.

---

## Arquitectura

### Flujo de datos

```
Browser → GET /api/cursos
  → Next.js rewrite → NestJS :4001/api/cursos
    → CourseController
      → QueryBus → GetCoursesHandler
        → CourseRepository (interface)
          → CourseRepositoryImpl (Prisma)
            → SQLite / PostgreSQL
          ← CourseEntity[]
        ← CourseMapper.toResponse(entity)[]
      ← CourseResponse[] (tipo de @control-aula/shared)
    ← IApiResponse<CourseResponse[]>
  ← JSON { code, status, data, message }
← apiFetch<CourseResponse[]>('/api/cursos') → data
```

### Capas del API (`api/src/`)

| Capa | Directorio | Responsabilidad |
|------|-----------|----------------|
| **Presentación** | `modules/[x]/[x].controller.ts` | HTTP: recibe request, llama CommandBus/QueryBus, devuelve datos crudos |
| **Aplicación** | `modules/[x]/application/` | Commands + Handlers, Queries + Handlers, Mappers |
| **Dominio** | `modules/[x]/domain/` | Entidades (interfaces), repositorios abstractos |
| **Infraestructura** | `modules/[x]/infrastructure/` | Implementaciones Prisma de los repositorios |
| **Común** | `common/` | `TransformInterceptor`, `GlobalExceptionFilter`, `JwtAuthGuard`, `@CurrentUser`, `@ResponseMessage` |

### CQRS (pragmático)

- **Commands** (escritura): DTO + Command class + `@CommandHandler` en un solo archivo.
- **Queries** (lectura): Query class + `@QueryHandler` en un solo archivo.
- Sin event bus, sin event sourcing — solo `CommandBus` y `QueryBus` de `@nestjs/cqrs`.

```ts
// Ejemplo: crear un curso
export class CreateCourseDto { @IsString() name!: string; ... }
export class CreateCourseCommand { constructor(public readonly dto: CreateCourseDto) {} }

@CommandHandler(CreateCourseCommand)
export class CreateCourseHandler implements ICommandHandler<CreateCourseCommand, CourseResponse> {
  async execute({ dto }) {
    const course = await this.repo.create(dto)
    return CourseMapper.toResponse(course)   // solo el mapper transforma, no el handler
  }
}
```

### Interceptor y formato estándar de respuesta

Los controllers devuelven datos crudos. El `TransformInterceptor` (registrado como `APP_INTERCEPTOR` en `AppModule`) envuelve automáticamente cada respuesta en `IApiResponse<T>` (definido en `shared/`):

```ts
{ code: number, status: 'success' | 'error', data: T | null, message: string }
```

El mensaje se lee del decorador `@ResponseMessage('texto')` aplicado al handler; si no hay decorador, usa `'OK'`. El `GlobalExceptionFilter` convierte automáticamente cualquier excepción al mismo formato con `status: 'error'`. En el frontend, `apiFetch<T>()` desenvuelve `.data` y lanza en caso de error.

```ts
// Controller — solo datos crudos, sin envolver manualmente
@Post()
@HttpCode(201)
@ResponseMessage('Curso creado')
create(@Body() dto: CreateCourseDto) {
  return this.cb.execute(new CreateCourseCommand(dto))  // CourseResponse
}
// El interceptor produce: { code: 201, status: 'success', data: CourseResponse, message: 'Curso creado' }
```

### Paquete shared (`shared/src/`)

Solo tipos TypeScript — sin runtime code. Se compila a `dist/` antes que los otros workspaces.

Cada archivo de dominio exporta dos familias de tipos:
- `*Response` — forma que el API devuelve (lectura)
- `*Input` — forma que el API acepta (escritura); los DTOs del backend la implementan, los services del frontend la usan

```
shared/src/types/
  api-response.ts     IApiResponse<T>
  user.types.ts       UserRole, SessionPayload, UserResponse, UserDetailResponse, UserCreateInput
  course.types.ts     CourseResponse, CourseDetail, CourseInput
  student.types.ts    StudentResponse, CoinLogResponse, TramoEntry, StudentInput, AwardCoinInput
  action.types.ts     ActionResponse, ActionInput
  reward.types.ts     RewardResponse, RedemptionResponse, RedemptionFullResponse, RewardInput
  group.types.ts      GroupResponse, GroupMember, GroupInput
  portal.types.ts     PortalStudentResponse
```

`SessionPayload` vive en `shared/` — es el único tipo que tanto el API (JWT strategy, guards) como el frontend (middleware, edge runtime) necesitan simultáneamente. El dominio API y `web/lib/jwt.ts` lo re-exportan desde shared.

**Contrato frontend ↔ backend:** si se agrega un campo a `*Input` en shared y el DTO del backend lo implementa, el build del web falla si el service no lo actualiza. El compilador es el guardián del contrato.

### Módulos del API

| Módulo | Controller(s) | Descripción |
|--------|--------------|-------------|
| `course` | `GET/POST/PUT/DELETE /api/cursos` | CRUD cursos |
| `student` | `GET/POST/PUT/DELETE /api/estudiantes` + `POST /import` | CRUD alumnos + importación masiva |
| `action` | `GET/POST/PUT/DELETE /api/acciones` | CRUD acciones/comportamientos |
| `reward` | `GET/POST/PUT/DELETE /api/recompensas` | CRUD recompensas |
| `group` | `GET/POST/PUT/DELETE /api/grupos` | CRUD grupos de alumnos |
| `point` | `POST /api/puntos` | Otorgar monedas (transacción atómica) |
| `auth` | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | Autenticación JWT (cookie) |
| `usuarios` | `GET/POST/DELETE /api/usuarios` | Gestión usuarios del sistema |
| `portal` | `GET /api/portal/me`, `GET /api/portal/recompensas`, `POST /api/portal/solicitudes` | Portal del estudiante |
| `solicitudes` | `GET/PATCH/DELETE /api/solicitudes` | Gestión de solicitudes de recompensas (admin) |
| `backup` | `GET /api/backup` | Descarga JSON completo de la BD |

### Frontend (`web/src/`) — Feature-Sliced Design (FSD)

La arquitectura del frontend sigue **Feature-Sliced Design**: dependencias en una sola dirección, de capas inferiores hacia superiores.

```
lib/           (utilidades sin estado — apiFetch, jwt, constants)
    ↓
services/      (llamadas HTTP por dominio — coursesService, studentsService…)
    ↓
components/    (primitivos reutilizables — SectionHeader, CardActions, Pagination)
    ↓
features/      (secciones de UI por dominio — aula/, cursos/, estudiantes/…)
    ↓
app/           (páginas Next.js — orquestadores delgados de estado y layout)
```

Analogía con el backend: `lib` ≈ dominio/infraestructura, `services` ≈ aplicación, `features` ≈ presentación, `app` ≈ router.

| Capa | Directorio | Responsabilidad |
|------|-----------|----------------|
| **lib** | `src/lib/` | `apiFetch<T>()`, `verifyToken` (JWT edge-safe), `ACTION_COLORS` |
| **services** | `src/services/` | Un objeto por dominio con todos los métodos HTTP; ningún componente llama `apiFetch` directamente |
| **components** | `src/components/shared/` | Primitivos sin lógica de negocio, reutilizados entre features |
| **features** | `src/features/[domain]/` | Componentes con lógica de UI por dominio; importan su service |
| **app** | `src/app/` | Pages como orquestadores: estado global, composición de features, rutas |

- `src/middleware.ts` — protección de rutas: redirige a `/login` si no hay sesión válida; estudiantes solo acceden a `/portal`.
- `next.config.js` — rewrite de `/api/*` → `http://localhost:4001/api/*`.

---

## Configuración local

### Requisitos
- Node.js >= 18.17
- SQLite (desarrollo) / PostgreSQL >= 14 (producción)

### Variables de entorno

**`api/.env`** (copia de `api/.env.example`):
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="cambiar-en-produccion"
PORT=4001
WEB_ORIGIN=http://localhost:3001
```

**`web/.env`** (copia de `web/.env.example`):
```env
API_URL=http://localhost:4001
```

### Instalación y desarrollo

```bash
# Instalar todas las dependencias (una sola vez desde raíz)
npm install

# Compilar el paquete shared (requerido antes de api y web)
npm run build:shared

# Aplicar schema y poblar BD (solo primera vez)
cd api && npx prisma db push && npm run db:seed && cd ..

# Iniciar api y web en terminales separadas
npm run dev:api    # NestJS en :4001
npm run dev:web    # Next.js en :3001
```

### Build de producción

```bash
npm run build   # shared → api → web (en orden)
```

---

## Modelos de base de datos

```
Course ─── Student ─── StudentTramo
   │           │
   │           ├── CoinLog ─── Action
   │           ├── GroupMember ── Group ── Course
   │           ├── RedemptionRequest ── Reward
   │           └── StudentRedemption ── Reward
   │
   └── Redemption ── Reward

User ─── Student (opcional, vínculo al portal)
```

- **Course**: clase académica con `classCoins` (monedas de clase).
- **Student**: alumno con `coins` individuales y `tramos` (niveles desbloqueados).
- **Action**: comportamiento valorado en monedas, puede afectar clase y/o alumno.
- **CoinLog**: historial inmutable de transacciones de monedas.
- **Reward**: recompensa (tipo `class` o `individual`).
- **RedemptionRequest**: solicitud de canje del alumno, flujo `pending → approved/rejected`.
- **Group**: agrupación de alumnos dentro de un curso.

---

## Docker

El proyecto incluye Dockerfiles multi-stage por workspace (`api/Dockerfile`, `web/Dockerfile`) y un `docker-compose.yml` en raíz con Nginx como reverse proxy.

```
docker-compose.yml
├── api   → :4001 (NestJS)
├── web   → :3001 (Next.js standalone)
└── nginx → :80  (/api/* → api, /* → web)
```

**Base de datos:** SQLite con volumen Docker (`sqlite_data`) montado en `/app/prisma`. El archivo `dev.db` persiste entre reinicios. Esto es apropiado para despliegue en servidor único; para escalado horizontal, cambiar `DATABASE_URL` a PostgreSQL.

El entrypoint del API (`api/docker-entrypoint.sh`) ejecuta automáticamente `prisma db push` y `npm run db:seed` antes de arrancar, garantizando que la BD esté migrada y con datos iniciales.

```bash
docker compose up --build
```
