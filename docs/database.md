# Base de datos

## Motor

| Entorno | Motor | URL |
|---------|-------|-----|
| Desarrollo local | SQLite | `file:./prisma/dev.db` |
| Docker / producción | SQLite en volumen | `file:/app/data/prod.db` |
| Producción escalada | PostgreSQL | `postgresql://user:pass@host:5432/db` |

Cambiar el motor solo requiere actualizar `DATABASE_URL` y el `provider` en `schema.prisma`.

---

## Diagrama ER

```mermaid
erDiagram
    Course {
        string id PK
        string name
        string level
        string parallel
        int classCoins
        datetime createdAt
        datetime updatedAt
    }
    Student {
        string id PK
        string courseId FK
        string code
        string name
        string email
        int coins
        datetime createdAt
        datetime updatedAt
    }
    StudentTramo {
        string id PK
        string studentId FK
        string tramo
        datetime awardedAt
    }
    Action {
        string id PK
        string name
        int coins
        string category
        bool affectsClass
        bool affectsStudent
        bool isActive
    }
    CoinLog {
        string id PK
        string courseId FK
        string studentId FK
        string actionId FK
        int coins
        string reason
        datetime createdAt
    }
    Reward {
        string id PK
        string name
        string description
        string icon
        int coinsRequired
        string type
        bool isGlobal
        bool isActive
    }
    Redemption {
        string id PK
        string courseId FK
        string rewardId FK
        string notes
        datetime redeemedAt
    }
    StudentRedemption {
        string id PK
        string studentId FK
        string rewardId FK
        datetime redeemedAt
    }
    RedemptionRequest {
        string id PK
        string studentId FK
        string rewardId FK
        string status
        string notes
        datetime createdAt
        datetime updatedAt
    }
    Group {
        string id PK
        string courseId FK
        string name
        datetime createdAt
    }
    GroupMember {
        string id PK
        string groupId FK
        string studentId FK
        datetime joinedAt
    }
    User {
        string id PK
        string code UK
        string passwordHash
        string role
        string studentId FK
        string fullName
        bool isActive
    }
    PushSubscription {
        string id PK
        string userId FK
        string endpoint UK
        string p256dh
        string auth
        datetime createdAt
    }
    Notification {
        string id PK
        string userId FK
        string title
        string body
        string url
        string tag
        bool isRead
        datetime createdAt
    }

    Course ||--o{ Student : "tiene"
    Course ||--o{ Group : "contiene"
    Course ||--o{ CoinLog : "acumula"
    Course ||--o{ Redemption : "canjea clase"

    Student ||--o{ CoinLog : "genera"
    Student ||--o{ StudentTramo : "desbloquea"
    Student ||--o{ StudentRedemption : "canjea individual"
    Student ||--o{ RedemptionRequest : "solicita"
    Student ||--o{ GroupMember : "integra"
    Student ||--o| User : "vinculado a"

    Action ||--o{ CoinLog : "origina"

    Reward ||--o{ Redemption : "referenciada en"
    Reward ||--o{ StudentRedemption : "referenciada en"
    Reward ||--o{ RedemptionRequest : "referenciada en"

    Group ||--o{ GroupMember : "tiene"

    User ||--o{ PushSubscription : "registra"
    User ||--o{ Notification : "recibe"
```

---

## Entidades

### Course
Clase académica. Mantiene `classCoins` que se incrementa cada vez que se otorgan coins que `affectsClass = true`.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string | Ej: "S2A" |
| `level` | string | "Secondary 1" / "Secondary 2" |
| `parallel` | string | "A" / "B" / "C" |
| `classCoins` | int | Monedas grupales acumuladas |

### Student
Alumno con monedas individuales. Puede estar vinculado a un `User` para el acceso al portal.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `code` | string | Código del alumno (ej: "s2a01") |
| `coins` | int | Monedas individuales actuales |
| `userId` | string? | Vínculo a cuenta de acceso |

### Action
Comportamiento valorado del catálogo. Define si afecta la clase, al alumno, o ambos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `coins` | int | Monedas que otorga |
| `category` | string | Color: `green`, `blue`, `red`, `amber`, `purple`, `mag` |
| `affectsClass` | bool | Si suma a `classCoins` del curso |
| `affectsStudent` | bool | Si suma a `coins` del alumno |

### CoinLog
Historial **inmutable** de todas las transacciones de coins. Nunca se modifica ni elimina.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `coins` | int | Cantidad otorgada (siempre positiva) |
| `reason` | string | Texto descriptivo de la acción |
| `studentId` | string? | Null si fue solo para la clase |
| `actionId` | string? | Null si fue un ajuste manual |

### Reward
Recompensa canjeable. `type` determina si es para toda la clase o individual.

| Campo | Tipo | Valores |
|-------|------|---------|
| `type` | string | `"class"` (se canjea a nivel de curso) / `"individual"` (la solicita el alumno) |
| `coinsRequired` | int | Costo en monedas |
| `isGlobal` | bool | Si aparece en todos los cursos |

### RedemptionRequest
Solicitud de canje iniciada por un alumno desde el portal. El docente la aprueba o rechaza.

| Estado | Descripción |
|--------|-------------|
| `pending` | Esperando respuesta del docente |
| `approved` | Aprobada — se descuentan los coins al alumno |
| `rejected` | Rechazada — sin efecto sobre los coins |

### StudentTramo
Registro de los tramos (T1–T7) desbloqueados por el alumno. Constraint `unique(studentId, tramo)` — no se puede desbloquear el mismo tramo dos veces.

### User
Cuenta de acceso al sistema. Los admins tienen `studentId = null`. Los estudiantes tienen `studentId` vinculado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `code` | string | Nombre de usuario único (ej: "admin", "s2a01") |
| `role` | string | `"admin"` / `"student"` |
| `passwordHash` | string | Hash bcrypt |

---

## Flujo de coins

```mermaid
flowchart TD
    POST[POST /api/puntos] --> TX{prisma.$transaction}
    TX --> CK{affectsClass?}
    TX --> SK{affectsStudent?}
    CK -- Sí --> CC[UPDATE Course.classCoins += n]
    SK -- Sí --> SC[UPDATE Student.coins += n]
    TX --> LOG[INSERT CoinLog]
    TX --> WS[SocketService.coinsUpdated]
    WS --> FA[frame → todos los admins]
    WS --> FS[frame → alumno afectado]
    CC & SC & LOG --> COMMIT[COMMIT]
    COMMIT --> WS
```

Si cualquier paso de la transacción falla, ningún cambio se aplica.

## Estados de solicitud de canje

```mermaid
stateDiagram-v2
    [*] --> pending : Alumno solicita\nPOST /api/portal/solicitudes
    pending --> approved : Docente aprueba\nPATCH /api/solicitudes/:id
    pending --> rejected : Docente rechaza\nPATCH /api/solicitudes/:id
    approved --> [*] : coins descontados\nWebSocket solicitud:updated
    rejected --> [*] : sin efecto\nWebSocket solicitud:updated
```

---

## Gestión del schema

```bash
# Aplicar cambios del schema.prisma a la BD de desarrollo
cd api && npx prisma db push

# Repoblar con datos maestros (courses, students, actions, rewards, tramos)
npm run db:seed

# Explorar la BD con GUI
npm run db:studio   # → http://localhost:5555
```

Los datos iniciales viven en `api/src/data/`:

| Archivo | Contenido |
|---------|-----------|
| `courses.ts` | Cursos S2A, S2B, S2C con nivel y paralelo |
| `students.ts` | Nóminas por curso (`STUDENTS_BY_COURSE`) |
| `actions.ts` | Catálogo de acciones con categoría, coins y flags |
| `rewards.ts` | Recompensas de clase (`CLASS_REWARDS`) e individuales (`INDIVIDUAL_REWARDS`) |
| `tramos.ts` | Definición de T1–T7 y colores por categoría (`ACTION_COLORS`) |

Para cambiar datos maestros: editar el archivo correspondiente en `src/data/` y correr `npm run db:seed`.
