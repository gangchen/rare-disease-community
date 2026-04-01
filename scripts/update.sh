#!/bin/bash
set -e

# ============================================
# 罕见病社区 - 代码更新脚本
# 在服务器上运行，拉取最新代码并重启
# 用法: ./scripts/update.sh
# ============================================

APP_DIR="/home/app/rare-disease-community"

GREEN='\033[0;32m'
NC='\033[0m'
info() { echo -e "${GREEN}[INFO]${NC} $1"; }

cd "$APP_DIR"

info "拉取最新代码..."
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git pull origin "$BRANCH"

info "安装依赖..."
npm ci --omit=dev

info "构建项目..."
npm run build

info "重启服务..."
sudo systemctl restart rare-disease-community

info "更新完成！"
echo "  查看状态: sudo systemctl status rare-disease-community"
echo "  查看日志: sudo journalctl -u rare-disease-community -f"
