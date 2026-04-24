#!/bin/bash
# 首次服务器部署脚本：初始化 APP_ROOT 仓库工作树，并调用零停机部署脚本完成首个 release。
set -euo pipefail

DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"

if [ -z "${APP_ROOT:-}" ]; then
  echo "错误：请设置环境变量 APP_ROOT（站点根目录），例: APP_ROOT=/var/www/dogeow.com REPO_URL=git@github.com:you/repo.git $0" >&2
  exit 1
fi

if [ -z "${REPO_URL:-}" ]; then
  echo "错误：请设置环境变量 REPO_URL（仓库地址），例: REPO_URL=git@github.com:you/repo.git" >&2
  exit 1
fi

case "$KEEP_RELEASES" in
  ''|*[!0-9]*)
    echo "错误：KEEP_RELEASES 必须为非负整数，当前值: $KEEP_RELEASES" >&2
    exit 1
    ;;
esac

SHARED_CONFIG_DIR="${SHARED_CONFIG_DIR:-${APP_ROOT%/}.shared}"

log() {
  echo "[first-deploy] $*"
}

die() {
  echo "错误：$*" >&2
  exit 1
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    die "缺少命令：$1"
  fi
}

dir_has_entries() {
  local target_dir="$1"

  if [ ! -d "$target_dir" ]; then
    return 1
  fi

  find "$target_dir" -mindepth 1 -print -quit | grep -q .
}

copy_local_config_files() {
  local source_dir="$1"
  local file
  local files=()

  shopt -s nullglob
  files=("$source_dir"/.env* "$source_dir"/.npmrc)
  shopt -u nullglob

  for file in "${files[@]}"; do
    [ -f "$file" ] || continue
    cp -f "$file" "$SHARED_CONFIG_DIR/"
  done
}

clone_or_update_repo() {
  local remote_url=""

  mkdir -p "$(dirname "$APP_ROOT")"

  if [ -d "$APP_ROOT/.git" ]; then
    remote_url="$(git -C "$APP_ROOT" remote get-url origin 2>/dev/null || true)"
    if [ -n "$remote_url" ] && [ "$remote_url" != "$REPO_URL" ]; then
      die "APP_ROOT 已存在其他仓库：$remote_url"
    fi

    log "复用已有仓库工作树：$APP_ROOT"
  else
    if [ -e "$APP_ROOT" ] && [ ! -d "$APP_ROOT" ]; then
      die "APP_ROOT 已存在且不是目录：$APP_ROOT"
    fi

    mkdir -p "$APP_ROOT"
    if dir_has_entries "$APP_ROOT"; then
      die "APP_ROOT 已存在且非空，且不是 Git 工作树：$APP_ROOT"
    fi

    log "克隆仓库到：$APP_ROOT"
    git clone --branch "$DEPLOY_BRANCH" --single-branch "$REPO_URL" "$APP_ROOT"
  fi

  git -C "$APP_ROOT" fetch --prune origin "$DEPLOY_BRANCH"
  git -C "$APP_ROOT" checkout "$DEPLOY_BRANCH"
  git -C "$APP_ROOT" pull --ff-only origin "$DEPLOY_BRANCH"
}

sync_optional_local_config() {
  if [ -z "${LOCAL_CONFIG_DIR:-}" ]; then
    return
  fi

  if [ ! -d "$LOCAL_CONFIG_DIR" ]; then
    die "LOCAL_CONFIG_DIR 不存在：$LOCAL_CONFIG_DIR"
  fi

  mkdir -p "$SHARED_CONFIG_DIR"
  log "同步本地配置到共享目录：$SHARED_CONFIG_DIR"
  copy_local_config_files "$LOCAL_CONFIG_DIR"
}

require_command git
require_command tar
require_command npm

clone_or_update_repo
sync_optional_local_config

if [ ! -x "$APP_ROOT/scripts/deploy-zero-downtime.sh" ]; then
  chmod +x "$APP_ROOT/scripts/deploy-zero-downtime.sh"
fi

log "开始执行首个发布"
APP_ROOT="$APP_ROOT" KEEP_RELEASES="$KEEP_RELEASES" "$APP_ROOT/scripts/deploy-zero-downtime.sh"
log "首次部署完成"