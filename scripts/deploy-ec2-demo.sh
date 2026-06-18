#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="ec2-user"
REMOTE_HOST="13.125.181.228"
REMOTE_DIR="/opt/devfocus"
PASSWORD="${EC2_PASSWORD:-}"

if [[ -z "$PASSWORD" ]]; then
  echo "EC2_PASSWORD is required"
  exit 1
fi

EXPECT_SCRIPT=$(cat <<'EOF'
set timeout 120
set pw $env(PASSWORD)
spawn ssh -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no $env(REMOTE_USER)@$env(REMOTE_HOST) "bash -lc '$env(REMOTE_COMMAND)'"
expect {
  -re "assword:" {
    send "$pw\r"
    exp_continue
  }
  eof
}
EOF
)

REMOTE_COMMAND=$(cat <<'EOF'
set -e
REPO_GIT=$(find /home /var /srv /opt -maxdepth 4 -name .git -type d 2>/dev/null | head -n 1)
if [ -z "$REPO_GIT" ]; then
  echo "repository not found"
  exit 1
fi
REPO_DIR=$(dirname "$REPO_GIT")
cd "$REPO_DIR"
git pull --ff-only origin main
git status --short
if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  COMPOSE="docker compose"
fi
$COMPOSE --env-file .env.production -f docker-compose.production.yml up -d --build
curl -fsS http://localhost:3001/health
EOF
)

export PASSWORD
export REMOTE_USER
export REMOTE_HOST
export REMOTE_COMMAND

/usr/bin/expect -c "$EXPECT_SCRIPT"
