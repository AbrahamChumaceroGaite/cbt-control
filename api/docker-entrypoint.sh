#!/bin/sh
set -e

# Fix permissions on the volume-mounted prisma directory (runs as root)
chown -R nestjs:nodejs /app/prisma

echo "[api] Running prisma db push..."
su-exec nestjs npx prisma db push --skip-generate

echo "[api] Seeding database..."
su-exec nestjs npx tsx prisma/seed.ts || echo "[api] Seed skipped (already seeded or error ignored)"

echo "[api] Starting NestJS..."
exec su-exec nestjs node dist/main
