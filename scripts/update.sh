#!/bin/bash
set -e

# ============================================
# 罕见病社区 - 代码更新脚本
# 在服务器上运行，拉取最新代码并重启
# 用法: ./scripts/update.sh
# ============================================

APP_DIR="/home/app/rare-disease-community"
LOG_FILE="$APP_DIR/deploy.log"
DB_FILE="$APP_DIR/data/community.db"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

cd "$APP_DIR"

# 记录部署开始
echo "=========================================" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始部署" >> "$LOG_FILE"

info "拉取最新代码..."
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git pull origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE"

info "安装依赖..."
npm ci --omit=dev 2>&1 | tail -1 | tee -a "$LOG_FILE"

# 检查数据库是否需要更新（检测缺失的表）
if [ -f "$DB_FILE" ]; then
  MISSING_TABLES=""
  for TABLE in diseases users posts comments likes news tokens api_keys; do
    EXISTS=$(sqlite3 "$DB_FILE" "SELECT name FROM sqlite_master WHERE type='table' AND name='$TABLE';" 2>/dev/null || echo "")
    if [ -z "$EXISTS" ]; then
      MISSING_TABLES="$MISSING_TABLES $TABLE"
    fi
  done

  if [ -n "$MISSING_TABLES" ]; then
    warn "检测到缺失的数据库表:$MISSING_TABLES"
    warn "重新初始化数据库..."
    node scripts/init-db.js 2>&1 | tee -a "$LOG_FILE"
  fi
else
  info "数据库不存在，初始化..."
  mkdir -p data
  node scripts/init-db.js 2>&1 | tee -a "$LOG_FILE"
fi

info "构建项目..."
npm run build 2>&1 | tail -3 | tee -a "$LOG_FILE"

info "重启服务..."
sudo systemctl restart rare-disease-community

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 部署完成 (分支: $BRANCH, 提交: $(git rev-parse --short HEAD))" >> "$LOG_FILE"

info "更新完成！"
echo "  查看状态: sudo systemctl status rare-disease-community"
echo "  查看日志: sudo journalctl -u rare-disease-community -f"
echo "  部署记录: cat $LOG_FILE"
