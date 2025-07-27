# 故障排除指南

## 图片加载问题

### 问题：Next.js Image组件报错 "hostname not configured"

**错误信息示例：**
```
Error: Invalid src prop (https://a4.espncdn.com/combiner/i?img=...) on `next/image`, hostname "a4.espncdn.com" is not configured under images in your `next.config.js`
```

**解决方案：**

1. **自动修复（推荐）**
   ```bash
   npm run fix-image-domains
   ```
   这个脚本会自动检测数据文件中的所有图片域名并更新Next.js配置。

2. **手动修复**
   在 `next.config.js` 文件的 `images.domains` 数组中添加缺失的域名：
   ```javascript
   images: {
     domains: [
       // 现有域名...
       'a4.espncdn.com', // 添加新域名
     ],
   }
   ```

3. **重启开发服务器**
   修改配置后必须重启服务器：
   ```bash
   # 停止当前服务器 (Ctrl+C)
   npm run dev
   ```

### 常见图片域名

- **ESPN**: `a4.espncdn.com`, `a.espncdn.com`, `s.espncdn.com`
- **YouTube**: `i.ytimg.com`, `img.youtube.com`
- **CBS Sports**: `sportshub.cbsistatic.com`, `cdn.cbssports.com`
- **NBC Sports**: `nbcsports.brightspotcdn.com`
- **Times of India**: `static.toiimg.com`
- **Unsplash**: `images.unsplash.com`

## 自动化系统问题

### 启动自动化系统

```bash
# 启动所有自动化功能
npm run automation-start

# 查看系统状态
npm run automation-status

# 停止自动化系统
npm run automation-stop
```

### 手动触发更新

```bash
# 手动更新新闻和视频
npm run automation-update

# 只更新新闻
npm run yang-hansen-news

# 只更新视频
npm run update-videos
```

### 运行系统测试

```bash
# 完整集成测试
npm run integration-test

# 基础功能测试
npm run automation-test
```

## API配额问题

### NewsAPI配额用完

**错误信息：** "NewsAPI日配额已用完"

**解决方案：**
1. 等待第二天配额重置
2. 升级到付费计划
3. 使用多个API密钥轮换

### YouTube API配额用完

**错误信息：** "YouTube API日配额已用完"

**解决方案：**
1. 等待第二天配额重置（每日10,000配额单位）
2. 优化搜索策略，减少API调用
3. 申请配额增加

## 翻译服务问题

### 翻译失败

**常见原因：**
- 网络连接问题
- 翻译API服务不可用
- API密钥配置错误

**解决方案：**
1. 检查网络连接
2. 配置Google Translate API密钥（可选）
3. 系统会自动降级到备用翻译服务

## 数据文件问题

### 数据文件损坏或丢失

**解决方案：**
1. 检查备份文件：`data/backups/`
2. 重新运行数据更新：
   ```bash
   npm run automation-update
   ```
3. 如果问题持续，删除数据文件让系统重新创建

### 数据格式错误

**解决方案：**
1. 验证JSON格式：
   ```bash
   node -e "console.log(JSON.parse(require('fs').readFileSync('data/news.json', 'utf8')))"
   ```
2. 使用备份恢复：
   ```bash
   cp data/backups/news-backup-[最新时间戳].json data/news.json
   ```

## 性能问题

### 页面加载缓慢

**优化建议：**
1. 检查图片大小和格式
2. 启用图片优化：
   ```javascript
   // next.config.js
   images: {
     unoptimized: false, // 确保启用优化
   }
   ```
3. 使用SafeImage组件处理图片加载

### 内存使用过高

**解决方案：**
1. 重启自动化系统：
   ```bash
   npm run automation-stop
   npm run automation-start
   ```
2. 清理缓存和临时文件
3. 检查日志文件大小：`logs/`

## 开发环境问题

### 端口占用

**错误信息：** "Port 3000 is already in use"

**解决方案：**
```bash
# 查找占用端口的进程
lsof -ti:3000

# 杀死进程
kill -9 $(lsof -ti:3000)

# 或使用不同端口
npm run dev -- -p 3001
```

### 环境变量问题

**检查环境变量：**
```bash
# 查看当前环境变量
node -e "console.log(process.env.NEWSAPI_KEY ? '✅ NewsAPI配置' : '❌ NewsAPI未配置')"
node -e "console.log(process.env.YOUTUBE_API_KEY ? '✅ YouTube API配置' : '❌ YouTube API未配置')"
```

**配置环境变量：**
创建 `.env.local` 文件：
```
NEWSAPI_KEY=your_newsapi_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
GOOGLE_TRANSLATE_API_KEY=your_translate_key_here
```

## 获取帮助

### 日志文件位置
- 系统日志：`logs/scheduler.log`
- 集成测试日志：`logs/integration-test.log`
- 自动化状态：`logs/automation-status.json`

### 常用调试命令
```bash
# 检查系统状态
npm run automation-status

# 运行诊断测试
node scripts/test-automation-features.js

# 查看最新日志
tail -f logs/scheduler.log
```

### 重置系统
如果遇到严重问题，可以重置整个系统：
```bash
# 停止所有服务
npm run automation-stop

# 清理数据（可选，会丢失数据）
rm -rf data/*.json
rm -rf logs/*

# 重新启动
npm run automation-start
```

---

如果问题仍然存在，请检查控制台输出和日志文件以获取更详细的错误信息。