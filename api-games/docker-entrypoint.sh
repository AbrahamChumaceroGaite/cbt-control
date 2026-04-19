#!/bin/sh
set -e

# Create data dir for SQLite volume
mkdir -p /app/data
chown -R nestjs:nodejs /app/data

echo "[api-games] Running prisma db push..."
su-exec nestjs npx prisma db push --skip-generate

echo "[api-games] Seeding database..."
su-exec nestjs npx tsx prisma/seed.ts

echo "[api-games] Starting NestJS..."
exec su-exec nestjs node dist/main
