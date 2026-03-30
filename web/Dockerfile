FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY package.json          ./
COPY shared/package.json   ./shared/
COPY api/package.json      ./api/
COPY web/package.json      ./web/
RUN npm install
COPY shared ./shared
COPY web    ./web
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w shared
RUN npm run build -w web

# ── Runner ─────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs
COPY package.json          ./
COPY shared/package.json   ./shared/
COPY api/package.json      ./api/
COPY web/package.json      ./web/
RUN npm install --workspace=shared --workspace=web --include-workspace-root --omit=dev
COPY --from=builder --chown=nextjs:nodejs /app/web/.next  ./web/.next
COPY --from=builder --chown=nextjs:nodejs /app/shared     ./shared
COPY --chown=nextjs:nodejs web/public         ./web/public
COPY --chown=nextjs:nodejs web/next.config.js ./web/next.config.js
USER nextjs
WORKDIR /app/web
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
CMD ["/app/node_modules/.bin/next", "start", "-p", "3001"]
