# 杨瀚森个人网站 | Yang Hansen Official Website

这是为NBA波特兰开拓者队中锋杨瀚森打造的官方个人网站。

## 🚀 快速开始

### 环境要求
- Node.js 18+ (推荐使用最新LTS版本)
- npm (Node.js自带)

### 安装和运行

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **打开浏览器**
访问 [http://localhost:3000](http://localhost:3000)

### 构建和部署

1. **构建生产版本**
```bash
npm run build
```

2. **本地预览生产版本**
```bash
npm run start
```

3. **部署到Vercel**
- 将代码推送到GitHub
- 在Vercel中连接GitHub仓库
- 自动部署完成

## 📁 项目结构

```
yang-hansen-website/
├── app/                    # Next.js App Router页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   ├── Navigation.tsx    # 导航栏
│   └── Footer.tsx        # 页脚
├── data/                 # 数据文件
│   ├── player.json       # 球员信息
│   └── stats.json        # 统计数据
├── lib/                  # 工具函数
│   └── utils.ts          # 通用工具
└── public/               # 静态文件
```

## 🎨 技术栈

- **框架**: Next.js 14 (React)
- **样式**: Tailwind CSS
- **组件**: shadcn/ui
- **语言**: TypeScript
- **部署**: Vercel

## 📝 内容管理

### 更新球员信息
编辑 `data/player.json` 文件来更新：
- 基本信息
- 个人简介
- 职业生涯时间线
- 个人生活信息

### 更新统计数据
编辑 `data/stats.json` 文件来更新：
- 本赛季数据
- 最近比赛记录
- 职业生涯里程碑

### 添加新页面
在 `app/` 目录下创建新的文件夹和 `page.tsx` 文件

## 🌐 多语言支持

网站目前支持中英双语显示，后续版本将添加完整的国际化支持。

## 📱 响应式设计

网站完全适配：
- 桌面端 (1920px+)
- 平板端 (768px-1024px)
- 移动端 (375px-768px)

## 🔧 自定义配置

### 修改主题色彩
在 `tailwind.config.js` 中修改 `blazers` 颜色配置

### 添加新的UI组件
使用shadcn/ui CLI添加新组件：
```bash
npx shadcn-ui@latest add [component-name]
```

## 📈 性能优化

- 图片自动优化 (Next.js Image组件)
- 代码分割和懒加载
- CSS优化和压缩
- 静态生成 (SSG)

## 🚀 部署说明

### Vercel部署 (推荐)
1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 自动部署完成

### 其他平台部署
- Netlify: 支持
- AWS Amplify: 支持
- 自建服务器: 需要Node.js环境

## 🔄 更新日志

### v1.0.0 (MVP版本)
- ✅ 基础页面结构
- ✅ 球员档案展示
- ✅ 数据统计显示
- ✅ 响应式设计
- ✅ 开拓者队主题色彩

### 计划中的功能 (v2.0.0)
- 🔄 媒体中心页面
- 🔄 新闻资讯页面
- 🔄 球迷互动功能
- 🔄 多语言完整支持
- 🔄 自动数据更新

## 🆘 常见问题

### Q: 如何更新球员照片？
A: 将新照片放入 `public/images/` 目录，然后在相应组件中更新图片路径。

### Q: 如何修改网站标题和描述？
A: 编辑 `app/layout.tsx` 中的 `metadata` 对象。

### Q: 如何添加新的统计数据？
A: 在 `data/stats.json` 中添加新的数据字段，然后在相应页面组件中显示。

### Q: 网站加载慢怎么办？
A: 检查图片大小，使用WebP格式，启用Vercel的Edge Network加速。

## 📞 技术支持

如果遇到技术问题，请检查：
1. Node.js版本是否为18+
2. 依赖是否正确安装
3. 端口3000是否被占用

## 📄 许可证

本项目仅用于杨瀚森个人网站，请勿用于商业用途。

---

**Made with ❤️ for Yang Hansen**