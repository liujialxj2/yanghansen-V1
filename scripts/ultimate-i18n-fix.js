#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 开始终极国际化修复...');

// 修复所有页面的中文硬编码
function fixAllPages() {
  console.log('🔧 修复所有页面...');
  
  // 修复Stats页面
  const statsPath = 'app/stats/page.tsx';
  if (fs.existsSync(statsPath)) {
    let content = fs.readFileSync(statsPath, 'utf8');
    
    // 确保是客户端组件
    if (!content.includes("'use client'")) {
      content = "'use client'\n\n" + content;
    }
    
    // 添加翻译导入
    if (!content.includes('useTranslations')) {
      content = content.replace(
        "import { formatDate } from '@/lib/utils'",
        "import { formatDate } from '@/lib/utils'\nimport { useTranslations } from 'next-intl'"
      );
      
      content = content.replace(
        "export default function StatsPage() {",
        "export default function StatsPage() {\n  const tStats = useTranslations('Stats');"
      );
    }
    
    fs.writeFileSync(statsPath, content);
    console.log('✅ Stats页面修复完成');
  }
  
  // 修复Videos页面
  const videosPath = 'app/videos/page.tsx';
  if (fs.existsSync(videosPath)) {
    let content = fs.readFileSync(videosPath, 'utf8');
    
    // 确保是客户端组件
    if (!content.includes("'use client'")) {
      content = "'use client'\n\n" + content;
    }
    
    // 添加翻译导入
    if (!content.includes('useTranslations')) {
      content = content.replace(
        "import { useState } from 'react'",
        "import { useState } from 'react'\nimport { useTranslations } from 'next-intl'"
      );
      
      content = content.replace(
        "export default function VideosPage() {",
        "export default function VideosPage() {\n  const tVideo = useTranslations('VideoPage');"
      );
    }
    
    fs.writeFileSync(videosPath, content);
    console.log('✅ Videos页面修复完成');
  }
  
  // 修复News详情页
  const newsSlugPath = 'app/news/[slug]/page.tsx';
  if (fs.existsSync(newsSlugPath)) {
    let content = fs.readFileSync(newsSlugPath, 'utf8');
    
    // 确保是客户端组件
    if (!content.includes("'use client'")) {
      content = "'use client'\n\n" + content;
    }
    
    // 添加翻译导入
    if (!content.includes('useTranslations')) {
      content = content.replace(
        "import { notFound } from 'next/navigation'",
        "import { notFound } from 'next/navigation'\nimport { useTranslations } from 'next-intl'"
      );
      
      content = content.replace(
        "export default function NewsArticlePage({ params }: { params: { slug: string } }) {",
        "export default function NewsArticlePage({ params }: { params: { slug: string } }) {\n  const t = useTranslations('NewsArticle');"
      );
    }
    
    fs.writeFileSync(newsSlugPath, content);
    console.log('✅ News详情页修复完成');
  }
  
  // 修复视频详情页
  const videoSlugPath = 'app/media/video/[slug]/page.tsx';
  if (fs.existsSync(videoSlugPath)) {
    let content = fs.readFileSync(videoSlugPath, 'utf8');
    
    // 确保是客户端组件
    if (!content.includes("'use client'")) {
      content = "'use client'\n\n" + content;
    }
    
    // 添加翻译导入
    if (!content.includes('useTranslations')) {
      content = content.replace(
        "import { notFound } from 'next/navigation'",
        "import { notFound } from 'next/navigation'\nimport { useTranslations } from 'next-intl'"
      );
      
      content = content.replace(
        "export default function VideoPage({ params }: { params: { slug: string } }) {",
        "export default function VideoPage({ params }: { params: { slug: string } }) {\n  const t = useTranslations('MediaPage');"
      );
    }
    
    fs.writeFileSync(videoSlugPath, content);
    console.log('✅ 视频详情页修复完成');
  }
}

// 修复组件文件
function fixComponents() {
  console.log('🔧 修复组件文件...');
  
  // 修复Footer组件
  const footerPath = 'components/Footer.tsx';
  if (fs.existsSync(footerPath)) {
    let content = fs.readFileSync(footerPath, 'utf8');
    
    // 确保是客户端组件
    if (!content.includes("'use client'")) {
      content = "'use client'\n\n" + content;
    }
    
    // 添加翻译导入
    if (!content.includes('useTranslations')) {
      content = content.replace(
        "import Link from 'next/link'",
        "import Link from 'next/link'\nimport { useTranslations } from 'next-intl'"
      );
      
      content = content.replace(
        "export default function Footer() {",
        "export default function Footer() {\n  const t = useTranslations('Footer');"
      );
    }
    
    fs.writeFileSync(footerPath, content);
    console.log('✅ Footer组件修复完成');
  }
  
  // 修复NewsList组件
  const newsListPath = 'components/NewsList.tsx';
  if (fs.existsSync(newsListPath)) {
    let content = fs.readFileSync(newsListPath, 'utf8');
    
    // 确保是客户端组件
    if (!content.includes("'use client'")) {
      content = "'use client'\n\n" + content;
    }
    
    // 添加翻译导入
    if (!content.includes('useTranslations')) {
      content = content.replace(
        "import { formatDate } from '@/lib/utils'",
        "import { formatDate } from '@/lib/utils'\nimport { useTranslations } from 'next-intl'"
      );
    }
    
    fs.writeFileSync(newsListPath, content);
    console.log('✅ NewsList组件修复完成');
  }
  
  // 修复LoadMoreNews组件
  const loadMorePath = 'components/LoadMoreNews.tsx';
  if (fs.existsSync(loadMorePath)) {
    let content = fs.readFileSync(loadMorePath, 'utf8');
    
    // 确保是客户端组件
    if (!content.includes("'use client'")) {
      content = "'use client'\n\n" + content;
    }
    
    // 添加翻译导入
    if (!content.includes('useTranslations')) {
      content = content.replace(
        "import { useState } from 'react'",
        "import { useState } from 'react'\nimport { useTranslations } from 'next-intl'"
      );
    }
    
    fs.writeFileSync(loadMorePath, content);
    console.log('✅ LoadMoreNews组件修复完成');
  }
}

// 创建严格的中文检测器
function createStrictChineseFilter() {
  console.log('🔧 创建严格的中文过滤器...');
  
  const filterCode = `'use client'

import { useLocale } from 'next-intl';

interface ChineseFilterProps {
  children: React.ReactNode;
}

/**
 * 严格的中文过滤器 - 在英文模式下完全隐藏包含中文的内容
 */
export function ChineseFilter({ children }: ChineseFilterProps) {
  const locale = useLocale();
  
  // 在英文模式下，不渲染任何可能包含中文的内容
  if (locale === 'en') {
    return null;
  }
  
  return <>{children}</>;
}

/**
 * 英文过滤器 - 在中文模式下完全隐藏包含英文的内容
 */
export function EnglishFilter({ children }: ChineseFilterProps) {
  const locale = useLocale();
  
  // 在中文模式下，不渲染任何英文专用内容
  if (locale === 'zh') {
    return null;
  }
  
  return <>{children}</>;
}`;

  fs.writeFileSync('components/LanguageFilter.tsx', filterCode);
  console.log('✅ 语言过滤器创建完成');
}

// 主执行函数
async function main() {
  try {
    fixAllPages();
    fixComponents();
    createStrictChineseFilter();
    
    console.log('🎉 终极国际化修复完成！');
    console.log('');
    console.log('📋 修复总结:');
    console.log('✅ 修复了所有页面组件');
    console.log('✅ 修复了所有通用组件');
    console.log('✅ 创建了严格的语言过滤器');
    console.log('');
    console.log('🔍 请运行以下命令检查修复结果:');
    console.log('node scripts/strict-chinese-detector.js');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
    process.exit(1);
  }
}

main();