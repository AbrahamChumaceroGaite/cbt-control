FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl su-exec

# ── Build ─────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY package*.json              ./
COPY shared/package*.json       ./shared/
COPY api-games/package*.json    ./api-games/
RUN --mount=type=cache,target=/root/.npm,id=npm-api-games-v1 \
    npm install
COPY shared    ./shared
COPY api-games ./api-games
RUN /app/node_modules/.bin/tsc --project /app/shared/tsconfig.json
ENV DATABASE_URL="file:./prisma/academic.db"
RUN --mount=type=cache,target=/root/.cache/prisma,id=prisma-engines-v1 \
    /app/node_modules/.bin/prisma generate --schema=/app/api-games/prisma/schema.prisma
RUN /app/node_modules/.bin/tsc --project /app/api-games/tsconfig.json
RUN test -f /app/api-games/dist/main.js

# ── Runner ────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nestjs
COPY --from=builder /app/node_modules        ./node_modules
COPY --from=builder /app/api-games/dist      ./dist
COPY --from=builder /app/shared              ./shared
COPY --from=builder /app/api-games/prisma    ./prisma
RUN --mount=type=cache,target=/root/.cache/prisma,id=prisma-engines-v1 \
    npx --yes prisma generate --schema=/app/prisma/schema.prisma
COPY api-games/docker-entrypoint.sh          ./docker-entrypoint.sh
RUN sed -i 's/\r//' ./docker-entrypoint.sh && \
    chmod +x ./docker-entrypoint.sh && \
    chown -R nestjs:nodejs /app/dist /app/shared /app/prisma
EXPOSE 4003
ENV PORT=4003
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["./docker-entrypoint.sh"]
