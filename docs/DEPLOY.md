# 腾讯云/阿里云部署指南

## 第一步：购买服务器

### 腾讯云

1. 打开 https://cloud.tencent.com/product/lighthouse
2. 选择**轻量应用服务器**
3. 配置选择：
   - 地域：选离你最近的（如广州、上海、北京）
   - 镜像：**Ubuntu 22.04 LTS**
   - 套餐：**2核 2GB 内存 50GB SSD**（约 50 元/月，够用了）
4. 设置密码或 SSH 密钥
5. 点击购买

### 阿里云

1. 打开 https://www.aliyun.com/product/ecs
2. 选择**经济型 e 实例**或**轻量应用服务器**
3. 配置选择：
   - 地域：选离你最近的
   - 镜像：**Ubuntu 22.04 LTS**
   - 规格：**2vCPU 2GiB**
4. 设置密码或 SSH 密钥
5. 点击购买

## 第二步：连接服务器

购买完成后，在控制台找到服务器的**公网 IP**。

```bash
# 用终端连接（Mac/Linux/Windows PowerShell）
ssh root@你的服务器IP

# 或者在控制台网页上点"远程登录"
```

## 第三步：一键部署

连接到服务器后，运行以下命令：

```bash
# 下载并运行初始化脚本
git clone https://github.com/gangchen/rare-disease-community.git /tmp/rdc-setup
chmod +x /tmp/rdc-setup/scripts/setup-server.sh
sudo /tmp/rdc-setup/scripts/setup-server.sh
```

脚本会自动完成：
- 系统更新
- 安装 Node.js 20 + Nginx
- 克隆项目代码
- 安装依赖 + 构建
- 配置 systemd 自启动服务
- 配置 Nginx 反向代理
- 配置防火墙

完成后访问 `http://你的服务器IP` 即可看到网站。

## 第四步：绑定域名（可选）

### 4.1 购买域名

- 腾讯云：https://dnspod.cloud.tencent.com
- 阿里云：https://wanwang.aliyun.com

### 4.2 添加 DNS 解析

在域名管理后台添加一条 A 记录：
- 主机记录：`@`（或 `www`）
- 记录类型：`A`
- 记录值：你的服务器 IP

### 4.3 配置 Nginx 域名

```bash
# SSH 到服务器
ssh root@你的服务器IP

# 编辑 Nginx 配置，把 server_name 改成你的域名
sudo nano /etc/nginx/sites-available/rare-disease-community
# 找到 server_name _; 改成 server_name your-domain.com;

# 重载 Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 4.4 开启 HTTPS（免费 SSL 证书）

```bash
sudo certbot --nginx -d your-domain.com
```

按提示操作，certbot 会自动配置 SSL 并设置自动续期。

## 第五步：备案（国内服务器必须）

如果使用国内服务器 + 域名，需要完成 ICP 备案才能正常访问：

1. 登录云服务商的备案系统
   - 腾讯云：https://console.cloud.tencent.com/beian
   - 阿里云：https://beian.aliyun.com
2. 按提示填写信息，上传资料
3. 等待审核（通常 7-20 个工作日）

> 备案期间，可以先用 IP 地址访问网站。

## 日常运维

```bash
# SSH 到服务器
ssh root@你的服务器IP

# 查看服务状态
sudo systemctl status rare-disease-community

# 查看实时日志
sudo journalctl -u rare-disease-community -f

# 重启服务
sudo systemctl restart rare-disease-community

# 更新代码并重新部署
cd /home/app/rare-disease-community
sudo -u app ./scripts/update.sh

# 重置数据库（清除所有数据！）
cd /home/app/rare-disease-community
sudo -u app node scripts/init-db.js
sudo systemctl restart rare-disease-community

# 查看磁盘/内存使用
df -h
free -h
```

## 数据备份

```bash
# 备份数据库
cp /home/app/rare-disease-community/data/community.db ~/backup-$(date +%Y%m%d).db

# 定时备份（添加到 crontab）
sudo crontab -e
# 添加这行：每天凌晨3点备份
# 0 3 * * * cp /home/app/rare-disease-community/data/community.db /root/backup-$(date +\%Y\%m\%d).db
```

## 架构示意

```
用户浏览器
    ↓
[Nginx :80/:443]  ← SSL 证书、静态文件缓存、Gzip 压缩
    ↓
[Next.js :3000]   ← Node.js 应用（systemd 管理）
    ↓
[SQLite]          ← data/community.db（本地文件数据库）
```
