#!/bin/bash
# 首次服务器部署脚本：在已手动 clone 的仓库中创建首个 release，并指向 current。
set -euo pipefail

AUTO_DETECTED_APP_ROOT=0

if [ -z "${APP_ROOT:-}" ]; then
  APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
  AUTO_DETECTED_APP_ROOT=1
fi

RELEASES_DIR="${APP_ROOT}/releases"
CURRENT_LINK="${APP_ROOT}/current"
SHARED_CONFIG_DIR="${SHARED_CONFIG_DIR:-${APP_ROOT%/}.shared}"
RELEASE_ID="$(date +%Y%m%d%H%M%S)"
NEW_RELEASE="${RELEASES_DIR}/${RELEASE_ID}"
PENDING_RELEASE="${RELEASES_DIR}/.tmp-${RELEASE_ID}-$$"

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

cleanup_pending_release() {
  if [ -d "$PENDING_RELEASE" ]; then
    rm -rf "$PENDING_RELEASE"
  fi
}

cleanup_failed_release() {
  if [ ! -L "$CURRENT_LINK" ] && [ -d "$NEW_RELEASE" ]; then
    rm -rf "$NEW_RELEASE"
  fi
}

on_exit() {
  local exit_code="$?"

  if [ "$exit_code" -ne 0 ]; then
    cleanup_pending_release
    cleanup_failed_release
  fi

  exit "$exit_code"
}

copy_local_config_files() {
  local destination="$1"
  local source_dir
  local file
  local files=()

  for source_dir in "$APP_ROOT" "$SHARED_CONFIG_DIR"; do
    [ -d "$source_dir" ] || continue

    shopt -s nullglob
    files=("$source_dir"/.env*)
    shopt -u nullglob

    for file in "${files[@]}"; do
      [ -f "$file" ] || continue
      cp -f "$file" "$destination/"
    done
  done
}

copy_deploy_snapshot() {
  local destination="$1"

  mkdir -p "$destination"
  git -C "$APP_ROOT" archive --format=tar HEAD | tar -xf - -C "$destination"
  copy_local_config_files "$destination"
}

build_first_release() {
  log "构建首个发布目录：$PENDING_RELEASE"
  copy_deploy_snapshot "$PENDING_RELEASE"

  (
    cd "$PENDING_RELEASE"
    npm ci
    npm run build
  )
}

trap 'on_exit' EXIT

require_command git
require_command tar
require_command npm

if [ "$AUTO_DETECTED_APP_ROOT" -eq 1 ]; then
  log "自动识别 APP_ROOT：$APP_ROOT"
fi

if [ ! -d "$APP_ROOT" ]; then
  die "APP_ROOT 不存在：$APP_ROOT"
fi

if ! git -C "$APP_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  die "APP_ROOT 不是有效的 Git 工作树，请先手动 git clone 仓库到目标目录"
fi

if [ -e "$CURRENT_LINK" ] || [ -L "$CURRENT_LINK" ]; then
  die "检测到 current 已存在，首次部署似乎已经完成；后续更新请改用 scripts/deploy-zero-downtime.sh"
fi

mkdir -p "$RELEASES_DIR"

if find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -print -quit | grep -q .; then
  die "检测到已有 release 目录，首次部署脚本只适用于空的 releases 目录"
fi

log "当前提交：$(git -C "$APP_ROOT" rev-parse --short HEAD)"
build_first_release
mv "$PENDING_RELEASE" "$NEW_RELEASE"
ln -s "$NEW_RELEASE" "$CURRENT_LINK"

log "已创建首个发布：$NEW_RELEASE"
log "已创建 current -> $NEW_RELEASE"
log "首次部署完成"
log "后续更新请使用：$APP_ROOT/scripts/deploy-zero-downtime.sh"