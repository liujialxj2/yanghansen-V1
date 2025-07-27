# 国际化使用指南

## 概述

本项目使用 next-intl 实现国际化功能，支持中文（zh）和英文（en）两种语言。

## 基本使用

### 在组件中使用翻译

```tsx
'use client'

import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('MyNamespace')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}
```

### 获取当前语言

```tsx
import { useLocale } from 'next-intl'

export function MyComponent() {
  const locale = useLocale()
  
  return <div>当前语言: {locale}</div>
}
```

### 切换语言

```tsx
import { useLocaleSwitch } from '@/components/LocaleProvider'

export function MyComponent() {
  const { changeLocale } = useLocaleSwitch()
  
  const handleSwitch = () => {
    changeLocale(locale === 'zh' ? 'en' : 'zh')
  }
  
  return <button onClick={handleSwitch}>切换语言</button>
}
```

## 翻译文件结构

翻译文件位于 `messages/` 目录：

```
messages/
├── zh.json  # 中文翻译
└── en.json  # 英文翻译
```

### 翻译文件格式

```json
{
  "Navigation": {
    "home": "首页",
    "about": "关于"
  },
  "Common": {
    "loading": "加载中...",
    "error": "出错了"
  }
}
```

## 添加新翻译

1. 在 `messages/zh.json` 中添加中文翻译
2. 在 `messages/en.json` 中添加对应的英文翻译
3. 在组件中使用 `useTranslations` Hook

示例：

```json
// messages/zh.json
{
  "MyPage": {
    "newKey": "新的翻译内容"
  }
}

// messages/en.json  
{
  "MyPage": {
    "newKey": "New translation content"
  }
}
```

```tsx
// 在组件中使用
const t = useTranslations('MyPage')
return <span>{t('newKey')}</span>
```

## 命名空间规范

- `Navigation`: 导航相关翻译
- `Common`: 通用翻译（按钮、状态等）
- `HomePage`: 首页专用翻译
- `AboutPage`: 关于页面专用翻译
- `NewsPage`: 新闻页面专用翻译
- `StatsPage`: 数据页面专用翻译
- `VideosPage`: 视频页面专用翻译
- `Footer`: 页脚翻译

## 最佳实践

1. **命名规范**: 使用驼峰命名法，语义清晰
2. **命名空间**: 按页面或功能模块组织翻译
3. **后备处理**: 翻译缺失时会显示翻译键，不会导致页面崩溃
4. **类型安全**: 使用 TypeScript 确保翻译键的正确性

## 测试翻译

运行测试脚本检查翻译完整性：

```bash
node scripts/test-i18n-functionality.js
```

## 故障排除

### 翻译不显示
1. 检查翻译文件是否存在对应的键
2. 确认组件使用了正确的命名空间
3. 检查 JSON 文件格式是否正确

### 语言切换不生效
1. 确认 LocaleProvider 已正确包装应用
2. 检查浏览器控制台是否有错误
3. 清除浏览器缓存和 localStorage

### 构建错误
1. 检查所有翻译文件的 JSON 格式
2. 确认所有使用的翻译键都存在
3. 运行 `npm run build` 查看详细错误信息

## 支持的功能

- ✅ 客户端语言切换
- ✅ 语言偏好持久化（localStorage + Cookie）
- ✅ 服务端渲染支持
- ✅ 翻译缺失时优雅降级
- ✅ TypeScript 类型支持
- ✅ 热重载支持

## 技术架构

- **next-intl**: 国际化核心库
- **LocaleProvider**: 自定义语言状态管理
- **LanguageSwitcher**: 语言切换组件
- **非路由模式**: 不影响现有 URL 结构