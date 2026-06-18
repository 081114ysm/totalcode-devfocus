#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="ec2-user"
REMOTE_HOST="13.125.181.228"
REMOTE_DIR="/home/ec2-user/devfocus"
REMOTE_TAR="/home/ec2-user/devfocus-src.tar.gz"
PASSWORD="${EC2_PASSWORD:-}"
SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TAR_FILE="/tmp/devfocus-src.tar.gz"

if [[ -z "$PASSWORD" ]]; then
  echo "EC2_PASSWORD is required"
  exit 1
fi

echo "Creating source archive..."
tar -czf "$TAR_FILE" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='제출물' \
  --exclude='*.bundle' \
  -C "$SOURCE_DIR" .

run_ssh() {
  local remote_command="$1"
  /usr/bin/expect <<EOF
set timeout 180
set pw "$PASSWORD"
spawn ssh -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no ${REMOTE_USER}@${REMOTE_HOST} "bash -lc '$remote_command'"
expect {
  -re "assword:" {
    send "\$pw\r"
    exp_continue
  }
  eof
}
EOF
}

run_scp() {
  /usr/bin/expect <<EOF
set timeout 180
set pw "$PASSWORD"
spawn scp -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no "$TAR_FILE" ${REMOTE_USER}@${REMOTE_HOST}:$REMOTE_TAR
expect {
  -re "assword:" {
    send "\$pw\r"
    exp_continue
  }
  eof
}
EOF
}

echo "Uploading archive..."
run_scp

echo "Deploying backend..."
run_ssh "mkdir -p $REMOTE_DIR && find $REMOTE_DIR -mindepth 1 -maxdepth 1 -exec rm -rf {} + && tar -xzf $REMOTE_TAR -C $REMOTE_DIR && bash $REMOTE_DIR/scripts/remote-deploy-backend.sh"

echo "Backend deployment complete."
