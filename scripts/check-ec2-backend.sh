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
set timeout 180
set pw "$PASSWORD"
spawn ssh -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no ${REMOTE_USER}@${REMOTE_HOST} "bash -lc 'cd /home/ec2-user/devfocus && echo ---SEED--- && sed -n \"1,40p\" 전체코드/backend/config/seed.sql && echo ---DBCHECK--- && docker-compose ps && docker-compose exec -T db mysql -udevfocus -preplace-with-a-long-random-password -D devfocus -e \"SELECT 1, HEX(title) AS hex_title FROM courses LIMIT 1\" && echo ---LOGS--- && docker-compose logs --tail 120 backend | tail -n 80'"
expect {
  -re "assword:" {
    send "\$pw\r"
    exp_continue
  }
  eof
}
EOF
