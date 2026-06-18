#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="ec2-user"
REMOTE_HOST="13.125.181.228"
PASSWORD="${EC2_PASSWORD:-}"

if [[ -z "$PASSWORD" ]]; then
  echo "EC2_PASSWORD is required"
  exit 1
fi

/usr/bin/expect <<EOF
set timeout 300
set pw "$PASSWORD"
spawn ssh -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no ${REMOTE_USER}@${REMOTE_HOST} "bash -lc 'cd /home/ec2-user/devfocus && docker-compose up -d --build backend && sleep 10 && docker-compose ps && echo ---HEALTH--- && curl -fsS http://localhost:3001/health'"
expect {
  -re "assword:" {
    send "\$pw\r"
    exp_continue
  }
  eof
}
EOF
