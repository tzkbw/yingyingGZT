#!/bin/bash
# GitHub 部署脚本
# 用法：export GITHUB_TOKEN=你的token && ./deploy.sh

set -e

OWNER="${OWNER:-tzkbw}"
REPO="${REPO:-yingyingGZT}"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "请先设置 GITHUB_TOKEN 环境变量"
  echo "获取方式：github.com/settings/tokens -> Generate new token (classic) -> 勾选 repo"
  exit 1
fi

echo "正在创建仓库 $OWNER/$REPO ..."
curl -s -X POST -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO\",\"description\":\"莹莹的工作台 - PWA\",\"private\":false}" | grep -E '"name"|"html_url"' | head -5

# 设置远程仓库并推送
git remote add origin "https://oauth2:${GITHUB_TOKEN}@github.com/${OWNER}/${REPO}.git" 2>/dev/null || true
git branch -M main
git push -u origin main

echo "正在开启 GitHub Pages ..."
curl -s -X PUT -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${OWNER}/${REPO}/pages" \
  -d '{"source":{"branch":"main","path":"/"}}' | head -c 200

echo ""
echo "部署完成！几分钟后访问：https://${OWNER}.github.io/${REPO}/"
