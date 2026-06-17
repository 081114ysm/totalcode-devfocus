#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/ec2-user/devfocus"
cd "$REPO_DIR"
DB_ROOT_PASSWORD="replace-with-a-different-long-random-password"

if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  COMPOSE="docker compose"
fi

$COMPOSE down -v
$COMPOSE --env-file .env.production -f docker-compose.production.yml up -d db
until $COMPOSE exec -T db mysqladmin ping -h localhost -uroot -p"$DB_ROOT_PASSWORD" --silent >/dev/null 2>&1; do
  sleep 5
done
$COMPOSE --env-file .env.production -f docker-compose.production.yml up -d --build backend
sleep 10
$COMPOSE exec -T backend node scripts/createDemoAccounts.js || true
curl -fsS http://localhost:3001/health
