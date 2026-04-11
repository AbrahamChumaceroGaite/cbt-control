# CLAUDE.md — Reglas de Operación de Claude Code
# cbt-control-aula · Monorepo NestJS + Next.js

> **Este archivo gobierna CÓMO opera Claude Code: flujo de trabajo, verificación,
> arquitectura, convenciones, testing, seguridad y auto-corrección.**
> Leerlo completo antes de escribir una sola línea de código en cada sesión.

---

## 0. Identidad y estándar de trabajo

Operas como **senior software engineer** en un sistema de producción usado por
estudiantes y profesores reales.

```
Lento + correcto + verificado > rápido + roto
Una tarea no está terminada cuando terminas de escribir.
Está terminada cuando todas las verificaciones pasan a cero errores.
```

**Nunca asumas. Lee el código real antes de proponer cualquier cambio.**

---

## 1. Procedimiento de inicio de sesión (obligatorio)

Al iniciar CADA sesión de Claude Code:

```
1. Leer CLAUDE.md (este archivo)
2. Leer MEMORY.md en ~/.claude/projects/.../memory/
3. Verificar si hay un plan activo en ~/.claude/plans/
4. Estado: "Listo. Tarea: [X]. Archivos afectados: [lista]."
5. Preguntar dudas ANTES de escribir código
```

---

## 2. Flujo de trabajo obligatorio — toda tarea sin excepción

```
RECIBIR TAREA
     │
     ▼
PASO 1 — ENTENDER (antes de tocar el código)
  ├── ¿Qué capas se ven afectadas?
  ├── ¿Qué archivos se crearán o modificarán?
  ├── ¿Qué existe que pueda reutilizarse?
  └── Declarar el plan antes de ejecutarlo

     │
     ▼
PASO 2 — AUDITAR ANTES DE CREAR (obligatorio, no se omite)

  BACKEND: antes de crear algo nuevo:
  ├── ¿Existe entidad/repositorio? → modules/{name}/domain/
  ├── ¿Existe DTO, mapper, handler? → modules/{name}/application/
  │     Si existe similar → extender por herencia/composición
  ├── ¿Existe tipo en @control-aula/shared?
  └── Si nada existe → crear en la capa correcta

  FRONTEND: antes de crear algo nuevo:
  ├── ¿Existe componente? → components/ui/ y components/shared/
  │     Si existe → ¿puedo agregar una prop en vez de duplicar?
  ├── ¿Existe hook? → hooks/
  │     Si existe → extender, nunca crear hook paralelo
  ├── ¿Existe utilidad? → lib/utils.ts
  ├── ¿Existe constante? → config/
  ├── ¿Existe llamada API? → features/{name}/infrastructure/*.service.ts
  └── Si nada existe → crear en capa correcta

  REGLA: leer código existente PRIMERO, crear DESPUÉS.
  Crear un archivo nuevo requiere prueba de que ninguno existente podía extenderse.

     │
     ▼
PASO 3 — IMPLEMENTAR (capa por capa, en orden)
  Backend:  domain → application → infrastructure → presentation
  Frontend: domain/types → infrastructure/service → application/mapper
            → application/hook → ui/components → ui/section

     │
     ▼
PASO 4 — SELF-REVIEW (antes de declarar terminado)
  Ejecutar el checklist completo de la Sección 15.
  Todo ítem debe pasar. Si alguno falla → corregir antes de continuar.

     │
     ▼
PASO 5 — VERIFICACIÓN DE TESTS + BUILD (ambos obligatorios)

  Tests PRIMERO:
    api → node_modules/.bin/vitest run --config api/vitest.config.ts
    web → cd web && ../node_modules/.bin/vitest run

  Luego build:
    api → cd api && pnpm typecheck && pnpm build
    web → cd web && pnpm typecheck && pnpm build && npm run lint -w web

  Cero errores. Cero warnings. Cero tests fallidos.

     │
     ▼
PASO 6 — ENTREGAR
  Declarar:
  ├── Archivos creados (lista)
  ├── Archivos modificados (archivo + qué cambió)
  ├── Tests añadidos
  ├── Resultados del build (typecheck ✓, build ✓, tests ✓, lint ✓)
  └── Decisiones que se desvían del plan (con justificación)
```

**No hay PASO 6 sin PASO 5 con exit code 0 en todo.**

---

## 3. Comandos de auto-corrección

Cuando el usuario (o yo mismo) detecte una desviación, activar el comando correspondiente:

### `/audit` — Auditoría completa del proyecto
```
Ejecutar en orden:
1. Grep `any` en api/src/**/*.ts y web/src/**/*.{ts,tsx} (excl. tests)
2. Grep `console.log` en src/ de ambos proyectos
3. Medir líneas de todos los handlers, mappers, controllers, hooks, sections
4. Grep `require(` en web/src/**/*.ts (no en tests) — indica import CJS incorrecto
5. Verificar guards en todos los controllers de api/src/modules/**/presentation/*.controller.ts
6. Listar imports no utilizados (del resultado de lint)
7. Reportar tabla de violaciones encontradas
```

### `/self-check` — Verificación antes de declarar terminado
```
Responder estas preguntas antes de declarar "hecho":
□ ¿Ningún archivo nuevo supera su límite de líneas?
□ ¿Cero usos de `any`?
□ ¿Cero `console.log`?
□ ¿Los tests pasan? (ejecutar el comando)
□ ¿El build pasa? (ejecutar el comando)
□ ¿El lint pasa a cero warnings?
□ ¿Cada nueva función tiene test?
□ ¿No se duplicó lógica existente?
Si algún ítem es NO → corregir antes de continuar.
```

### `/fix-violation <archivo>` — Corregir una violación específica
```
1. Leer el archivo completo
2. Identificar todas las violaciones presentes
3. Corregirlas en un solo commit
4. Re-ejecutar tests + build + lint
5. Reportar qué se corrigió
```

### `/fix-any` — Eliminar todos los `any` del proyecto
```
1. grep -r ": any" api/src --include="*.ts" (excl. tests)
2. grep -r ": any" web/src --include="*.ts" (excl. tests)
3. Para cada instancia: reemplazar con tipo explícito
4. Si el tipo es desconocido: usar `unknown` + type guard
5. Nunca usar `as Type` sin verificación previa
```

### `/fix-size <archivo>` — Reducir un archivo que supera el límite
```
1. Leer el archivo completo
2. Identificar grupos de responsabilidad
3. Extraer cada grupo a su propio archivo
4. Actualizar imports en archivos que dependen del original
5. Verificar que tests siguen pasando
```

### `/new-feature <nombre>` — Scaffold de feature completa
```
Crear en orden (no saltar pasos):
Backend:
  api/src/modules/{nombre}/domain/{nombre}.entity.ts
  api/src/modules/{nombre}/domain/{nombre}.repository.ts
  api/src/modules/{nombre}/application/dtos/{nombre}.dto.ts
  api/src/modules/{nombre}/application/{nombre}.mapper.ts
  api/src/modules/{nombre}/application/commands/create-{nombre}.command.ts
  api/src/modules/{nombre}/application/commands/create-{nombre}.handler.ts
  api/src/modules/{nombre}/infrastructure/{nombre}.repository.impl.ts
  api/src/modules/{nombre}/presentation/{nombre}.controller.ts
  api/src/modules/{nombre}/{nombre}.module.ts
  api/src/modules/{nombre}/domain/__tests__/{nombre}.entity.spec.ts
  api/src/modules/{nombre}/application/__tests__/{nombre}.mapper.spec.ts
  api/src/modules/{nombre}/application/__tests__/create-{nombre}.handler.spec.ts

Frontend:
  web/src/features/{nombre}/domain/types.ts
  web/src/features/{nombre}/infrastructure/{nombre}.service.ts
  web/src/features/{nombre}/application/{nombre}.mapper.ts
  web/src/features/{nombre}/application/use{Nombre}.ts
  web/src/features/{nombre}/ui/{Nombre}Section.tsx
  web/src/features/{nombre}/infrastructure/__tests__/{nombre}.service.spec.ts
  web/src/features/{nombre}/application/__tests__/{nombre}.mapper.spec.ts
  web/src/features/{nombre}/application/__tests__/use{Nombre}.spec.ts
```

---

## 4. Inventario del proyecto (estado real, 2026-04-10)

### Backend — Módulos activos

| Módulo | Entidad | Handlers | Mapper | Controller | Tests |
|--------|---------|----------|--------|------------|-------|
| action | ✓ | ✓ | ✓ | ✓ | ✓ parcial |
| auth | ✓ | ✓ | ✓ | ✓ | ✓ parcial |
| bank | ✓ | ✓ | ✓ | ✓ | ✗ pendiente |
| backup | — | — | — | ✓ (256 líneas ⚠️) | ✗ pendiente |
| course | ✓ | ✓ | ✓ | ✓ | ✗ parcial |
| group | ✓ | ✓ | ✓ | ✓ | ✓ parcial |
| inbox | ✓ | ✓ | ✓ | ✓ | ✗ pendiente |
| point | ✓ | ✓ | ✓ | ✓ | ✗ parcial |
| portal | ✓ | ✓ | ✓ | ✓ | ✗ pendiente |
| push | ✓ | ✓ | ✓ | ✓ | ✗ pendiente |
| reward | ✓ | ✓ | ✓ | ✓ | ✓ parcial |
| student | ✓ | ✓ | ✓ | ✓ | ✓ parcial |

### Frontend — Features activas

| Feature | domain/types | service | mapper | hook | ui/Section | Tests |
|---------|-------------|---------|--------|------|------------|-------|
| acciones | ✓ | ✓ | ✓ | ✓ (120L) | ✓ | ✓ |
| aula | ✓ | ✓ | ✓ | ✓ (132L ⚠️) | ✓ | ✓ |
| backup | — | ✓ | — | ✓ | ✓ | ✓ |
| cursos | ✓ | ✓ | ✓ | ✓ (106L) | ✓ | ✓ |
| dashboard | — | — | — | ✓ | ✓ | — |
| estudiantes | ✓ | ✓ | ✓ | ✓ (144L ⚠️) | ✓ (85L ⚠️) | ✓ |
| grupos | ✓ | ✓ | ✓ | ✓ (119L) | ✓ | ✓ |
| notifications | ✓ | ✓ | — | — | ✓ | — |
| portal | ✓ | ✓ | ✓ | ✓ (103L) | ✓ | ✓ |
| recompensas | ✓ | ✓ | ✓ | ✓ (123L ⚠️) | ✓ | ✓ |
| solicitudes | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| tienda | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| usuarios | ✓ | ✓ | ✓ | ✓ (111L) | ✓ (98L ⚠️) | ✓ |

### Tipos compartidos — @control-aula/shared

Exportados desde `shared/src/index.ts`:
- `IApiResponse` — envelope base
- `CourseResponse`, `CourseDetail`, `CourseInput`
- `StudentResponse`, `CoinLogResponse`, `TramoEntry`, `StudentInput`, `AwardCoinInput`
- `ActionResponse`, `ActionInput`
- `RewardResponse`, `RedemptionResponse`, `RedemptionFullResponse`, `RewardInput`
- `GroupResponse`, `GroupMember`, `GroupInput`
- `PortalStudentResponse`
- `CoinTransactionResponse`, `WeeklyBankStatus`, `StudentSearchResult`, `CreateTransactionInput`, `ProcessTransactionInput`
- `UserResponse`, `UserRole`, `UserDetailResponse`, `UserCreateInput`, `SessionPayload`

**Regla:** Antes de definir cualquier tipo nuevo, verificar si ya existe aquí.

---

## 5. Arquitectura — reglas inamovibles

### 5.1 Backend (NestJS + CQRS + Prisma)

**Estructura de módulo — capas en orden:**
```
modules/{name}/
  domain/
    {name}.entity.ts          ← Reglas de negocio y validación
    {name}.repository.ts      ← Interface abstracta del repositorio
    __tests__/
      {name}.entity.spec.ts
  application/
    dtos/
      {name}.dto.ts           ← Validación de entrada (class-validator)
    commands/
      {cmd}.command.ts
      {cmd}.handler.ts
    queries/
      {qry}.query.ts
      {qry}.handler.ts
    {name}.mapper.ts          ← Entity → Response DTO
    __tests__/
      {name}.mapper.spec.ts
      {cmd}.handler.spec.ts
  infrastructure/
    {name}.repository.impl.ts ← Implementación con Prisma
  presentation/
    {name}.controller.ts      ← HTTP routes, guards, decorators
  {name}.module.ts
```

**Orden de implementación:** domain → application → infrastructure → presentation
**Nunca:** implementar presentation antes que domain.

**Handlers CQRS:**
```typescript
// CreateXxxHandler recibe XxxRepository (interfaz), no implementación
@CommandHandler(CreateXxxCommand)
export class CreateXxxHandler implements ICommandHandler<CreateXxxCommand> {
  constructor(@Inject(XXX_REPOSITORY) private readonly repo: XxxRepository) {}

  async execute({ dto }: CreateXxxCommand) {
    const entity = XxxEntity.create(dto)  // validación en la entidad
    return XxxMapper.toResponse(await this.repo.create(entity))
  }
}

// NUNCA: lógica de negocio en el handler
// NUNCA: try/catch para errores de dominio (los propaga GlobalExceptionFilter)
// NUNCA: llamar Prisma directamente desde el handler
```

**Entidades:**
```typescript
export class XxxEntity {
  private constructor(/* campos */) {}

  static create(dto: XxxInput): XxxEntity {
    // Validar TODAS las reglas de negocio aquí, no en el handler
    if (!dto.name || dto.name.length < 2)
      throw new Error('Name must be at least 2 characters')
    return new XxxEntity(/* campos */)
  }
}
```

**Mappers:**
```typescript
export class XxxMapper {
  // ✅ Tipado explícito — nunca 'any'
  static toResponse(entity: XxxEntity): XxxResponse {
    return { id: entity.id, name: entity.name, ... }
  }
  // Nunca exponer campos sensibles (passwordHash, tokens)
}
```

**Repositorios:**
```typescript
// Abstract interface en domain/ (sin Prisma)
export interface XxxRepository {
  findById(id: string): Promise<XxxEntity | null>
  create(entity: XxxEntity): Promise<XxxEntity>
  update(entity: XxxEntity): Promise<XxxEntity>
  delete(id: string): Promise<void>
}

// Implementación en infrastructure/ (con Prisma)
@Injectable()
export class XxxRepositoryImpl implements XxxRepository {
  // Solo Prisma aquí — sin lógica de negocio
  // select solo los campos necesarios (nunca findMany() sin select)
}
```

**Controllers:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
@Controller('xxx')
export class XxxController {
  constructor(private readonly commandBus: CommandBus,
              private readonly queryBus: QueryBus) {}

  @Get()
  getAll() { return this.queryBus.execute(new GetAllXxxQuery()) }

  @Post()
  create(@Body() dto: CreateXxxDto) {
    return this.commandBus.execute(new CreateXxxCommand(dto))
  }
  // Máximo 80 líneas. Si supera → extraer sub-controller o queries separadas.
}
```

### 5.2 Frontend (Next.js 14 App Router + React 18)

**Estructura de feature:**
```
features/{name}/
  domain/
    types.ts                  ← ViewModel, Form types (no lógica)
  infrastructure/
    {name}.service.ts         ← HTTP calls usando lib/api.ts
    __tests__/
      {name}.service.spec.ts
  application/
    {name}.mapper.ts          ← Response → ViewModel → Form DTO
    use{Name}.ts              ← Estado + handlers (única fuente de verdad)
    __tests__/
      {name}.mapper.spec.ts
      use{Name}.spec.ts
  ui/
    {Name}Section.tsx         ← Shell de la sección (max 80L)
    components/
      {ComponentName}.tsx     ← Componente específico (max 100L)
```

**Orden de implementación:**
domain/types → infrastructure/service → application/mapper → application/hook → ui/components → ui/section

**Hooks:**
```typescript
export function useXxx() {
  // Estado local — no en Zustand salvo que sea global
  const [items, setItems] = useState<XxxViewModel[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  // Derived state — nunca como useState separado
  const filtered = useMemo(
    () => items.filter(applyFilters),
    [items, filters]
  )

  // Callbacks estables
  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await xxxService.getAll()
      setItems(data.map(XxxMapper.toViewModel))
    } catch (err: unknown) {
      // ✅ unknown, nunca any
      showToast((err as Error).message, false)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  return { items, filtered, loading, handlers: { load } }
}
// Máximo 150 líneas. Si supera → extraer sub-hook por responsabilidad.
```

**Services:**
```typescript
// Solo HTTP. Sin lógica. Sin estado.
import { api } from '@/lib/api'
import { API_ROUTES } from '@/config/routes'

export const xxxService = {
  getAll: () => api<XxxResponse[]>('GET', API_ROUTES.XXX.BASE),
  create: (dto: XxxInput) => api<IApiResponse<XxxResponse>>('POST', API_ROUTES.XXX.BASE, dto),
}
// Máximo 60 líneas.
```

**Sections (páginas-feature):**
```typescript
// Shell delgado — no contiene lógica propia
export function XxxSection() {
  const { items, loading, handlers } = useXxx()
  // Solo renderizado condicional y composición de componentes
  // Máximo 80 líneas
}
```

**Componentes:**
```typescript
// Reciben todo por props — sin lógica de negocio
// Máximo 100 líneas (UI atoms en components/ui/ → 120 líneas)
// Memoizar con React.memo si es renderizado frecuente
// Callbacks siempre por prop, nunca directamente desde el hook en JSX
```

---

## 6. TypeScript — reglas absolutas

```typescript
// ❌ CUALQUIER uso de `any` es error bloqueante
function process(data: any): any { }

// ✅ Tipo explícito siempre
function process(data: ActionResponse): ActionViewModel { }

// ❌ Type assertion sin verificación
const result = response as ActionResponse

// ✅ Narrowing con type guard
if (isActionResponse(response)) { /* safe */ }

// ❌ Non-null assertion sin certeza
const name = user!.name

// ✅ Guard explícito
if (!user) throw new Error('User is required')
const name = user.name

// ❌ Error sin tipo
catch (err) { showToast(err.message) }

// ✅ Tipo unknown + cast controlado
catch (err: unknown) {
  showToast(err instanceof Error ? err.message : 'Error desconocido', false)
}

// ❌ @ts-ignore — jamás
// ✅ Resolver la incompatibilidad de tipos real
```

---

## 7. Límites de tamaño de archivo — límites duros

| Tipo de archivo | Límite | Acción si supera |
|----------------|--------|-----------------|
| `*.entity.ts` | 100 L | Extraer value objects |
| `*.dto.ts` | 60 L | Dividir en DTOs separados |
| `*.command.ts` / `*.query.ts` | 20 L | — |
| `*.handler.ts` | 50 L | Extraer lógica a servicio de dominio |
| `*.mapper.ts` (api) | 60 L | Extraer sub-mappers |
| `*.repository.ts` (abstract) | 40 L | — |
| `*.repository.impl.ts` | 150 L | Extraer por dominio |
| `*.controller.ts` | 80 L | Dividir en sub-controllers |
| `*.module.ts` | 50 L | — |
| `domain/types.ts` (web) | 80 L | — |
| `*.mapper.ts` (web) | 80 L | Extraer sub-mappers |
| `use*.ts` (hook) | **150 L** | Extraer sub-hook por responsabilidad |
| `*.service.ts` (web) | 60 L | — |
| `*Section.tsx` | **80 L** | Extraer sub-secciones |
| `ui/components/*.tsx` | 100 L | Extraer sub-componentes |
| `components/ui/**` | 120 L | — |
| `hooks/*.ts` | 80 L | — |

**Un archivo de 151 líneas cuando el límite es 150 es una violación que se corrige inmediatamente.**

---

## 8. Convenciones de nomenclatura

```
Backend (NestJS):
  Clases           → PascalCase          CreateActionHandler
  Archivos         → kebab-case          create-action.handler.ts
  Variables/params → camelCase           actionEntity
  Constantes       → SCREAMING_SNAKE     ROLES.ADMIN
  Interfaces       → PascalCase (sin I)  ActionRepository
  Enums            → PascalCase          UserRole

Frontend (Next.js):
  Componentes      → PascalCase          ActionCard.tsx
  Hooks            → camelCase use-      useActions.ts
  Services         → camelCase           actions.service.ts
  Types            → PascalCase          ActionViewModel
  Constantes       → SCREAMING_SNAKE     API_ROUTES.ACTIONS.BASE
  Archivos feature → camelCase/PascalCase según tipo

Compartido:
  Eventos WS       → coincase: 'coins:updated'  (igual que backend)
  Campos BD        → respetar original (español) coinLogs, affectsClass
  Rutas API        → /api/acciones (no /api/actions)
```

---

## 9. Gestión de estado (frontend)

```
¿Lo necesitan múltiples componentes no relacionados a lo largo de la app?
  SÍ → Zustand store (store/auth.store.ts o store/ui.store.ts)
  NO ↓

¿Lo necesitan múltiples componentes de una feature?
  SÍ → Hook de feature (features/{name}/application/use{Name}.ts)
  NO ↓

¿Lo necesita un componente y sus hijos directos?
  SÍ → useState local en el componente
  NO ↓

¿Es estado derivado de otro estado?
  SÍ → useMemo / valor computado — NUNCA un useState separado
```

**Stores globales:**
- `store/auth.store.ts` → usuario, sesión
- `store/ui.store.ts` → toasts, sidebar

**Nunca:** un Zustand store por feature. **Nunca:** React Context para estado de feature.

**Estado derivado — nunca almacenar lo que se puede computar:**
```typescript
// ❌
const [filtered, setFiltered] = useState<ActionViewModel[]>([])

// ✅
const filtered = useMemo(() => items.filter(applyFilters), [items, filters])
```

---

## 10. Manejo de errores

### Backend
```typescript
// Errores de dominio → throw Error desde entidad → GlobalExceptionFilter → 400
throw new Error('Name must be at least 2 characters')

// No encontrado → NotFoundException de NestJS → 404
if (!entity) throw new NotFoundException(`Xxx ${id} not found`)

// NUNCA: try/catch en handlers para errores de dominio
// NUNCA: retornar null en vez de lanzar excepción
// NUNCA: { error: ... } — usar excepciones HTTP
```

### Frontend
```typescript
// En hooks — capturar, mostrar toast, nunca silenciar
const save = async () => {
  try {
    const { message } = await xxxService.create(dto)
    showToast(message)
    load()
  } catch (err: unknown) {
    showToast(err instanceof Error ? err.message : 'Error', false)
    // NUNCA: console.error(err) y seguir
    // NUNCA: swallow silencioso
    // NUNCA: estado de error que la UI no renderiza
  }
}
```

### Contrato de Toast
```typescript
showToast(message, success = true)
// true  → toast verde (éxito)
// false → toast rojo (error)

// Siempre mostrar feedback para acciones del usuario:
showToast('Acción creada')           // create ✓
showToast('Acción actualizada')      // update ✓
showToast('Acción eliminada')        // delete ✓
showToast(err.message, false)        // cualquier falla ✓

// NUNCA mensajes técnicos al usuario:
// ❌ 'SQLITE_CONSTRAINT: UNIQUE constraint failed'
// ✅ El backend devuelve mensajes legibles — confiar en ellos
```

---

## 11. Testing — obligatorio, no opcional

### Testing es parte de la implementación, no una tarea separada.
Cada feature, fix o módulo nuevo incluye sus tests antes de entregar.

### Backend — archivos requeridos por módulo

```
modules/{name}/domain/__tests__/{name}.entity.spec.ts
  → Probar CADA regla de validate() (una prueba por regla, caso pass y fail)

modules/{name}/application/__tests__/{name}.mapper.spec.ts
  → toResponse(): todos los campos mapeados, campos sensibles excluidos

modules/{name}/application/__tests__/{cmd}.handler.spec.ts
  → Método de repo correcto llamado, respuesta mapeada devuelta, errores propagados
```

**Runner:** `node_modules/.bin/vitest run --config api/vitest.config.ts`
**Mock pattern:** `const mockRepo = { create: vi.fn() }; new Handler(mockRepo as never)`

### Frontend — archivos requeridos por feature

```
features/{name}/infrastructure/__tests__/{name}.service.spec.ts
  → Mock lib/api.ts, verificar URL + method + body correcto

features/{name}/application/__tests__/use{Name}.spec.ts
  → Probar: load, create, update, delete, fallo de validación, toast de error

features/{name}/application/__tests__/{name}.mapper.spec.ts
  → Probar: toViewModel, toForm, toDto transformations
```

**Runner:** `cd web && ../node_modules/.bin/vitest run`

### Patrón de test de hook (frontend)
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useXxx } from '../application/useXxx'

vi.mock('../infrastructure/xxx.service', () => ({
  xxxService: { getAll: vi.fn(), create: vi.fn() },
}))
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

import { xxxService } from '../infrastructure/xxx.service'
const mockService   = vi.mocked(xxxService)
const mockShowToast = vi.fn()

const fakeItem = { id: 'x1', name: 'Test' /* todos los campos del tipo */ }

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getAll.mockResolvedValue([fakeItem])
})

describe('useXxx', () => {
  describe('load()', () => {
    it('carga items al montar', async () => {
      const { result } = renderHook(() => useXxx())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.items).toHaveLength(1)
    })
  })
})
```

### Contrato de testing
```
✓ Nueva regla validate() → test en entity.spec
✓ Nuevo campo en mapper → cubierto en mapper.spec
✓ Nuevo handler → cubierto en handler.spec
✓ Nueva función en hook → cubierto en hook.spec
✓ Nuevo método en service → cubierto en service.spec

✗ "Voy a agregar tests después" → no aceptado
✗ "Es un cambio simple" → no aceptado
✗ "La lógica es obvia" → no aceptado
```

### Cobertura mínima requerida
```
Handlers backend:  100% líneas
Entidades backend: 100% ramas (cada regla de negocio)
Hooks frontend:    80% líneas mínimo
Mappers frontend:  100% líneas
```

---

## 12. Seguridad

```typescript
// ✅ Todo controller con datos sensibles tiene JwtAuthGuard
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
@Controller('usuarios')

// ✅ ValidationPipe con whitelist:true ya configurado globalmente en main.ts
// Previene mass assignment — no tocar esta configuración

// ✅ Nunca exponer password hashes, tokens, o datos sensibles en responses
// Mapper controla qué campos se incluyen

// ✅ Rate limiting en endpoints de auth
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')

// ✅ CORS solo para el origen del frontend — ya en main.ts

// ❌ Nunca loguear passwords, tokens, o datos personales
// ❌ Nunca hardcodear secretos (JWT_SECRET, VAPID_PRIVATE) — solo en .env
// ❌ Nunca commitear archivos .env

// Variables de entorno requeridas (nunca en código):
// DATABASE_URL, JWT_SECRET, VAPID_PUBLIC, VAPID_PRIVATE, WEB_ORIGIN
```

---

## 13. Código limpio — tolerancia cero

```
Antes de declarar cualquier tarea terminada:
✓ Eliminar todos los console.log()
✓ Eliminar todos los bloques de código comentado
✓ Eliminar todos los imports no utilizados
✓ Eliminar todas las variables y parámetros no utilizados
✓ Eliminar todos los catch vacíos (catch (e) {})
✓ Eliminar todas las funciones definidas pero nunca llamadas
✓ Eliminar todos los tipos declarados pero nunca usados
✓ Eliminar todas las constantes definidas pero nunca referenciadas

ESLint capturará la mayoría — lint a cero warnings = cero código zombie.
```

**Comentarios — cuándo y cuándo no:**
```typescript
// ✅ Comentar el PORQUÉ, no el QUÉ
// Delay=null pausa el intervalo sin desmontar el componente
useInterval(callback, active ? POLL_MS : null)

// ✅ Reglas de negocio no obvias
// El tax se descuenta del sender, NO del receiver
// El backend hace la deducción — solo enviamos el gross amount
const payload = { toStudentId, amount: grossAmount }

// ❌ Comentario que repite el código
// Setear modal a true
setModal(true)

// ❌ Código comentado — borrarlo, git tiene historial
// ❌ TODO sin referencia a ticket/issue
```

---

## 14. Performance

### Frontend
```typescript
// ✅ Memoizar computaciones costosas
const filtered = useMemo(
  () => items.filter(applyFilters).sort(applySort),
  [items, filters, sortConfig]
)

// ✅ Callbacks estables (referenciados por componentes hijos)
const openEdit = useCallback((item: XxxViewModel) => {
  setForm(XxxMapper.toForm(item))
  setEditing(item)
  setModal(true)
}, []) // sin dependencias → identidad nunca cambia

// ✅ Debounce en inputs de búsqueda
const debouncedSearch = useDebounce(search, DEBOUNCE_MS)
useEffect(() => { load(debouncedSearch) }, [debouncedSearch])

// ❌ Objeto/array nuevo en cada render (rompe memoización)
<Header filters={{ active: true }} />

// ✅ Memoizar el objeto
const filterProps = useMemo(() => ({ active }), [active])
<Header filters={filterProps} />

// ✅ Key prop siempre estable y única
{items.map(item => <Card key={item.id} />)}   // ✓ ID de BD
{items.map((_, i) => <Card key={i} />)}       // ✗ index
```

### Backend
```typescript
// ✅ select solo campos necesarios — nunca findMany() sin select
const records = await this.prisma.action.findMany({
  select: { id: true, name: true, coins: true }
})

// ✅ Paginar datasets grandes
await this.prisma.student.findMany({ skip: (page-1)*size, take: size })

// ✅ Transacciones para operaciones multi-paso
await this.prisma.$transaction([
  this.prisma.student.update({ where: { id }, data: { coins } }),
  this.prisma.coinLog.create({ data: logEntry }),
])
```

---

## 15. Checklist de entrega — qué significa "terminado"

Una tarea está terminada cuando **todos** estos ítems son verdaderos:

```
□ La feature/fix funciona correctamente en el camino feliz
□ La feature/fix maneja casos de error (toast de feedback apropiado)
□ Tipos correctos — cero 'any', cero type assertions sin guard
□ Ningún archivo supera su límite de líneas
□ Sin duplicación introducida
□ pnpm typecheck exit 0 en proyecto(s) afectado(s)
□ pnpm build exit 0 en proyecto(s) afectado(s)
□ lint exit 0 (cero warnings) — web: npm run lint -w web
□ Tests exit 0 — api: node_modules/.bin/vitest run --config api/vitest.config.ts
□ Tests exit 0 — web: cd web && ../node_modules/.bin/vitest run
□ Toda lógica nueva tiene tests correspondientes
□ Sin console.log() en código commiteable
□ Sin bloques de código comentado
□ Sin imports o variables sin usar
□ Mensaje de commit sigue Conventional Commits
□ Nombre de rama sigue la convención

Solo cuando todos los □ son ✓ → la tarea está completa.
"Casi terminado" no es terminado.
"Funciona en mi máquina" no es terminado.
"Los tests se agregan después" no es terminado.
```

---

## 16. Git — workflow y commits

### Nombres de rama
```
feature/web-actions-hook-refactor
fix/api-delete-command-validation
refactor/web-inline-types-cleanup
test/api-bank-handler-coverage
chore/config-routes-centralization

Formato: {type}/{scope}-{descripción-corta}
Scope: 'web' frontend, 'api' backend, 'shared' tipos
```

### Jerarquía de ramas
```
main     → Producción. Protegida. Solo PR + CI verde.
develop  → Integración. Protegida. Solo PR desde feature branches.
feature/ → Trabajo. Desde develop. Se mergea a develop via PR.
```

### Formato de commit (Conventional Commits)
```
type(scope): descripción en presente

Tipos: feat fix refactor test chore docs
Reglas:
  - Presente: "add" no "added"
  - Sin punto al final de la línea de asunto
  - Máximo 72 caracteres en asunto
  - Un cambio lógico por commit
```

### Antes de cada commit
```bash
# Backend
cd api && pnpm typecheck && pnpm test && pnpm build

# Frontend
cd web && pnpm typecheck && npm run lint -w web && pnpm build
cd web && ../node_modules/.bin/vitest run

# Si alguno falla → corregir. Sin excepciones.
```

---

## 17. Base de datos — disciplina de migración

**Lo que nunca se cambia sin instrucción explícita:**
- `schema.prisma` → afecta datos de producción
- `@control-aula/shared` → cambios de tipo afectan api y web simultáneamente
- Rutas API → cambiar controller path requiere actualizar `web/src/config/routes.ts`

**Renombrar un campo compartido requiere actualizar en orden:**
1. `shared/src/types/`
2. `api/src/modules` (DTOs y mappers)
3. `web/src` (services, mappers, hooks, components)

**Migraciones:**
```bash
cd api && npx prisma migrate dev --name nombre-descriptivo
# Revisar el SQL generado antes de commitear
# Las migraciones se aplican automáticamente via docker-entrypoint.sh
```

---

## 18. Violaciones conocidas a corregir (deuda técnica documentada)

Las siguientes violaciones existen en el código actual y deben corregirse
en orden de prioridad cuando se trabaje en esos módulos:

### ALTA PRIORIDAD
| Archivo | Violación | Acción |
|---------|-----------|--------|
| `api/src/modules/backup/presentation/backup.controller.ts` | 256 líneas (límite: 80) | Refactorizar en command handlers separados |
| `api/src/modules/bank/application/bank.mapper.ts` | `any` en parámetro | Tipar con entidad Prisma explícita |
| `api/src/modules/bank/infrastructure/bank.repository.impl.ts` | `any[]` en retorno | Tipar con tipos Prisma |

### MEDIA PRIORIDAD
| Archivo | Violación | Acción |
|---------|-----------|--------|
| `api/.../bank/application/commands/process-transaction.handler.ts` | 89 líneas (límite: 50) | Extraer lógica a servicio de dominio |
| `api/.../bank/application/commands/create-transaction.handler.ts` | 75 líneas (límite: 50) | Ídem |
| `api/.../reward/application/commands/process-redemption.handler.ts` | 71 líneas (límite: 50) | Ídem |
| `web/src/features/estudiantes/application/useEstudiantes.ts` | 144 líneas (límite: 150) | Monitorear — cerca del límite |
| `web/src/features/aula/application/useAula.ts` | 132 líneas | Ídem |
| `web/src/features/recompensas/application/useRecompensas.ts` | 123 líneas | Ídem |
| `web/src/features/usuarios/ui/UsuariosSection.tsx` | 98 líneas (límite: 80) | Extraer sub-sección |
| `web/src/features/estudiantes/ui/EstudiantesSection.tsx` | 85 líneas (límite: 80) | Ídem |
| `web/src/features/portal/ui/components/DiscountCarousel.tsx` | 133 líneas (límite: 100) | Extraer sub-componentes |

### COBERTURA DE TESTS PENDIENTE (API)
Módulos sin handler tests: `bank`, `course`, `inbox`, `point`, `portal`, `push`

---

## 19. Qué hacer cuando hay bloqueos o incertidumbre

### Tarea ambigua
```
Preguntar antes de implementar. Declarar lo ambiguo:
"Entiendo esto como [interpretación]. ¿Es correcto antes de proceder?"
Nunca adivinar en requisitos ambiguos y entregar trabajo incorrecto.
```

### Regla que conflictúa con otra
```
La regla más específica gana sobre la general.
Si sigue sin estar claro → preguntar. No decidir en silencio.
```

### No se puede implementar correctamente con la estructura actual
```
Declarar el problema:
"No puedo implementar esto correctamente sin [cambio arquitectónico].
Opciones:
  1. [Opción A] — pros y contras
  2. [Opción B] — pros y contras
¿Cuál prefieres?"
Nunca implementar un hack en silencio.
```

### Descubrir violaciones existentes al implementar
```
1. Corregir la violación como parte de la tarea (si es menor, mismo archivo)
2. O documentar: "Encontré violación [X] en [archivo] — registrada en Sección 18"
3. Nunca dejar una violación sin documentar
4. Nunca introducir nueva violación porque existe una antigua
```

---

## 20. Los diez mandamientos del código base

```
I.   No commitearás código que falle typecheck o build.
II.  No duplicarás lógica que ya existe.
III. No usarás 'any' como tipo.
IV.  No mezclarás responsabilidades en un archivo.
V.   No llamarás services desde componentes UI — solo desde hooks.
VI.  No hardcodearás strings que pertenecen a config/.
VII. No harás push directo a develop o main.
VIII.No entregarás sin ejecutar el checklist completo de verificación.
IX.  No dejarás console.log() ni código comentado en commits.
X.   No adivinarás cuando estés inseguro — preguntarás antes de implementar.
```
