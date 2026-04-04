# CBT Control Aula

Sistema de gamificación para el aula. Docentes gestionan cursos, alumnos y otorgan coins; estudiantes acceden a su portal para ver su progreso y canjear recompensas.

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [Arquitectura](docs/architecture.md) | Clean Arch, CQRS, capas, paquete shared |
| [WebSocket](docs/websocket.md) | Tiempo real: gateway, service, cliente, flujo |
| [Base de datos](docs/database.md) | Modelo ER, entidades, flujo de coins |
| [Docker](docs/docker.md) | Contenedores, deploy, variables de entorno |
| [API REST](docs/api.md) | Todos los endpoints con descripción |
| [Frontend](docs/frontend.md) | Capas, páginas, componentes, rutas |

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Primera vez — aplicar schema y poblar BD
cd api && npx prisma db push && npm run db:seed && cd ..

# Desarrollo (en terminales separadas)
npm run dev:api    # NestJS  → http://localhost:4001
npm run dev:web    # Next.js → http://localhost:3001
```

## Variables de entorno

Copiar `api/.env.example` → `api/.env` y completar:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="cambiar-en-produccion"
PORT=4001
WEB_ORIGIN=http://localhost:3001
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:admin@example.com"
```

## Comandos de BD (desde `api/`)

```bash
npx prisma db push    # Aplicar cambios del schema
npm run db:seed       # Repoblar desde src/data/
npm run db:studio     # Prisma Studio en :5555
```

## Docker

```bash
docker compose up --build          # Levantar todo
docker compose up -d --build       # Background
docker compose logs -f api web     # Ver logs
```

---

Ing. Abraham CG — 2026
