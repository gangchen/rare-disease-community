#!/bin/bash
set -e

# ============================================
# 罕见病社区 - 代码更新脚本
# 在服务器上运行，拉取最新代码并重启
# 用法: ./scripts/update.sh
# ============================================

APP_DIR="/home/app/rare-disease-community"
LOG_FILE="$APP_DIR/deploy.log"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'
info() { echo -e "${GREEN}[INFO]${NC} $1"; }

cd "$APP_DIR"

# 记录部署开始
echo "=========================================" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始部署" >> "$LOG_FILE"

info "拉取最新代码..."
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git pull origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE"

info "安装依赖..."
npm ci --omit=dev 2>&1 | tail -1 | tee -a "$LOG_FILE"

info "构建项目..."
npm run build 2>&1 | tail -3 | tee -a "$LOG_FILE"

info "重启服务..."
sudo systemctl restart rare-disease-community

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 部署完成 (分支: $BRANCH, 提交: $(git rev-parse --short HEAD))" >> "$LOG_FILE"

info "更新完成！"
echo "  查看状态: sudo systemctl status rare-disease-community"
echo "  查看日志: sudo journalctl -u rare-disease-community -f"
echo "  部署记录: cat $LOG_FILE"
