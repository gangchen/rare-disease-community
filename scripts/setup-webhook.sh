#!/bin/bash
set -e

# ============================================
# 罕见病社区 - GitHub Webhook 自动部署安装脚本
#
# 功能：当 deploy 分支收到 push 时，自动拉取代码并部署
# 用法：sudo bash scripts/setup-webhook.sh
#
# 原理：
#   GitHub push → Nginx(:80/hooks/) → webhook(:9000) → update.sh
#   共用 80 端口，不与网站冲突
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

if [ "$EUID" -ne 0 ]; then
  error "请使用 sudo 运行此脚本：sudo bash scripts/setup-webhook.sh"
fi

APP_USER="app"
APP_DIR="/home/$APP_USER/rare-disease-community"
WEBHOOK_CONF="/home/$APP_USER/webhook.json"
DEPLOY_BRANCH="${1:-deploy}"
NGINX_CONF="/etc/nginx/sites-available/rare-disease-community"

echo ""
echo "========================================="
echo "  Webhook 自动部署 - 安装配置"
echo "========================================="
echo "  部署分支: $DEPLOY_BRANCH"
echo "========================================="
echo ""

# ---------- 1. 安装 webhook ----------
info "1/5 安装 webhook 工具..."
if command -v webhook &> /dev/null; then
  info "webhook 已安装，跳过"
else
  apt-get update -qq
  apt-get install -y -qq webhook
fi

# ---------- 2. 生成 Secret ----------
WEBHOOK_SECRET=$(openssl rand -hex 20)
info "2/5 已生成 Webhook Secret"

# ---------- 3. 创建 webhook 配置 ----------
info "3/5 创建 webhook 配置..."

cat > "$WEBHOOK_CONF" << HOOKJSON
[
  {
    "id": "deploy",
    "execute-command": "$APP_DIR/scripts/update.sh",
    "command-working-directory": "$APP_DIR",
    "pass-arguments-to-command": [],
    "response-message": "Deploy triggered",
    "trigger-rule": {
      "and": [
        {
          "match": {
            "type": "payload-hmac-sha256",
            "secret": "$WEBHOOK_SECRET",
            "parameter": {
              "source": "header",
              "name": "X-Hub-Signature-256"
            }
          }
        },
        {
          "match": {
            "type": "value",
            "value": "refs/heads/$DEPLOY_BRANCH",
            "parameter": {
              "source": "payload",
              "name": "ref"
            }
          }
        }
      ]
    }
  }
]
HOOKJSON

chown "$APP_USER:$APP_USER" "$WEBHOOK_CONF"
info "配置已写入 $WEBHOOK_CONF"

# ---------- 4. 配置 sudoers（让 app 用户可以重启服务） ----------
info "配置 sudoers 权限..."
SUDOERS_FILE="/etc/sudoers.d/rare-disease-community"
cat > "$SUDOERS_FILE" << 'SUDOERS'
# 允许 app 用户重启应用服务（webhook 自动部署需要）
app ALL=(ALL) NOPASSWD: /bin/systemctl restart rare-disease-community
app ALL=(ALL) NOPASSWD: /bin/systemctl status rare-disease-community
SUDOERS
chmod 440 "$SUDOERS_FILE"

# ---------- 5. 创建 systemd 服务 ----------
info "4/5 创建 webhook systemd 服务..."

cat > /etc/systemd/system/webhook.service << UNIT
[Unit]
Description=GitHub Webhook Auto Deploy
After=network.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
ExecStart=/usr/bin/webhook -hooks $WEBHOOK_CONF -port 9000 -ip 127.0.0.1 -verbose
Restart=always
RestartSec=5

StandardOutput=journal
StandardError=journal
SyslogIdentifier=webhook

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable webhook
systemctl restart webhook

info "webhook 服务已启动（端口 9000，仅本地监听）"

# ---------- 6. 更新 Nginx 配置 ----------
info "5/5 更新 Nginx 配置..."

if grep -q "/hooks/" "$NGINX_CONF" 2>/dev/null; then
  warn "Nginx 中已存在 /hooks/ 路径配置，跳过"
else
  # 在 location / { 之前插入 webhook 路径
  sed -i '/location \/ {/i \
    # Webhook 自动部署入口\
    location /hooks/ {\
        proxy_pass http://127.0.0.1:9000/hooks/;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Hub-Signature-256 $http_x_hub_signature_256;\
    }\
' "$NGINX_CONF"
fi

# 测试并重载 Nginx
nginx -t && systemctl reload nginx
info "Nginx 已更新并重载"

# ---------- 7. 创建 deploy 分支（如果不存在） ----------
info "检查 deploy 分支..."
cd "$APP_DIR"
if sudo -u "$APP_USER" git show-ref --verify --quiet "refs/heads/$DEPLOY_BRANCH" 2>/dev/null; then
  info "本地 $DEPLOY_BRANCH 分支已存在"
else
  CURRENT=$(sudo -u "$APP_USER" git rev-parse --abbrev-ref HEAD)
  sudo -u "$APP_USER" git branch "$DEPLOY_BRANCH" "$CURRENT"
  info "已基于 $CURRENT 创建 $DEPLOY_BRANCH 分支"
fi

# ---------- 完成 ----------
SERVER_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo '<服务器IP>')

echo ""
echo "========================================="
echo -e "  ${GREEN}Webhook 自动部署配置完成！${NC}"
echo "========================================="
echo ""
echo -e "  ${CYAN}接下来请在 GitHub 仓库中配置 Webhook：${NC}"
echo ""
echo "  1. 打开仓库 Settings → Webhooks → Add webhook"
echo ""
echo "  2. 填写以下信息："
echo -e "     Payload URL:   ${CYAN}http://$SERVER_IP/hooks/deploy${NC}"
echo "     Content type:  application/json"
echo -e "     Secret:        ${YELLOW}$WEBHOOK_SECRET${NC}"
echo "     Events:        Just the push event"
echo ""
echo -e "  ${CYAN}日常部署流程：${NC}"
echo ""
echo "  # 在本地开发完成后"
echo "  git checkout $DEPLOY_BRANCH"
echo "  git merge <开发分支>"
echo "  git push origin $DEPLOY_BRANCH   ← 自动触发服务器部署"
echo ""
echo -e "  ${CYAN}查看部署日志：${NC}"
echo "  sudo journalctl -u webhook -f        # webhook 接收日志"
echo "  sudo journalctl -u rare-disease-community -f  # 应用日志"
echo "  cat $APP_DIR/deploy.log              # 部署记录"
echo ""
echo -e "  ${YELLOW}⚠ 请立即保存上面的 Secret，之后无法再次查看！${NC}"
echo ""
