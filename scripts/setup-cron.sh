#!/bin/bash

# 自动数据更新设置脚本

echo "=== 杨瀚森个人网站数据更新设置 ==="
echo ""

# 获取项目路径
PROJECT_PATH=$(pwd)
SCRIPT_PATH="$PROJECT_PATH/scripts/update-all-data.js"

echo "项目路径: $PROJECT_PATH"
echo "更新脚本: $SCRIPT_PATH"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

echo "✓ Node.js 和 npm 已安装"

# 安装依赖
echo ""
echo "正在安装依赖包..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ 依赖包安装成功"
else
    echo "❌ 依赖包安装失败"
    exit 1
fi

# 测试数据更新脚本
echo ""
echo "正在测试数据更新脚本..."
node "$SCRIPT_PATH"

if [ $? -eq 0 ]; then
    echo "✓ 数据更新脚本测试成功"
else
    echo "❌ 数据更新脚本测试失败"
    exit 1
fi

# 创建定时任务
echo ""
echo "设置定时任务选项:"
echo "1. 每小时更新一次"
echo "2. 每6小时更新一次"
echo "3. 每天更新一次"
echo "4. 手动运行（不设置定时任务）"
echo ""

read -p "请选择 (1-4): " choice

case $choice in
    1)
        CRON_SCHEDULE="0 * * * *"
        DESCRIPTION="每小时"
        ;;
    2)
        CRON_SCHEDULE="0 */6 * * *"
        DESCRIPTION="每6小时"
        ;;
    3)
        CRON_SCHEDULE="0 2 * * *"
        DESCRIPTION="每天凌晨2点"
        ;;
    4)
        echo ""
        echo "✓ 设置完成！"
        echo ""
        echo "手动更新命令:"
        echo "  npm run update-data    # 更新所有数据"
        echo "  npm run update-news    # 只更新新闻"
        echo "  npm run update-media   # 只更新媒体"
        echo ""
        exit 0
        ;;
    *)
        echo "无效选择，退出设置"
        exit 1
        ;;
esac

# 添加到crontab
CRON_COMMAND="cd $PROJECT_PATH && /usr/local/bin/node $SCRIPT_PATH >> $PROJECT_PATH/logs/update.log 2>&1"
CRON_ENTRY="$CRON_SCHEDULE $CRON_COMMAND"

# 创建日志目录
mkdir -p "$PROJECT_PATH/logs"

# 检查是否已存在相同的定时任务
if crontab -l 2>/dev/null | grep -q "$SCRIPT_PATH"; then
    echo ""
    echo "⚠️  检测到已存在的定时任务，是否替换？(y/n)"
    read -p "请选择: " replace
    
    if [[ $replace == "y" || $replace == "Y" ]]; then
        # 删除旧的定时任务
        crontab -l 2>/dev/null | grep -v "$SCRIPT_PATH" | crontab -
        echo "✓ 已删除旧的定时任务"
    else
        echo "取消设置"
        exit 0
    fi
fi

# 添加新的定时任务
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ 定时任务设置成功！"
    echo ""
    echo "定时任务详情:"
    echo "  频率: $DESCRIPTION"
    echo "  命令: $CRON_COMMAND"
    echo "  日志: $PROJECT_PATH/logs/update.log"
    echo ""
    echo "查看定时任务: crontab -l"
    echo "删除定时任务: crontab -e (然后删除相关行)"
    echo ""
    echo "手动更新命令:"
    echo "  npm run update-data    # 更新所有数据"
    echo "  npm run update-news    # 只更新新闻"
    echo "  npm run update-media   # 只更新媒体"
else
    echo "❌ 定时任务设置失败"
    exit 1
fi

echo ""
echo "=== 设置完成 ==="