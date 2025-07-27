# 方案二：渐进式修复方案

## 核心策略
在现有架构基础上，逐步修复问题，最小化风险

## 实施步骤

### 1. 修复Layout默认语言
```tsx
// app/layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 服务端默认英文，客户端检测后切换
  const locale = 'en' // 改为默认英文
  const messages = (await import(`../messages/${locale}.json`)).default
  
  return (
    <html lang={locale}>
      <body>
        <LocaleProvider messages={messages} locale={locale}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
```

### 2. 创建数据过滤中间件
```tsx
// lib/data-filter.ts
export function filterChineseContent(data: any, locale: string): any {
  if (locale === 'en') {
    return deepClone(data, (key, value) => {
      if (typeof value === 'string' && containsChinese(value)) {
        return getEnglishTranslation(key, value) || '[EN]'
      }
      return value
    })
  }
  return data
}

function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text)
}

// hooks/useSafeData.ts
export function useSafeData(data: any) {
  const locale = useLocale()
  return useMemo(() => filterChineseContent(data, locale), [data, locale])
}
```

### 3. 批量修复组件
```tsx
// 创建自动修复脚本
// scripts/auto-fix-components.js
const fs = require('fs')
const path = require('path')

function fixComponent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  
  // 自动替换常见中文文本
  const replacements = [
    { search: /加载中\.\.\./g, replace: '{t("loading")}' },
    { search: /更多/g, replace: '{t("more")}' },
    { search: /查看全部/g, replace: '{t("viewAll")}' },
    // ... 更多替换规则
  ]
  
  replacements.forEach(({search, replace}) => {
    content = content.replace(search, replace)
  })
  
  fs.writeFileSync(filePath, content)
}
```

### 4. 创建运行时检查器
```tsx
// components/ChineseDetector.tsx
export function ChineseDetector({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  
  useEffect(() => {
    if (locale === 'en' && process.env.NODE_ENV === 'development') {
      // 检查DOM中是否有中文字符
      const checkChinese = () => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT
        )
        
        let node
        while (node = walker.nextNode()) {
          if (/[\u4e00-\u9fff]/.test(node.textContent)) {
            console.warn('Chinese text detected in English mode:', node.textContent)
          }
        }
      }
      
      setTimeout(checkChinese, 1000)
    }
  }, [locale])
  
  return <>{children}</>
}
```

### 5. 分阶段修复页面
```tsx
// 第一阶段：修复关键页面（首页、关于）
// 第二阶段：修复次要页面（新闻、视频）
// 第三阶段：修复详情页面

// 每个页面添加安全检查
export default function SafePage() {
  const locale = useLocale()
  const playerData = useSafeData(originalPlayerData)
  
  return (
    <ChineseDetector>
      <PageContent data={playerData} />
    </ChineseDetector>
  )
}
```

## 优势
- ✅ 风险可控，逐步修复
- ✅ 工作量适中，1周内完成
- ✅ 保持现有功能稳定
- ✅ 有运行时检查保障

## 劣势
- ❌ 可能存在遗漏
- ❌ 代码复杂度增加
- ❌ 需要维护过滤逻辑

## 适用场景
- 时间紧迫的项目
- 需要快速修复
- 团队规模中等