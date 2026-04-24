#!/bin/bash
# Vite 静态站零停机部署脚本：在 releases 中构建 dist，完成后切换 current 符号链接。
# 前提：Web 服务器站点根目录指向 "$APP_ROOT/current/dist"
set -euo pipefail

KEEP_RELEASES="${KEEP_RELEASES:-5}"

if [ -z "${APP_ROOT:-}" ]; then
  echo "错误：请设置环境变量 APP_ROOT（站点根目录），例: APP_ROOT=/var/www/dogeow.com $0" >&2
  exit 1
fi

case "$KEEP_RELEASES" in
  ''|*[!0-9]*)
    echo "错误：KEEP_RELEASES 必须为非负整数，当前值: $KEEP_RELEASES" >&2
    exit 1
    ;;
esac

RELEASES_DIR="${APP_ROOT}/releases"
CURRENT_LINK="${APP_ROOT}/current"
LOCK_FILE="${APP_ROOT}/.deploy.lock"
SHARED_CONFIG_DIR="${SHARED_CONFIG_DIR:-${APP_ROOT%/}.shared}"
PENDING_RELEASE=""
PENDING_LINK=""

log() {
  echo "[deploy] $*"
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

cleanup_lock() {
  rm -f "$LOCK_FILE" 2>/dev/null || true
}

cleanup_pending_release() {
  if [ -n "$PENDING_RELEASE" ] && [ -d "$PENDING_RELEASE" ]; then
    rm -rf "$PENDING_RELEASE"
  fi
}

cleanup_pending_link() {
  if [ -n "$PENDING_LINK" ] && [ -L "$PENDING_LINK" ]; then
    rm -f "$PENDING_LINK"
  fi
}

on_exit() {
  local exit_code="$?"

  if [ "$exit_code" -ne 0 ]; then
    cleanup_pending_release
    cleanup_pending_link
  fi

  cleanup_lock
  exit "$exit_code"
}

acquire_lock() {
  local lock_pid=""

  if ( set -o noclobber; echo "$$" > "$LOCK_FILE" ) 2>/dev/null; then
    return
  fi

  if [ -f "$LOCK_FILE" ]; then
    read -r lock_pid < "$LOCK_FILE" || true
  fi

  if [ -n "$lock_pid" ] && kill -0 "$lock_pid" 2>/dev/null; then
    die "部署锁存在，可能有其他部署正在进行：$LOCK_FILE (PID: $lock_pid)"
  fi

  if [ -z "$lock_pid" ]; then
    die "部署锁存在但未记录 PID，请检查后重试：$LOCK_FILE"
  fi

  log "发现陈旧部署锁，正在清理：$LOCK_FILE"
  rm -f "$LOCK_FILE"

  if ! ( set -o noclobber; echo "$$" > "$LOCK_FILE" ) 2>/dev/null; then
    die "无法获取部署锁：$LOCK_FILE"
  fi
}

copy_local_config_files() {
  local destination="$1"
  local source_dir
  local file
  local files=()

  for source_dir in "$APP_ROOT" "$SHARED_CONFIG_DIR"; do
    [ -d "$source_dir" ] || continue

    shopt -s nullglob
    files=("$source_dir"/.env* "$source_dir"/.npmrc)
    shopt -u nullglob

    for file in "${files[@]}"; do
      [ -f "$file" ] || continue
      cp -f "$file" "$destination/"
    done
  done
}

is_tracked_path() {
  local rel_path="$1"

  git -C "$APP_ROOT" ls-files --error-unmatch -- "$rel_path" >/dev/null 2>&1
}

migrate_app_root_config_files() {
  local file
  local files=()
  local rel_path
  local migrated_any=0

  shopt -s nullglob
  files=("$APP_ROOT"/.env* "$APP_ROOT"/.npmrc)
  shopt -u nullglob

  for file in "${files[@]}"; do
    [ -f "$file" ] || continue
    rel_path="${file#"$APP_ROOT"/}"

    if is_tracked_path "$rel_path"; then
      continue
    fi

    mkdir -p "$SHARED_CONFIG_DIR"
    cp -f "$file" "$SHARED_CONFIG_DIR/"
    rm -f "$file"
    migrated_any=1
  done

  if [ "$migrated_any" -eq 1 ]; then
    log "已将未跟踪的本地配置迁移到共享目录：$SHARED_CONFIG_DIR"
  fi
}

copy_deploy_snapshot() {
  local destination="$1"

  mkdir -p "$destination"
  git -C "$APP_ROOT" archive --format=tar HEAD | tar -xf - -C "$destination"
  copy_local_config_files "$destination"
}

build_release() {
  local release_dir="$1"

  log "构建发布目录：$release_dir"
  copy_deploy_snapshot "$release_dir"

  (
    cd "$release_dir"
    npm ci
    npm run build
  )
}

list_release_names() {
  if [ ! -d "$RELEASES_DIR" ]; then
    return
  fi

  find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -print 2>/dev/null \
    | sed 's#.*/##' \
    | grep -E '^[0-9]{14}$' \
    | sort -r || true
}

cleanup_old_releases() {
  local current_target=""
  local kept=0
  local release_name
  local release_path

  if [ -L "$CURRENT_LINK" ]; then
    current_target="$(readlink "$CURRENT_LINK")"
  fi

  while IFS= read -r release_name; do
    [ -n "$release_name" ] || continue
    release_path="${RELEASES_DIR}/${release_name}"

    if [ "$release_path" = "$current_target" ]; then
      kept=$((kept + 1))
      continue
    fi

    if [ "$kept" -lt "$KEEP_RELEASES" ]; then
      kept=$((kept + 1))
      continue
    fi

    log "清理旧发布目录：$release_path"
    rm -rf "$release_path"
  done < <(list_release_names)
}

switch_current_link() {
  PENDING_LINK="${APP_ROOT}/.current-${RELEASE_ID}-$$"
  ln -s "$NEW_RELEASE" "$PENDING_LINK"
  mv -f "$PENDING_LINK" "$CURRENT_LINK"
  PENDING_LINK=""
}

trap 'on_exit' EXIT

require_command git
require_command tar
require_command npm

if [ ! -d "$APP_ROOT" ]; then
  die "APP_ROOT 不存在：$APP_ROOT"
fi

if ! git -C "$APP_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  die "APP_ROOT 不是有效的 Git 工作树：$APP_ROOT"
fi

mkdir -p "$RELEASES_DIR"
acquire_lock
migrate_app_root_config_files

if [ -e "$CURRENT_LINK" ] && [ ! -L "$CURRENT_LINK" ]; then
  die "$CURRENT_LINK 必须不存在或为符号链接"
fi

if [ -L "$CURRENT_LINK" ]; then
  log "使用发布目录模式（零停机）"
else
  log "首次发布：创建 releases + current"
fi

RELEASE_ID="$(date +%Y%m%d%H%M%S)"
NEW_RELEASE="${RELEASES_DIR}/${RELEASE_ID}"
PENDING_RELEASE="${RELEASES_DIR}/.tmp-${RELEASE_ID}-$$"

if [ -e "$NEW_RELEASE" ] || [ -e "$PENDING_RELEASE" ]; then
  die "发布目录已存在，请稍后重试：$NEW_RELEASE"
fi

log "当前提交：$(git -C "$APP_ROOT" rev-parse --short HEAD)"
build_release "$PENDING_RELEASE"
mv "$PENDING_RELEASE" "$NEW_RELEASE"
PENDING_RELEASE=""

switch_current_link
log "已切换 current -> $NEW_RELEASE"

cleanup_old_releases

log "完成"
log "请确认 Web 根目录指向：$CURRENT_LINK/dist"
