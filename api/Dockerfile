FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat openssl su-exec

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY package.json          ./
COPY shared/package.json   ./shared/
COPY api/package.json      ./api/
COPY web/package.json      ./web/
RUN npm install
COPY shared ./shared
COPY api    ./api
RUN npm run build -w shared
ENV DATABASE_URL="file:./prisma/dev.db"
RUN npm run build -w api

# ── Runner ─────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nestjs
COPY package.json          ./
COPY shared/package.json   ./shared/
COPY api/package.json      ./api/
COPY web/package.json      ./web/
RUN npm install --workspace=shared --workspace=api --include-workspace-root --omit=dev
COPY --from=builder --chown=nestjs:nodejs /app/api/dist     ./dist
COPY --from=builder --chown=nestjs:nodejs /app/shared       ./shared
COPY --from=builder --chown=nestjs:nodejs /app/api/prisma   ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/api/src/data ./src/data
COPY api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
EXPOSE 4001
ENV PORT=4001
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["./docker-entrypoint.sh"]
