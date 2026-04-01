#!/bin/bash
set -e

# ============================================
# 罕见病社区 - 一键部署脚本
# 用法:
#   ./deploy.sh              # Docker 部署（推荐）
#   ./deploy.sh --local      # 本地直接部署
#   ./deploy.sh --stop       # 停止 Docker 服务
#   ./deploy.sh --reset-db   # 重置数据库
# ============================================

APP_NAME="rare-disease-community"
PORT="${PORT:-3000}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ---------- 检查依赖 ----------

check_command() {
  if ! command -v "$1" &> /dev/null; then
    error "$1 未安装，请先安装 $1"
  fi
}

# ---------- Docker 部署 ----------

deploy_docker() {
  check_command docker

  info "Docker 部署开始..."

  # 检查 docker compose 版本
  if docker compose version &> /dev/null; then
    COMPOSE="docker compose"
  elif command -v docker-compose &> /dev/null; then
    COMPOSE="docker-compose"
  else
    error "docker compose 未安装"
  fi

  info "构建镜像..."
  $COMPOSE build

  info "启动服务..."
  $COMPOSE up -d

  info "等待服务启动..."
  sleep 3

  if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}" | grep -q "200"; then
    info "部署成功！"
    echo ""
    echo "  网站地址:     http://localhost:${PORT}"
    echo "  API 文档:     http://localhost:${PORT}/api-docs"
    echo "  API 基础URL:  http://localhost:${PORT}/api"
    echo ""
    echo "  管理命令:"
    echo "    查看日志:   $COMPOSE logs -f"
    echo "    停止服务:   ./deploy.sh --stop"
    echo "    重置数据库: ./deploy.sh --reset-db"
  else
    warn "服务可能还在启动中，请稍后访问 http://localhost:${PORT}"
    echo "  查看日志: $COMPOSE logs -f"
  fi
}

# ---------- 本地部署 ----------

deploy_local() {
  check_command node
  check_command npm

  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    error "需要 Node.js >= 18，当前版本: $(node -v)"
  fi

  info "本地部署开始..."

  info "安装依赖..."
  npm ci --omit=dev 2>&1 | tail -1

  # 初始化数据库（如果不存在）
  if [ ! -f "data/community.db" ]; then
    info "初始化数据库..."
    mkdir -p data
    node scripts/init-db.js
  else
    info "数据库已存在，跳过初始化"
  fi

  info "构建项目..."
  npm run build 2>&1 | tail -3

  info "启动服务..."
  echo ""
  echo "  网站地址:     http://localhost:${PORT}"
  echo "  API 文档:     http://localhost:${PORT}/api-docs"
  echo "  API 基础URL:  http://localhost:${PORT}/api"
  echo ""
  echo "  按 Ctrl+C 停止服务"
  echo ""

  PORT=$PORT npm start
}

# ---------- 停止服务 ----------

stop_docker() {
  info "停止 Docker 服务..."
  if docker compose version &> /dev/null; then
    docker compose down
  else
    docker-compose down
  fi
  info "服务已停止"
}

# ---------- 重置数据库 ----------

reset_db() {
  warn "即将重置数据库，所有数据将被清除！"
  read -p "确认继续？(y/N): " confirm
  if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    info "已取消"
    exit 0
  fi

  rm -f data/community.db data/community.db-wal data/community.db-shm
  node scripts/init-db.js
  info "数据库已重置"
}

# ---------- 入口 ----------

case "${1:-}" in
  --local)
    deploy_local
    ;;
  --stop)
    stop_docker
    ;;
  --reset-db)
    reset_db
    ;;
  --help|-h)
    echo "用法: ./deploy.sh [选项]"
    echo ""
    echo "选项:"
    echo "  (无参数)     Docker 部署（推荐）"
    echo "  --local      本地直接部署（需要 Node.js >= 18）"
    echo "  --stop       停止 Docker 服务"
    echo "  --reset-db   重置数据库（清除所有数据）"
    echo "  --help       显示帮助"
    echo ""
    echo "环境变量:"
    echo "  PORT=3000    自定义端口号"
    ;;
  *)
    deploy_docker
    ;;
esac
