# 网站国际化设计文档

## 设计概述

基于项目历史和需求分析，采用 **next-intl** 作为国际化解决方案，但采用**非路由模式**实现，避免对现有路由结构的任何影响。通过精心设计的配置和实现策略，确保现有功能完全不受影响。

## 核心设计原则

1. **零路由改动**：不使用 next-intl 的路由功能，保持现有 URL 结构完全不变
2. **服务端兼容**：支持 SSR 和 SSG，确保 SEO 效果
3. **渐进式集成**：可以逐个组件添加翻译支持，不影响未翻译的组件
4. **优雅降级**：翻译缺失时显示原文，确保功能正常
5. **配置简化**：最小化配置，避免复杂的中间件和路由重写

## 架构设计

### 1. next-intl 非路由模式架构

```
┌─────────────────────────────────────┐
│           App Layout                │
│  ┌─────────────────────────────┐   │
│  │    NextIntlClientProvider   │   │
│  │  ┌─────────────────────┐   │   │
│  │  │   Locale Detection  │   │   │
│  │  │   - Browser Lang    │   │   │
│  │  │   - localStorage    │   │   │
│  │  │   - Cookie          │   │   │
│  │  └─────────────────────┘   │   │
│  │  ┌─────────────────────┐   │   │
│  │  │   Translation API   │   │   │
│  │  │   - useTranslations │   │   │
│  │  │   - useLocale       │   │   │
│  │  │   - useFormatter    │   │   │
│  │  └─────────────────────┘   │   │
│  └─────────────────────────────┘   │
│              │                     │
│              ▼                     │
│  ┌─────────────────────────────┐   │
│  │      Components             │   │
│  │  - Navigation (翻译)        │   │
│  │  - Footer (翻译)            │   │
│  │  - Pages (渐进式翻译)       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 2. 关键技术决策

**避免路由重构的策略：**
- 不使用 `[locale]` 动态路由段
- 不配置 `middleware.ts` 进行路由重写
- 通过客户端状态管理语言切换
- 使用 Cookie 和 localStorage 持久化语言偏好

### 3. next-intl 配置结构

```typescript
// next-intl.config.js
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// 支持的语言列表
export const locales = ['zh', 'en'];
export const defaultLocale = 'zh';

export default getRequestConfig(async ({locale}) => {
  // 验证语言是否支持
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

```json
// messages/zh.json
{
  "Navigation": {
    "home": "首页",
    "about": "关于", 
    "stats": "数据",
    "videos": "视频",
    "news": "新闻"
  },
  "Common": {
    "loading": "加载中...",
    "error": "出错了",
    "retry": "重试",
    "readMore": "阅读更多"
  },
  "HomePage": {
    "heroTitle": "杨瀚森",
    "heroSubtitle": "中国NBA球员的新星",
    "aboutMe": "了解更多",
    "viewStats": "查看数据"
  }
}
```

```json
// messages/en.json  
{
  "Navigation": {
    "home": "Home",
    "about": "About",
    "stats": "Stats", 
    "videos": "Videos",
    "news": "News"
  },
  "Common": {
    "loading": "Loading...",
    "error": "Error occurred",
    "retry": "Retry",
    "readMore": "Read More"
  },
  "HomePage": {
    "heroTitle": "Yang Hansen",
    "heroSubtitle": "Rising Star of Chinese NBA Players",
    "aboutMe": "About Me",
    "viewStats": "View Stats"
  }
}
```

## 组件设计

### 1. LocaleProvider 组件

**职责：**
- 包装 next-intl 的 NextIntlClientProvider
- 管理客户端语言状态
- 处理语言切换和持久化
- 提供语言检测逻辑

**实现：**
```typescript
'use client'

import {NextIntlClientProvider} from 'next-intl';
import {useState, useEffect} from 'react';

interface LocaleProviderProps {
  children: React.ReactNode;
  messages: any;
  locale: string;
}

export function LocaleProvider({children, messages, locale: initialLocale}: LocaleProviderProps) {
  const [locale, setLocale] = useState(initialLocale);
  const [currentMessages, setCurrentMessages] = useState(messages);

  // 语言切换逻辑
  const changeLocale = async (newLocale: string) => {
    // 动态加载新语言的翻译文件
    const newMessages = await import(`../messages/${newLocale}.json`);
    setCurrentMessages(newMessages.default);
    setLocale(newLocale);
    
    // 持久化到 localStorage 和 Cookie
    localStorage.setItem('locale', newLocale);
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
    document.documentElement.lang = newLocale;
  };

  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={currentMessages}
      onError={() => {}} // 优雅处理翻译错误
    >
      <LocaleContext.Provider value={{locale, changeLocale}}>
        {children}
      </LocaleContext.Provider>
    </NextIntlClientProvider>
  );
}
```

### 2. useLocaleSwitch Hook

**职责：**
- 提供语言切换功能
- 简化组件中的语言操作

**使用示例：**
```typescript
import {useTranslations, useLocale} from 'next-intl';
import {useLocaleSwitch} from '@/hooks/useLocaleSwitch';

function MyComponent() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const {changeLocale} = useLocaleSwitch();
  
  return (
    <div>
      <span>{t('home')}</span>
      <button onClick={() => changeLocale(locale === 'zh' ? 'en' : 'zh')}>
        {locale === 'zh' ? 'EN' : '中文'}
      </button>
    </div>
  );
}
```

### 3. LanguageSwitcher 组件

**职责：**
- 提供语言切换UI
- 显示当前语言状态
- 集成到导航栏中

**实现：**
```typescript
'use client'

import {useLocale} from 'next-intl';
import {useLocaleSwitch} from '@/hooks/useLocaleSwitch';
import {Button} from '@/components/ui/button';

export function LanguageSwitcher() {
  const locale = useLocale();
  const {changeLocale} = useLocaleSwitch();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => changeLocale(locale === 'zh' ? 'en' : 'zh')}
      className="text-gray-700 hover:text-blazers-red"
    >
      {locale === 'zh' ? 'EN' : '中文'}
    </Button>
  );
}
```

## 实现策略

### 阶段 1：next-intl 基础配置
1. 安装 next-intl 依赖
2. 创建 next-intl 配置文件
3. 创建翻译消息文件结构
4. 配置 TypeScript 类型支持

### 阶段 2：Layout 层集成
1. 修改 app/layout.tsx 集成 LocaleProvider
2. 实现语言检测和初始化逻辑
3. 添加客户端语言切换功能
4. 测试基础框架功能

### 阶段 3：导航组件国际化
1. 修改 Navigation 组件使用 useTranslations
2. 添加 LanguageSwitcher 组件
3. 测试语言切换的即时响应
4. 验证持久化功能

### 阶段 4：页面内容渐进式翻译
1. 从首页开始逐个页面添加翻译
2. 处理静态文本和动态内容
3. 实现翻译缺失时的优雅降级
4. 测试每个页面的翻译效果

### 阶段 5：SEO 和元数据优化
1. 动态更新页面 title 和 meta 标签
2. 设置正确的 HTML lang 属性
3. 添加 hreflang 标签支持
4. 测试搜索引擎优化效果

## 数据流设计

### 语言切换流程
```
用户点击语言按钮
       ↓
调用 changeLocale(newLocale)
       ↓
动态加载新语言翻译文件
       ↓
更新 NextIntlClientProvider 状态
       ↓
保存到 localStorage 和 Cookie
       ↓
更新 HTML lang 属性
       ↓
触发所有使用翻译的组件重新渲染
       ↓
使用新语言显示内容
```

### 翻译获取流程
```
组件调用 useTranslations('namespace')
       ↓
next-intl 检查当前语言的翻译
       ↓
找到翻译 → 返回翻译文本
       ↓
未找到 → 返回 key 或触发 onError 回调
       ↓
onError 处理 → 显示默认文本或原文
```

### 初始化流程
```
应用启动
       ↓
检查 Cookie 中的语言偏好
       ↓
如果没有 → 检查 localStorage
       ↓
如果没有 → 检查浏览器语言
       ↓
如果不支持 → 使用默认语言 (zh)
       ↓
加载对应语言的翻译文件
       ↓
初始化 NextIntlClientProvider
```

## 错误处理

### 1. 翻译缺失处理
- 优先返回 fallback 参数
- 其次返回中文原文
- 最后返回 key 本身
- 在开发环境输出警告

### 2. 语言切换失败
- 保持当前语言不变
- 显示错误提示
- 提供重试机制

### 3. 存储失败处理
- localStorage 不可用时使用内存存储
- 页面刷新后回到默认语言

## 性能考虑

### 1. 翻译文件加载
- 使用静态导入，构建时打包
- 避免运行时网络请求
- 文件大小控制在合理范围

### 2. 渲染性能
- 使用 React.memo 优化组件
- 避免不必要的重新渲染
- 翻译函数使用 useCallback 缓存

### 3. 包体积控制
- 只包含必要的翻译内容
- 使用 Tree Shaking 移除未使用代码

## 测试策略

### 1. 单元测试
- 测试翻译函数的正确性
- 测试语言切换逻辑
- 测试错误处理机制

### 2. 集成测试
- 测试组件间的语言同步
- 测试持久化功能
- 测试页面刷新后的状态

### 3. 用户体验测试
- 测试语言切换的流畅性
- 测试移动端的可用性
- 测试不同浏览器的兼容性

## 维护和扩展

### 1. 添加新翻译
1. 在对应语言的 JSON 文件中添加键值对
2. 在组件中使用 t() 函数调用
3. 测试翻译显示效果

### 2. 添加新语言
1. 创建新的语言 JSON 文件
2. 在语言类型定义中添加新语言
3. 更新语言切换器组件

### 3. 翻译质量保证
- 提供翻译完整性检查脚本
- 建立翻译审核流程
- 定期更新和维护翻译内容
## 技术选型说明


### 为什么不使用第三方库？

**避免的库和原因：**

1. **next-intl**
   - 需要重构路由结构（/en, /zh）
   - 复杂的配置和中间件
   - 可能导致 hydration 错误
   - 学习成本高

2. **react-i18next**
   - 额外的包体积
   - 复杂的配置选项
   - 可能的性能开销
   - 过度工程化

3. **其他国际化库**
   - 功能过于复杂
   - 不符合项目简单化需求
   - 增加维护负担

### 自定义方案的优势

1. **完全可控**：所有代码都在项目内，可以随时修改和调试
2. **零学习成本**：基于标准 React 模式，团队容易理解
3. **最小化风险**：不会引入外部库的 bug 或兼容性问题
4. **性能最优**：只包含项目需要的功能，无冗余代码
5. **易于调试**：出问题时可以直接查看和修改源码

### 核心实现原理

```typescript
// 完全基于 React 原生功能
const LanguageContext = createContext<LanguageContextType | null>(null)

// 简单的翻译函数
const t = (key: string, fallback?: string) => {
  return translations[currentLang]?.[key] || fallback || key
}

// 语言切换逻辑
const setLanguage = (lang: 'zh' | 'en') => {
  setCurrentLang(lang)
  localStorage.setItem('preferred-language', lang)
  document.documentElement.lang = lang
}
```

这个方案的核心就是：**用最简单的方式解决问题，不过度设计**。
## 技术选型说明


### 为什么选择 next-intl？

**next-intl 的优势：**

1. **Next.js 官方推荐**：与 Next.js 14 App Router 完美集成
2. **类型安全**：完整的 TypeScript 支持，编译时检查翻译键
3. **性能优化**：支持 SSR/SSG，翻译在构建时优化
4. **功能完整**：支持复数、日期格式化、数字格式化等
5. **社区活跃**：文档完善，问题解决快速

### 避免路由问题的策略

**传统 next-intl 路由模式的问题：**
- 需要创建 `[locale]` 动态路由
- 需要配置复杂的 middleware.ts
- 可能导致现有路由冲突
- 需要重构所有页面路径

**我们的非路由模式解决方案：**

1. **不使用动态路由段**
   ```typescript
   // ❌ 传统方式 - 需要重构路由
   // app/[locale]/page.tsx
   // app/[locale]/about/page.tsx
   
   // ✅ 我们的方式 - 保持现有路由
   // app/page.tsx (不变)
   // app/about/page.tsx (不变)
   ```

2. **不配置 middleware.ts**
   ```typescript
   // ❌ 传统方式 - 需要路由重写中间件
   // middleware.ts 会拦截所有请求
   
   // ✅ 我们的方式 - 无中间件
   // 完全通过客户端状态管理
   ```

3. **客户端语言管理**
   ```typescript
   // ✅ 通过 Provider 和 Hook 管理语言状态
   // 不依赖 URL 路径，不影响现有路由
   ```

### 风险控制措施

1. **渐进式集成**：可以逐个组件添加翻译，未翻译的组件继续正常工作
2. **优雅降级**：翻译缺失时显示原文，不会导致页面崩溃
3. **配置简化**：最小化 next-intl 配置，避免复杂特性
4. **测试覆盖**：每个阶段都有完整的测试验证

### 与项目历史的对比

**之前失败的原因分析：**
- 可能使用了复杂的路由重构方案
- 可能配置了会导致冲突的中间件
- 可能一次性改动过多导致问题难以定位

**本次方案的改进：**
- 完全避免路由层面的改动
- 不使用任何中间件
- 分阶段实施，每步都可验证
- 保持现有功能完全不变

## 错误处理和降级策略

### 1. 翻译缺失处理
```typescript
// next-intl 配置中的错误处理
export default getRequestConfig(async ({locale}) => {
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    onError: (error) => {
      // 开发环境显示警告，生产环境静默处理
      if (process.env.NODE_ENV === 'development') {
        console.warn('Translation missing:', error.message);
      }
    },
    getMessageFallback: ({namespace, key, error}) => {
      // 返回原始 key 作为后备
      return `${namespace}.${key}`;
    }
  };
});
```

### 2. 语言切换失败处理
```typescript
const changeLocale = async (newLocale: string) => {
  try {
    const newMessages = await import(`../messages/${newLocale}.json`);
    setCurrentMessages(newMessages.default);
    setLocale(newLocale);
    // 持久化
    localStorage.setItem('locale', newLocale);
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
  } catch (error) {
    console.error('Failed to change locale:', error);
    // 保持当前语言，显示错误提示
    toast.error('语言切换失败，请重试');
  }
};
```

### 3. 存储失败处理
```typescript
const persistLocale = (locale: string) => {
  try {
    localStorage.setItem('locale', locale);
  } catch (error) {
    // localStorage 不可用时使用 sessionStorage
    try {
      sessionStorage.setItem('locale', locale);
    } catch (sessionError) {
      // 都不可用时只在内存中保存
      console.warn('Storage not available, locale will not persist');
    }
  }
};
```

## 性能优化策略

### 1. 翻译文件优化
- 使用 JSON 格式，构建时静态分析
- 按命名空间分割，避免加载不必要的翻译
- 使用 Tree Shaking 移除未使用的翻译

### 2. 动态加载优化
```typescript
// 预加载常用语言的翻译文件
const preloadLocale = (locale: string) => {
  import(`../messages/${locale}.json`);
};

// 在应用启动时预加载英文翻译
useEffect(() => {
  if (currentLocale === 'zh') {
    preloadLocale('en');
  }
}, []);
```

### 3. 渲染性能优化
```typescript
// 使用 React.memo 避免不必要的重新渲染
const TranslatedComponent = React.memo(function TranslatedComponent() {
  const t = useTranslations('Navigation');
  return <span>{t('home')}</span>;
});

// 使用 useMemo 缓存翻译结果
const translatedText = useMemo(() => t('complexKey'), [t]);
```

## 测试策略

### 1. 单元测试
```typescript
// 测试翻译功能
describe('Translation', () => {
  test('should return correct translation', () => {
    const { result } = renderHook(() => useTranslations('Navigation'), {
      wrapper: createIntlWrapper('zh')
    });
    expect(result.current('home')).toBe('首页');
  });
});
```

### 2. 集成测试
```typescript
// 测试语言切换
describe('Language Switching', () => {
  test('should switch language correctly', async () => {
    render(<App />);
    const switchButton = screen.getByText('EN');
    fireEvent.click(switchButton);
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });
});
```

### 3. E2E 测试
- 测试完整的用户语言切换流程
- 验证页面刷新后语言偏好保持
- 测试不同浏览器的兼容性

## 维护和扩展指南

### 1. 添加新翻译
1. 在 `messages/zh.json` 和 `messages/en.json` 中添加对应的键值对
2. 在组件中使用 `useTranslations` Hook
3. 运行测试确保翻译正确显示

### 2. 添加新语言支持
1. 在 `locales` 数组中添加新语言代码
2. 创建对应的翻译文件 `messages/[locale].json`
3. 更新语言切换器组件支持新语言
4. 添加相应的测试用例

### 3. 翻译质量保证
- 提供翻译完整性检查脚本
- 建立翻译审核流程
- 定期更新和维护翻译内容
- 使用 TypeScript 确保翻译键的类型安全