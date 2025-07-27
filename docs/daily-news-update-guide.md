# Yang Hansen新闻每日更新指南

## 🎯 概述

本指南提供了多种方式来每天更新Yang Hansen的新闻内容，从最简单的手动更新到完全自动化的定时任务。

## 🚀 方案选择

### 方案1：一键手动更新（推荐新手）

**最简单的方式，适合偶尔更新或测试：**

```bash
# 方式1: 使用npm脚本
npm run daily-update

# 方式2: 直接运行脚本
node scripts/daily-news-update.js
```

**特点：**
- ✅ 操作简单，一条命令搞定
- ✅ 实时查看更新过程
- ✅ 适合测试和调试
- ❌ 需要手动执行

### 方案2：更新并自动部署

**更新新闻数据并自动提交到Git：**

```bash
# 方式1: 使用npm脚本
npm run update-deploy

# 方式2: 直接运行脚本
./scripts/update-and-deploy.sh
```

**特点：**
- ✅ 自动更新数据
- ✅ 自动Git提交和推送
- ✅ 包含数据验证
- ✅ 详细的执行日志
- ❌ 仍需手动执行

### 方案3：完全自动化定时任务（推荐生产环境）

**设置每日自动更新：**

```bash
# 1. 设置定时任务
./scripts/setup-daily-cron.sh

# 2. 按照提示配置crontab
crontab -e

# 3. 添加定时任务（每天早上8点）
0 8 * * * /path/to/your/project/scripts/cron-daily-update.sh
```

**特点：**
- ✅ 完全自动化
- ✅ 无需人工干预
- ✅ 自动记录日志
- ✅ 适合生产环境
- ❌ 需要服务器环境

## 📋 详细操作步骤

### 步骤1：选择更新方式

根据你的需求选择上述三种方案之一。

### 步骤2：执行更新

#### 手动更新示例：
```bash
# 进入项目目录
cd /path/to/yanghanson-website

# 执行更新
npm run daily-update
```

#### 自动部署示例：
```bash
# 进入项目目录
cd /path/to/yanghanson-website

# 执行更新和部署
npm run update-deploy
```

### 步骤3：验证结果

```bash
# 启动开发服务器
npm run dev

# 访问新闻页面
# http://localhost:3000/news
```

## 🔧 配置选项

### 更新频率配置

编辑 `scripts/daily-news-update.js` 中的配置：

```javascript
const pipeline = new NewsDataPipeline({
  relevanceThreshold: 0.4,  // 相关性阈值 (0-1)
  maxArticles: 15,          // 最大文章数量
  timeRange: 7,             // 搜索天数范围
  outputPath: 'data/news.json'
});
```

### 定时任务时间配置

常用的cron时间表达式：

```bash
# 每天早上8点
0 8 * * *

# 每天中午12点
0 12 * * *

# 每天晚上8点
0 20 * * *

# 每12小时
0 */12 * * *

# 每6小时
0 */6 * * *
```

## 📊 监控和日志

### 查看更新日志

```bash
# 查看最新日志
tail -f logs/daily-update.log

# 查看完整日志
cat logs/daily-update.log

# 查看最近10条日志
tail -10 logs/daily-update.log
```

### 检查更新状态

```bash
# 检查数据文件最后修改时间
ls -la data/news.json

# 检查Git提交历史
git log --oneline -5

# 检查新闻数量
node -e "console.log('新闻总数:', require('./data/news.json').articles.length)"
```

## 🛠️ 故障排除

### 常见问题

1. **API配额用完**
   ```bash
   # 检查API使用情况
   node scripts/test-newsapi.js
   ```

2. **网络连接问题**
   ```bash
   # 测试网络连接
   curl -I https://newsapi.org
   ```

3. **权限问题**
   ```bash
   # 设置脚本执行权限
   chmod +x scripts/*.sh
   ```

4. **Git推送失败**
   ```bash
   # 检查Git状态
   git status
   git pull origin main
   ```

### 数据质量检查

```bash
# 运行完整的新闻处理流程（包含详细日志）
npm run yang-hansen-news

# 验证数据完整性
npm run verify-data
```

## 📈 最佳实践

### 1. 定期监控
- 每周检查一次更新日志
- 监控API配额使用情况
- 验证新闻相关性和质量

### 2. 备份策略
- 系统会自动备份到 `data/backups/` 目录
- 建议定期备份整个项目

### 3. 性能优化
- 避免过于频繁的更新（建议每天1-2次）
- 合理设置文章数量限制
- 定期清理旧的备份文件

### 4. 安全考虑
- 保护API密钥安全
- 定期更新依赖包
- 监控异常访问

## 🎉 快速开始

如果你是第一次使用，推荐按以下顺序操作：

```bash
# 1. 测试手动更新
npm run daily-update

# 2. 检查结果
npm run dev
# 访问 http://localhost:3000/news

# 3. 如果满意，设置自动更新
./scripts/setup-daily-cron.sh

# 4. 按提示配置crontab
crontab -e
```

## 📞 支持

如果遇到问题，可以：
1. 查看日志文件 `logs/daily-update.log`
2. 运行测试脚本 `npm run yang-hansen-news`
3. 检查API配额状态
4. 验证网络连接

---

**祝你使用愉快！🏀**