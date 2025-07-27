# 方案三：强制英文模式方案

## 核心策略
暂时移除中文支持，强制网站只支持英文，确保零中文显示

## 实施步骤

### 1. 强制英文配置
```tsx
// next-intl.config.js
export const locales = ['en'] // 只支持英文
export const defaultLocale = 'en'

// app/layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = 'en' // 强制英文
  const messages = (await import(`../messages/en.json`)).default
  
  return (
    <html lang="en">
      <body>
        <NextIntlClientProvider locale="en" messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### 2. 创建英文数据映射
```tsx
// lib/english-data-mapper.ts
const CHINESE_TO_ENGLISH_MAP = {
  '杨瀚森': 'Yang Hansen',
  '中锋': 'Center',
  '波特兰开拓者': 'Portland Trail Blazers',
  '场均得分': 'PPG',
  '场均篮板': 'RPG',
  '场均盖帽': 'BPG',
  // ... 完整映射表
}

export function mapToEnglish(data: any): any {
  return JSON.parse(
    JSON.stringify(data).replace(
      /[\u4e00-\u9fff]+/g,
      (match) => CHINESE_TO_ENGLISH_MAP[match] || `[${match}]`
    )
  )
}

// hooks/useEnglishData.ts
export function useEnglishData(originalData: any) {
  return useMemo(() => mapToEnglish(originalData), [originalData])
}
```

### 3. 移除语言切换器
```tsx
// components/Navigation.tsx
export function Navigation() {
  return (
    <nav>
      {/* 移除 LanguageSwitcher */}
      <div className="nav-items">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/stats">Stats</Link>
        <Link href="/videos">Videos</Link>
        <Link href="/news">News</Link>
      </div>
    </nav>
  )
}
```

### 4. 批量替换所有组件
```tsx
// scripts/force-english.js
const fs = require('fs')
const glob = require('glob')

const REPLACEMENTS = {
  '杨瀚森': 'Yang Hansen',
  '关于': 'About',
  '数据': 'Stats',
  '视频': 'Videos',
  '新闻': 'News',
  '首页': 'Home',
  '加载中...': 'Loading...',
  '更多': 'More',
  '查看全部': 'View All',
  // ... 完整替换表
}

function forceEnglish() {
  const files = glob.sync('**/*.{tsx,ts,jsx,js}', {
    ignore: ['node_modules/**', '.next/**']
  })
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8')
    
    Object.entries(REPLACEMENTS).forEach(([chinese, english]) => {
      content = content.replace(new RegExp(chinese, 'g'), english)
    })
    
    fs.writeFileSync(file, content)
  })
}

forceEnglish()
```

### 5. 创建英文专用组件
```tsx
// components/EnglishOnlyText.tsx
interface Props {
  chinese: string
  english: string
}

export function EnglishOnlyText({ english }: Props) {
  return <>{english}</>
}

// 使用方式
<EnglishOnlyText 
  chinese="杨瀚森" 
  english="Yang Hansen" 
/>
```

### 6. 数据文件英文化
```json
// data/player-english-only.json
{
  "basicInfo": {
    "name": "Yang Hansen",
    "englishName": "Yang Hansen",
    "position": "Center",
    "team": "Portland Trail Blazers",
    "birthPlace": "Zibo, Shandong Province, China"
  },
  "biography": {
    "story": "Yang Hansen is a young center from Zibo, Shandong, China...",
    "background": "Yang Hansen was born in Zibo, Shandong Province...",
    "journey": "Yang Hansen excelled in youth basketball..."
  }
}
```

### 7. 严格验证脚本
```tsx
// scripts/validate-english-only.js
function validateEnglishOnly() {
  const files = glob.sync('**/*.{tsx,ts,jsx,js,json}', {
    ignore: ['node_modules/**', '.next/**', 'messages/zh.json']
  })
  
  let hasChineseChars = false
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8')
    if (/[\u4e00-\u9fff]/.test(content)) {
      console.error(`Chinese characters found in: ${file}`)
      hasChineseChars = true
    }
  })
  
  if (hasChineseChars) {
    process.exit(1)
  } else {
    console.log('✅ No Chinese characters found!')
  }
}
```

## 优势
- ✅ 最快速的解决方案，2-3天完成
- ✅ 100%保证无中文字符
- ✅ 实现简单，风险最低
- ✅ 易于验证和测试

## 劣势
- ❌ 失去多语言支持
- ❌ 用户体验下降（中文用户）
- ❌ 未来扩展性差
- ❌ 可能需要重新添加中文支持

## 适用场景
- 紧急修复需求
- 主要面向英文用户
- 短期解决方案
- 技术债务可接受