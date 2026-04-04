FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat

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
COPY web    ./web
RUN mkdir -p /app/web/public
ARG API_URL=http://api:4001
ENV API_URL=$API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w shared && npm run build -w web

# ── Runner ────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ARG API_URL=http://api:4001
ENV API_URL=$API_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs
COPY --from=builder /app/node_modules        ./node_modules
COPY --from=builder /app/web/.next           ./web/.next
COPY --from=builder /app/shared              ./shared
COPY --from=builder /app/web/public          ./web/public
COPY --from=builder /app/web/next.config.js  ./web/next.config.js
COPY --from=builder /app/web/package.json    ./web/package.json
RUN chown -R nextjs:nodejs /app/web
USER nextjs
WORKDIR /app/web
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
CMD ["/app/node_modules/.bin/next", "start", "-p", "3001"]
