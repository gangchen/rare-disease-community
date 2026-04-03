#!/bin/bash
set -e

# ============================================
# 罕见病社区 - 腾讯云/阿里云服务器初始化脚本
#
# 在全新的 Ubuntu 22.04/24.04 服务器上运行：
#   curl -fsSL <此脚本URL> | bash
# 或者复制到服务器后：
#   chmod +x setup-server.sh && sudo ./setup-server.sh
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 检查 root 权限
if [ "$EUID" -ne 0 ]; then
  error "请使用 sudo 运行此脚本"
fi

APP_USER="app"
APP_DIR="/home/$APP_USER/rare-disease-community"
DOMAIN="${1:-}"  # 可选参数：域名

echo ""
echo "========================================="
echo "  罕见病社区 - 服务器初始化"
echo "========================================="
echo ""

# ---------- 1. 系统更新 ----------
info "1/7 更新系统软件包..."
apt-get update -qq
apt-get upgrade -y -qq

# ---------- 2. 安装基础工具 ----------
info "2/7 安装基础工具..."
apt-get install -y -qq git curl wget ufw nginx certbot python3-certbot-nginx

# ---------- 3. 安装 Node.js 20 ----------
info "3/7 安装 Node.js 20..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
node -v
npm -v

# ---------- 4. 创建应用用户 ----------
info "4/7 创建应用用户..."
if ! id "$APP_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$APP_USER"
  info "已创建用户: $APP_USER"
else
  info "用户 $APP_USER 已存在，跳过"
fi

# ---------- 5. 克隆项目 ----------
info "5/7 克隆项目..."
if [ -d "$APP_DIR" ]; then
  warn "项目目录已存在，拉取最新代码..."
  cd "$APP_DIR"
  BRANCH=$(sudo -u "$APP_USER" git rev-parse --abbrev-ref HEAD)
  sudo -u "$APP_USER" git pull origin "$BRANCH" || true
else
  sudo -u "$APP_USER" git clone https://github.com/gangchen/rare-disease-community.git "$APP_DIR"
  cd "$APP_DIR"
fi

# 安装依赖 + 初始化数据库 + 构建
info "安装依赖..."
sudo -u "$APP_USER" npm ci --omit=dev

if [ ! -f "$APP_DIR/data/community.db" ]; then
  info "初始化数据库..."
  sudo -u "$APP_USER" mkdir -p data
  sudo -u "$APP_USER" node scripts/init-db.js
fi

info "构建项目..."
sudo -u "$APP_USER" npm run build

# ---------- 6. 配置 systemd 服务 ----------
info "6/7 配置 systemd 服务..."
cat > /etc/systemd/system/rare-disease-community.service << 'UNIT'
[Unit]
Description=Rare Disease Community (Next.js)
After=network.target

[Service]
Type=simple
User=app
Group=app
WorkingDirectory=/home/app/rare-disease-community
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0
EnvironmentFile=-/home/app/rare-disease-community/.env.local

# 日志
StandardOutput=journal
StandardError=journal
SyslogIdentifier=rdc

# 安全
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/home/app/rare-disease-community/data

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable rare-disease-community
systemctl restart rare-disease-community

info "服务已启动"

# ---------- 7. 配置 Nginx ----------
info "7/7 配置 Nginx..."

SERVER_NAME="${DOMAIN:-_}"

cat > /etc/nginx/sites-available/rare-disease-community << NGINX
server {
    listen 80;
    server_name ${SERVER_NAME};

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # 静态文件缓存
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # 反向代理到 Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/rare-disease-community /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

# ---------- 8. 配置防火墙 ----------
info "配置防火墙..."
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# ---------- 完成 ----------
echo ""
echo "========================================="
echo -e "  ${GREEN}部署完成！${NC}"
echo "========================================="
echo ""
echo "  访问地址: http://$(curl -s ifconfig.me 2>/dev/null || echo '<服务器IP>')"
if [ -n "$DOMAIN" ]; then
  echo "  域名地址: http://$DOMAIN"
  echo ""
  echo "  配置 HTTPS（免费 SSL）："
  echo "    sudo certbot --nginx -d $DOMAIN"
fi
echo ""
echo "  常用命令："
echo "    查看状态:   sudo systemctl status rare-disease-community"
echo "    查看日志:   sudo journalctl -u rare-disease-community -f"
echo "    重启服务:   sudo systemctl restart rare-disease-community"
echo "    更新部署:   cd $APP_DIR && git pull && npm ci && npm run build && sudo systemctl restart rare-disease-community"
echo ""
