# 数据源配置说明

## RSS 新闻源

### 已配置的新闻源
1. **新浪体育篮球频道**
   - URL: `https://sports.sina.com.cn/rss/basketball.xml`
   - 类型: 中文篮球新闻
   - 更新频率: 实时

2. **腾讯体育**
   - URL: `https://sports.qq.com/rss_newsgame.xml`
   - 类型: 综合体育资讯
   - 更新频率: 实时

3. **虎扑NBA**
   - URL: `https://voice.hupu.com/nba/rss.xml`
   - 类型: NBA专业资讯
   - 更新频率: 实时

4. **ESPN**
   - URL: `https://www.espn.com/espn/rss/news`
   - 类型: 国际体育新闻
   - 更新频率: 实时

### 内容过滤
- 自动筛选篮球相关内容
- 关键词包括：篮球、NBA、CBA、球员、比赛等
- 过滤掉非体育相关内容

## 媒体数据源

### 图片来源
1. **Pixabay API**
   - 免费高质量体育图片
   - 关键词：basketball, sports, athlete, training
   - 自动获取800px以上高清图片

2. **Unsplash**
   - 专业体育摄影作品
   - 用作默认图片和缩略图

### 视频数据
- 基于真实体育视频模板生成
- 包含：精彩集锦、训练视频、专访内容
- 自动生成合理的时长和观看数据

## 数据更新机制

### 自动更新
- 支持定时任务（cron）
- 可选频率：每小时、每6小时、每天
- 自动日志记录

### 手动更新
```bash
npm run update-data    # 更新所有数据
npm run update-news    # 只更新新闻
npm run update-media   # 只更新媒体
```

### 数据备份
- 更新前自动备份原数据
- 失败时可回滚到之前版本

## 数据质量保证

### 内容验证
- 自动检查数据完整性
- 过滤重复内容
- 验证图片链接有效性

### 错误处理
- 网络请求失败重试机制
- 单个源失败不影响其他源
- 详细错误日志记录

## 扩展新数据源

### 添加新RSS源
在 `scripts/fetch-news.js` 中的 `RSS_SOURCES` 数组添加：
```javascript
{
  url: 'RSS_URL',
  name: '源名称',
  category: '分类'
}
```

### 添加新图片API
在 `scripts/fetch-media.js` 中扩展 `MEDIA_SOURCES` 配置

## 注意事项

1. **API限制**
   - 免费API有请求频率限制
   - 建议不要过于频繁更新

2. **内容合规**
   - 所有内容来源均为公开RSS源
   - 遵守各网站的使用条款

3. **存储空间**
   - 图片使用外链，不占用本地空间
   - JSON文件大小控制在合理范围

4. **网络依赖**
   - 需要稳定的网络连接
   - 建议在服务器环境运行定时任务