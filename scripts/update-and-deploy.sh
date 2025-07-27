#!/bin/bash

# Yang Hansen新闻更新和部署脚本
# 用于每日自动更新新闻并部署到网站

echo "🚀 开始Yang Hansen新闻更新和部署流程..."

# 设置错误时退出
set -e

# 记录开始时间
START_TIME=$(date)
echo "开始时间: $START_TIME"

# 1. 更新新闻数据
echo ""
echo "📰 步骤1: 更新新闻数据..."
node scripts/daily-news-update.js

# 检查更新是否成功
if [ $? -eq 0 ]; then
    echo "✅ 新闻数据更新成功"
else
    echo "❌ 新闻数据更新失败"
    exit 1
fi

# 2. 检查数据文件
echo ""
echo "🔍 步骤2: 验证数据文件..."
if [ -f "data/news.json" ]; then
    echo "✅ news.json 文件存在"
    # 检查文件大小
    FILE_SIZE=$(wc -c < "data/news.json")
    if [ $FILE_SIZE -gt 1000 ]; then
        echo "✅ 数据文件大小正常 ($FILE_SIZE bytes)"
    else
        echo "⚠️  数据文件可能过小，请检查"
    fi
else
    echo "❌ news.json 文件不存在"
    exit 1
fi

# 3. Git提交更新
echo ""
echo "📝 步骤3: 提交更新到Git..."
git add data/news.json

# 检查是否有变更
if git diff --staged --quiet; then
    echo "ℹ️  没有新的更新需要提交"
else
    # 生成提交信息
    COMMIT_MSG="自动更新Yang Hansen新闻数据 - $(date '+%Y-%m-%d %H:%M')"
    git commit -m "$COMMIT_MSG"
    echo "✅ 已提交更新: $COMMIT_MSG"
    
    # 4. 推送到远程仓库
    echo ""
    echo "🔄 步骤4: 推送到远程仓库..."
    git push origin main
    echo "✅ 已推送到远程仓库"
fi

# 5. 显示完成信息
echo ""
echo "🎉 更新和部署流程完成！"
echo "开始时间: $START_TIME"
echo "结束时间: $(date)"

# 6. 显示网站访问信息
echo ""
echo "🌐 网站访问信息:"
echo "   - 本地开发: http://localhost:3000/news"
echo "   - 生产环境: 请检查您的部署平台"

echo ""
echo "📋 后续操作建议:"
echo "   1. 访问网站检查新闻显示是否正常"
echo "   2. 检查新闻详情页是否可以正常访问"
echo "   3. 确认外链跳转功能正常工作"