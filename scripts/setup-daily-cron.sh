#!/bin/bash

# 设置Yang Hansen新闻每日自动更新定时任务

echo "🕐 设置Yang Hansen新闻每日自动更新..."

# 获取当前项目路径
PROJECT_PATH=$(pwd)
echo "项目路径: $PROJECT_PATH"

# 创建日志目录
mkdir -p logs

# 创建cron任务脚本
cat > scripts/cron-daily-update.sh << EOF
#!/bin/bash
# Yang Hansen新闻每日自动更新任务
# 由cron调用

cd "$PROJECT_PATH"
echo "\$(date): 开始每日新闻更新" >> logs/daily-update.log
npm run update-deploy >> logs/daily-update.log 2>&1
echo "\$(date): 每日新闻更新完成" >> logs/daily-update.log
echo "---" >> logs/daily-update.log
EOF

# 设置执行权限
chmod +x scripts/cron-daily-update.sh

# 显示cron配置建议
echo ""
echo "✅ 定时任务脚本已创建！"
echo ""
echo "📋 设置步骤:"
echo "1. 运行以下命令编辑crontab:"
echo "   crontab -e"
echo ""
echo "2. 添加以下行到crontab文件中:"
echo "   # Yang Hansen新闻每日更新 (每天早上8点)"
echo "   0 8 * * * $PROJECT_PATH/scripts/cron-daily-update.sh"
echo ""
echo "3. 保存并退出编辑器"
echo ""
echo "📝 其他时间选项:"
echo "   - 每天早上6点: 0 6 * * *"
echo "   - 每天中午12点: 0 12 * * *"
echo "   - 每天晚上8点: 0 20 * * *"
echo "   - 每12小时: 0 */12 * * *"
echo ""
echo "📊 查看日志:"
echo "   tail -f logs/daily-update.log"
echo ""
echo "🧪 测试运行:"
echo "   ./scripts/cron-daily-update.sh"