# CBT Control Aula

Aplicación web full-stack para la gestión, gamificación y seguimiento académico de clases. Implementa una arquitectura modular con separación de responsabilidades entre el frontend y el backend, utilizando Next.js App Router y Prisma ORM.

## Arquitectura

El proyecto emplea una arquitectura por capas para garantizar la escalabilidad y mantenibilidad:

- **Frontend (UI Layer)**: Componentes construidos con React (Next.js), Tailwind CSS y ShadCN adaptado al estándar de diseño `abe-s-ui`. Interfaz dinámica orientada al seguimiento en tiempo real de alumnos y puntajes.
- **API Routes (Rutas Controladoras)**: Funciones serverless en `/app/api/` que interceptan peticiones HTTP, validan carga útil y delegan la lógica de negocio a los servicios.
- **Services (Lógica de Negocio)**: Módulos tipados en `src/server/services/` (EntityServices) que contienen las reglas estructurales de procesamiento de datos.
- **Data Access (Capa de Datos)**: Integración con PostgreSQL empleando Prisma ORM.

## Modelos de Datos

El diseño de base de datos (`schema.prisma`) integra los siguientes modelos principales:

- `Course`: Representa una clase académica, incluyendo metadata de grado y paralelo.
- `Student`: Usuarios del sistema con métricas transaccionales (puntos y premios).
- `Action`: Comportamientos o tareas tipificadas con un peso en puntaje.
- `Reward`: Elementos desbloqueables tanto a nivel global como individual.
- `Log`: Histórico inmutable de acciones transaccionadas en el aula.
- `Group` y `GroupMember`: Asociación relacional para trabajo en equipo.

Todos los modelos poseen timestamps estandarizados (`createdAt`, `updatedAt`).

## Secuencias de Desarrollo (Seeding)

Para los entornos de desarrollo, el proyecto dispone de rutinas estructuradas de inserción de datos ubicadas en `/prisma/seed.ts`. Las funciones pobladoras utilizan `tsx` para garantizar un entorno inicial trazado con alumnos simulados, componentes lógicos de recompensa y acciones catalogadas.

Ejecución de seeders y reseteo de base de datos:
\`\`\`bash
npx prisma db push --force-reset
npm run db:seed
\`\`\`

## Configuración y Despliegue

### Requisitos Técnicos
- Node.js >= 18.17
- PostgreSQL >= 14

### Variables de Entorno (`.env`)
\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/cbt_control_aula?schema=public"
\`\`\`

### Scripts Principales
- \`npm install\` — Instalación de dependencias.
- \`npm run dev\` — Inicializa el servidor local de desarrollo en el puerto 3001.
- \`npm run build\` — Genera la construcción estática y optimizada para producción.
- \`npm start\` — Ejecuta la instancia productiva previamente compilada.

### Despliegue en Docker
El repositorio incluye archivos estandarizados `Dockerfile` orientados a producción (construcción multi-stage), optimizando la imagen resultante minimizando dependencias no necesarias. Consulte los manifiestos adjuntos en el repositorio para su integración con plataformas de orquestación (ej. Kubernetes) o `docker-compose`.