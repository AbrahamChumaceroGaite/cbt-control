FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat openssl su-exec

# ── Build ─────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY package*.json         ./
COPY shared/package*.json  ./shared/
COPY api/package*.json     ./api/
COPY web/package*.json     ./web/
RUN --mount=type=cache,target=/root/.npm \
    npm install
COPY shared ./shared
COPY api    ./api
RUN /app/node_modules/.bin/tsc --project /app/shared/tsconfig.json
ENV DATABASE_URL="file:./prisma/dev.db"
RUN /app/node_modules/.bin/prisma generate --schema=/app/api/prisma/schema.prisma
RUN /app/node_modules/.bin/tsc --project /app/api/tsconfig.build.json
RUN test -f /app/api/dist/main.js

# ── Runner ────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nestjs
COPY --from=builder /app/node_modules    ./node_modules
COPY --from=builder /app/api/dist        ./dist
COPY --from=builder /app/shared          ./shared
COPY --from=builder /app/api/prisma      ./prisma
COPY --from=builder /app/api/src/data    ./src/data
RUN npx --yes prisma generate --schema=/app/prisma/schema.prisma
COPY api/docker-entrypoint.sh            ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && \
    chown -R nestjs:nodejs /app/dist /app/shared /app/prisma /app/src
EXPOSE 4001
ENV PORT=4001
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["./docker-entrypoint.sh"]
