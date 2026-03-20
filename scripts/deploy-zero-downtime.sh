#!/bin/bash
# Vite 静态站零停机部署脚本：在 releases 中构建 dist，完成后切换 current 符号链接。
# 前提：Web 服务器站点根目录指向 "$APP_ROOT/current/dist"
set -euo pipefail

if [ -z "${APP_ROOT:-}" ]; then
  echo "错误：请设置环境变量 APP_ROOT（站点根目录），例: APP_ROOT=/var/www/dogeow.com $0"
  exit 1
fi

RELEASES_DIR="${APP_ROOT}/releases"
CURRENT_LINK="${APP_ROOT}/current"
KEEP_RELEASES="${KEEP_RELEASES:-5}"

cd "$APP_ROOT"

if ! git -C "$APP_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "错误：APP_ROOT 不是有效的 Git 工作树：$APP_ROOT"
  exit 1
fi

copy_deploy_snapshot() {
  local destination="$1"

  mkdir -p "$destination"
  git -C "$APP_ROOT" archive --format=tar HEAD | tar -xf - -C "$destination"

  while IFS= read -r -d '' local_file; do
    cp "$local_file" "$destination/"
  done < <(find "$APP_ROOT" -maxdepth 1 -type f \( -name '.env*' -o -name '.npmrc' \) -print0)
}

build_release() {
  local release_dir="$1"

  echo "[deploy] 构建发布目录: $release_dir"
  copy_deploy_snapshot "$release_dir"

  cd "$release_dir"
  npm ci
  npm run build
  cd "$APP_ROOT"
}

cleanup_old_releases() {
  (
    cd "$RELEASES_DIR" &&
      ls -1t | grep -E '^[0-9]{14}$' | tail -n +$((KEEP_RELEASES + 1)) | while read -r dir; do
        [ -n "$dir" ] && rm -rf "$RELEASES_DIR/$dir"
      done
  ) || true
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
