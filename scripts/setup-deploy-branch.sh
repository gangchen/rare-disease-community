#!/bin/bash
# 创建 deploy 分支并推送
# 使用方法: bash scripts/setup-deploy-branch.sh

set -e

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "=== 创建部署分支 ==="

# 创建 deploy 分支（基于当前分支）
git checkout -b deploy 2>/dev/null || git checkout deploy

# 合并当前开发分支的最新代码
git merge "$CURRENT_BRANCH" --no-edit

# 推送 deploy 分支
git push -u origin deploy

echo ""
echo "✓ deploy 分支已创建并推送"
echo ""
echo "=== 后续工作流 ==="
echo "1. 在开发分支上开发和测试"
echo "2. 准备好部署时，执行："
echo "   git checkout deploy"
echo "   git merge $CURRENT_BRANCH"
echo "   git push origin deploy    # 这会自动触发服务器部署"
echo "3. 回到开发分支继续开发："
echo "   git checkout $CURRENT_BRANCH"
echo ""

# 切回开发分支
git checkout "$CURRENT_BRANCH"
