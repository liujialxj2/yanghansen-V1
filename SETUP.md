# 杨瀚森网站 - 快速安装指南

## 🎯 新手友好版安装教程

### 第一步：检查环境
1. **检查Node.js是否已安装**
   ```bash
   node --version
   ```
   如果显示版本号（如 v18.17.0），说明已安装。
   如果提示"命令未找到"，请前往 [nodejs.org](https://nodejs.org) 下载安装。

### 第二步：获取代码
1. **下载项目代码**
   - 如果你有Git：`git clone [项目地址]`
   - 或者直接下载ZIP文件并解压

2. **进入项目目录**
   ```bash
   cd yang-hansen-website
   ```

### 第三步：一键启动
1. **使用启动脚本（推荐）**
   ```bash
   ./start.sh
   ```
   
2. **或者手动启动**
   ```bash
   npm install
   npm run dev
   ```

### 第四步：查看网站
打开浏览器访问：http://localhost:3000

## 🚀 部署到Vercel（免费）

### 方法一：GitHub + Vercel（推荐）
1. 将代码上传到GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 点击"New Project"
4. 选择你的GitHub仓库
5. 点击"Deploy" - 完成！

### 方法二：Vercel CLI
```bash
npm i -g vercel
vercel
```

## 📝 内容更新指南

### 更新球员信息
编辑 `data/player.json` 文件：
```json
{
  "basicInfo": {
    "name": "杨瀚森",
    "height": "7'3\"",
    "weight": "280 lbs"
  }
}
```

### 更新统计数据
编辑 `data/stats.json` 文件：
```json
{
  "currentSeason": {
    "averages": {
      "points": 8.2,
      "rebounds": 6.8
    }
  }
}
```

### 添加新照片
1. 将照片放入 `public/images/` 目录
2. 在相应页面组件中更新图片路径

## 🔧 常见问题解决

### Q: 启动时提示端口被占用
```bash
# 使用其他端口启动
npm run dev -- -p 3001
```

### Q: 安装依赖失败
```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### Q: 图片不显示
- 检查图片路径是否正确
- 确保图片文件存在于 `public/` 目录

### Q: 样式不生效
```bash
# 重新构建CSS
npm run build
npm run dev
```

## 📱 移动端测试
在手机上访问：http://[你的电脑IP]:3000

查看电脑IP：
```bash
# macOS/Linux
ifconfig | grep inet
# Windows
ipconfig
```

## 🎨 自定义主题色彩
编辑 `tailwind.config.js`：
```javascript
colors: {
  blazers: {
    red: '#CE1141',  // 修改这里
    black: '#1D1D1D'
  }
}
```

## 📊 性能优化建议
1. **图片优化**：使用WebP格式
2. **代码分割**：已自动配置
3. **CDN加速**：Vercel自动提供

## 🆘 获取帮助
- 查看 `README.md` 了解更多技术细节
- 检查浏览器控制台的错误信息
- 确保所有文件路径正确

---
**🏀 祝你成功搭建杨瀚森的个人网站！**