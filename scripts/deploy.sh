#!/usr/bin/env bash
# 一键构建并部署数字简历展馆（Docker Compose）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-8090}"
COMPOSE="docker compose"

info()  { printf '\033[1;34m[INFO]\033[0m %s\n' "$*"; }
ok()    { printf '\033[1;32m[OK]\033[0m   %s\n' "$*"; }
warn()  { printf '\033[1;33m[WARN]\033[0m %s\n' "$*"; }
fail()  { printf '\033[1;31m[FAIL]\033[0m %s\n' "$*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || fail "未找到 docker，请先安装 Docker"
docker compose version >/dev/null 2>&1 || fail "未找到 docker compose 插件"

info "项目目录: $ROOT"
info "构建并启动容器..."
$COMPOSE up -d --build

info "等待服务就绪..."
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${PORT}/" 2>/dev/null; then
    ok "服务已就绪 (http://127.0.0.1:${PORT}/)"
    break
  fi
  if [ "$i" -eq 30 ]; then
    warn "健康检查超时，请查看日志: docker compose logs -f"
    exit 1
  fi
  sleep 2
done

# 若本机有 NPM，尝试将简历容器加入同一 Docker 网络（可选）
if docker ps --format '{{.Names}}' | grep -q '^nginx-proxy-manager$'; then
  NET="$(docker inspect nginx-proxy-manager --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}' | awk '{print $1}')"
  CID="$($COMPOSE ps -q resume-museum 2>/dev/null || true)"
  if [ -n "$NET" ] && [ -n "$CID" ]; then
    CNAME="$(docker inspect "$CID" --format '{{.Name}}' | sed 's|^/||')"
    if docker network connect "$NET" "$CNAME" 2>/dev/null; then
      ok "已加入 NPM 网络 ($NET)，可用容器名 $CNAME:80 做反向代理"
    fi
  fi
fi

echo
ok "部署完成"
echo "  本地访问:  http://127.0.0.1:${PORT}/"
echo "  直连端口:  http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo '服务器IP'):${PORT}/"
echo "  域名示例:  http://cv.bookfree.online/  (需 NPM Forward → 172.17.0.1:${PORT})"
echo
echo "常用命令:"
echo "  docker compose ps"
echo "  docker compose logs -f"
echo "  docker compose down"
