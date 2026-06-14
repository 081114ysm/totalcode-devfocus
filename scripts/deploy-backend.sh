#!/usr/bin/env sh
set -eu

PROJECT_DIR=${PROJECT_DIR:-/opt/devfocus}
COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.production.yml}

cd "$PROJECT_DIR"
git pull --ff-only origin main
docker compose --env-file .env.production -f "$COMPOSE_FILE" build --pull backend
docker compose --env-file .env.production -f "$COMPOSE_FILE" up -d
docker compose --env-file .env.production -f "$COMPOSE_FILE" ps
docker compose --env-file .env.production -f "$COMPOSE_FILE" exec -T backend wget -qO- http://localhost:3001/health
