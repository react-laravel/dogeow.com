#!/usr/bin/env bash
set -euo pipefail

check_only=false
case "${1:-}" in
  '') ;;
  --check-only) check_only=true;;
  *) echo 'Usage: bash scripts/deploy-to-c.sh [--check-only]' >&2; exit 2;;
esac
revision="${GITHUB_SHA:-$(git rev-parse HEAD)}"
[[ "$revision" =~ ^[a-f0-9]{40}$ ]] || { echo 'Expected a full Git commit SHA' >&2; exit 1; }
[[ -f .deploy-runtime/dist/index.html ]] || { echo 'Package dist first' >&2; exit 1; }
: "${C_DEPLOY_SSH_KEY:?C_DEPLOY_SSH_KEY must be configured}"
: "${C_DEPLOY_KNOWN_HOSTS:?C_DEPLOY_KNOWN_HOSTS must be configured}"

auth_dir="$(mktemp -d "${RUNNER_TEMP:-/tmp}/deploy-c.XXXXXX")"
trap 'rm -rf "$auth_dir"' EXIT
chmod 700 "$auth_dir"
printf '%s\n' "$C_DEPLOY_SSH_KEY" > "$auth_dir/key"
printf '%s\n' "$C_DEPLOY_KNOWN_HOSTS" > "$auth_dir/known_hosts"
chmod 600 "$auth_dir/key" "$auth_dir/known_hosts"
cat > "$auth_dir/config" <<CONFIG
Host main-sites-c
  HostName 120.26.21.64
  User web-deploy
  IdentityFile $auth_dir/key
  UserKnownHostsFile $auth_dir/known_hosts
  IdentitiesOnly yes
  BatchMode yes
  StrictHostKeyChecking yes
  ConnectTimeout 15
  ServerAliveInterval 15
  ServerAliveCountMax 3
CONFIG
export RSYNC_RSH="ssh -F $auth_dir/config"
if "$check_only"; then
  ssh -F "$auth_dir/config" main-sites-c 'test -d /var/www/homepage/releases'
  echo 'Validation only: current C release will not be changed.'
else
  rsync -az -- .deploy-runtime/ "main-sites-c:/var/www/homepage/releases/.incoming-$revision/"
  ssh -F "$auth_dir/config" main-sites-c \
    "sudo -n /usr/local/sbin/deploy-main-sites homepage $revision"
fi
node scripts/verify-server-c.mjs dogeow.com www.dogeow.com
