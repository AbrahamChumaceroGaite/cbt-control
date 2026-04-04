# API REST

Base URL: `http://localhost:4001/api` (dev) / `/api` (producción vía proxy)

Todas las respuestas siguen el formato estándar:
```json
{ "code": 200, "status": "success", "data": { ... }, "message": "OK" }
```

La autenticación usa la cookie HttpOnly `cbt_session` (JWT). Las rutas marcadas con 🔒 requieren sesión activa.

---

## Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Inicia sesión. Body: `{ code, password }`. Setea cookie `cbt_session`. |
| `POST` | `/api/auth/logout` | 🔒 Cierra sesión. Limpia la cookie. |
| `GET` | `/api/auth/me` | 🔒 Retorna el usuario autenticado (`SessionPayload`). |

---

## Usuarios (solo admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/usuarios` | 🔒 Lista todos los usuarios del sistema. |
| `POST` | `/api/usuarios` | 🔒 Crea un usuario. Body: `UserCreateInput`. |
| `DELETE` | `/api/usuarios/:id` | 🔒 Elimina un usuario. |

---

## Cursos (solo admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/cursos` | 🔒 Lista todos los cursos con `classCoins`. |
| `POST` | `/api/cursos` | 🔒 Crea un curso. Body: `CourseInput`. |
| `PUT` | `/api/cursos/:id` | 🔒 Actualiza un curso (nombre, nivel, paralelo, `classCoins`). |
| `DELETE` | `/api/cursos/:id` | 🔒 Elimina un curso y sus datos en cascada. |

---

## Alumnos (solo admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/estudiantes` | 🔒 Lista alumnos. Query params: `courseId`, `search`, `minCoins`, `maxCoins`. |
| `GET` | `/api/estudiantes/:id` | 🔒 Detalle de un alumno con historial de coins. |
| `POST` | `/api/estudiantes` | 🔒 Crea un alumno. Body: `StudentInput`. |
| `PUT` | `/api/estudiantes/:id` | 🔒 Actualiza un alumno. Si `coins` cambia, emite `coins:updated` por WebSocket. |
| `DELETE` | `/api/estudiantes/:id` | 🔒 Elimina un alumno. |
| `POST` | `/api/estudiantes/import` | 🔒 Importación masiva desde Excel. Body: `multipart/form-data` con campo `file`. |

---

## Acciones (solo admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/acciones` | 🔒 Lista el catálogo de acciones activas. |
| `POST` | `/api/acciones` | 🔒 Crea una acción. Body: `ActionInput`. |
| `PUT` | `/api/acciones/:id` | 🔒 Actualiza una acción. |
| `DELETE` | `/api/acciones/:id` | 🔒 Elimina una acción. |

---

## Recompensas (solo admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/recompensas` | 🔒 Lista recompensas. Query param: `type` (`class`/`individual`). |
| `POST` | `/api/recompensas` | 🔒 Crea una recompensa. Body: `RewardInput`. |
| `PUT` | `/api/recompensas/:id` | 🔒 Actualiza una recompensa. |
| `DELETE` | `/api/recompensas/:id` | 🔒 Elimina una recompensa. |

---

## Solicitudes de canje (solo admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/solicitudes` | 🔒 Lista solicitudes. Query param: `status` (`pending`/`approved`/`rejected`). |
| `PATCH` | `/api/solicitudes/:id` | 🔒 Aprueba o rechaza. Body: `{ status: "approved" \| "rejected" }`. Emite `solicitud:updated` y `coins:updated` por WebSocket. |
| `DELETE` | `/api/solicitudes/:id` | 🔒 Elimina una solicitud. |

---

## Grupos (solo admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/grupos` | 🔒 Lista grupos. Query param: `courseId`. |
| `POST` | `/api/grupos` | 🔒 Crea un grupo. Body: `GroupInput` con `memberIds[]`. |
| `PUT` | `/api/grupos/:id` | 🔒 Actualiza un grupo y sus miembros. |
| `DELETE` | `/api/grupos/:id` | 🔒 Elimina un grupo. |

---

## Coins (solo admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/puntos` | 🔒 Otorga coins. Transacción atómica. Emite `coins:updated` por WebSocket. Body: `AwardCoinInput`. |

### AwardCoinInput

```typescript
{
  courseId:    string        // curso destino
  actionId:    string        // acción del catálogo
  studentIds?: string[]      // si vacío o ausente → solo afecta la clase
}
```

---

## Portal del estudiante (rol student)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/portal/me` | 🔒 Perfil del alumno: coins, tramos, historial, solicitudes. Retorna `PortalStudentResponse`. |
| `GET` | `/api/portal/recompensas` | 🔒 Catálogo de recompensas individuales canjeables. |
| `POST` | `/api/portal/solicitudes` | 🔒 Crea una solicitud de canje. Body: `{ rewardId }`. Emite `solicitud:new` a admins. |

---

## Notificaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/notifications` | 🔒 Lista notificaciones del usuario autenticado. |
| `PATCH` | `/api/notifications/:id/read` | 🔒 Marca una notificación como leída. |
| `PATCH` | `/api/notifications/read-all` | 🔒 Marca todas como leídas. |
| `DELETE` | `/api/notifications/:id` | 🔒 Elimina una notificación. |
| `DELETE` | `/api/notifications` | 🔒 Elimina todas las notificaciones del usuario. |

---

## Push Notifications

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/push/subscribe` | 🔒 Registra una suscripción Web Push del dispositivo. |
| `DELETE` | `/api/push/unsubscribe` | 🔒 Elimina la suscripción del dispositivo actual. |
| `POST` | `/api/push/send` | 🔒 (admin) Envía notificación push a un usuario. Body: `{ userId, title, body }`. |

---

## Backup

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/backup` | 🔒 (admin) Descarga un JSON completo con todos los datos de la BD. |

---

## Health check

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Sin auth. Retorna `{ status: "ok" }`. Usado por Docker healthcheck. |

---

## WebSocket

| Protocolo | Ruta | Descripción |
|-----------|------|-------------|
| `ws`/`wss` | `/ws` | Conexión en tiempo real. Autenticación por cookie `cbt_session` en el handshake. Ver [websocket.md](websocket.md). |
