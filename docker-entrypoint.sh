#!/bin/sh
set -e

echo "[entrypoint] Running prisma db push..."
npx prisma db push --skip-generate

echo "[entrypoint] Seeding database..."
npx tsx prisma/seed.ts || echo "[entrypoint] Seed skipped (may already exist)"

echo "[entrypoint] Starting app..."
exec node server.js
