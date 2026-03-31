#!/bin/bash
# Vite 静态站零停机部署脚本：在 releases 中构建 dist，完成后切换 current 符号链接。
# 前提：Web 服务器站点根目录指向 "$APP_ROOT/current/dist"
set -euo pipefail

# 可配置的部署参数
KEEP_RELEASES="${KEEP_RELEASES:-5}"   # 最多保留的旧发布版本数量，可通过环境变量覆盖

if [ -z "${APP_ROOT:-}" ]; then
  echo "错误：请设置环境变量 APP_ROOT（站点根目录），例: APP_ROOT=/www/wwwroot/dogeow.com $0"
  exit 1
fi

RELEASES_DIR="${APP_ROOT}/releases"
CURRENT_LINK="${APP_ROOT}/current"
LOCK_FILE="${APP_ROOT}/.deploy.lock"

cd "$APP_ROOT"

# 防止并发部署
if [ -f "$LOCK_FILE" ]; then
  echo "错误：部署锁文件存在，可能有其他部署正在进行: $LOCK_FILE"
  exit 1
fi
trap 'rm -f "$LOCK_FILE"' EXIT
echo "$$" > "$LOCK_FILE"

if ! git -C "$APP_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "错误：APP_ROOT 不是有效的 Git 工作树：$APP_ROOT"
  exit 1
fi

copy_deploy_snapshot() {
  local destination="$1"
  mkdir -p "$destination"
  git -C "$APP_ROOT" archive --format=tar HEAD | tar -xf - -C "$destination"

  # 复制本地配置文件（.env、.npmrc 等）
  cp -n "$APP_ROOT"/.env* "$APP_ROOT"/.npmrc "$destination/" 2>/dev/null || true
}

build_release() {
  local release_dir="$1"
  local orig_dir
  orig_dir="$(pwd)"

  echo "[deploy] 构建发布目录: $release_dir"
  copy_deploy_snapshot "$release_dir"

  # npm ci/build 失败则整个部署失败
  cd "$release_dir"
  npm ci || exit 1
  npm run build || exit 1
  cd "$orig_dir"
}

cleanup_old_releases() {
  if [ -d "$RELEASES_DIR" ]; then
    ls -1t "$RELEASES_DIR" | grep -E '^[0-9]{14}$' | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf
  fi
}

mkdir -p "$RELEASES_DIR"

if [ -e "$CURRENT_LINK" ] && [ ! -L "$CURRENT_LINK" ]; then
  echo "错误：$CURRENT_LINK 必须不存在或为符号链接"
  exit 1
fi

if [ -L "$CURRENT_LINK" ]; then
  echo "[deploy] 使用发布目录模式（零停机）"
else
  echo "[deploy] 首次部署：创建 releases + current"
fi

NEW_RELEASE="${RELEASES_DIR}/$(date +%Y%m%d%H%M%S)"
build_release "$NEW_RELEASE"

ln -sfn "$NEW_RELEASE" "$CURRENT_LINK"
echo "[deploy] 已切换 current -> $NEW_RELEASE"

cleanup_old_releases

echo "[deploy] 完成"
echo "[deploy] 请确认 Web 根目录指向: $CURRENT_LINK/dist"
