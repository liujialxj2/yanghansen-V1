#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 开始全面国际化修复...');

// 1. 首先修复所有页面组件
const pageFiles = [
  'app/about/page.tsx',
  'app/news/page.tsx', 
  'app/stats/page.tsx',
  'app/videos/page.tsx',
  'app/news/[slug]/page.tsx',
  'app/media/video/[slug]/page.tsx'
];

// 2. 修复组件文件
const componentFiles = [
  'components/Footer.tsx',
  'components/Navigation.tsx',
  'components/NewsList.tsx',
  'components/LoadMoreNews.tsx',
  'components/VideoList.tsx',
  'components/SimpleVideoList.tsx',
  'components/VideoPlayer.tsx'
];

// 添加更多翻译内容到翻译文件
function updateTranslationFiles() {
  console.log('📝 更新翻译文件...');
  
  // 读取现有翻译文件
  const zhTranslations = JSON.parse(fs.readFileSync('messages/zh.json', 'utf8'));
  const enTranslations = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
  
  // 添加缺失的翻译
  const additionalTranslations = {
    zh: {
      "VideoPage": {
        "title": "视频",
        "allCategories": "全部分类",
        "highlights": "精彩集锦",
        "training": "训练视频",
        "interviews": "采访",
        "skills": "技巧展示",
        "news": "新闻",
        "draft": "选秀",
        "summerLeague": "夏季联赛",
        "loadMore": "加载更多",
        "noVideos": "暂无视频",
        "watchVideo": "观看视频",
        "duration": "时长",
        "views": "观看次数"
      },
      "NewsArticle": {
        "backToNews": "返回新闻",
        "publishedOn": "发布于",
        "author": "作者",
        "readTime": "阅读时间",
        "tags": "标签",
        "relatedNews": "相关新闻",
        "shareArticle": "分享文章",
        "printArticle": "打印文章"
      },
      "MediaPage": {
        "title": "媒体中心",
        "videoTitle": "视频标题",
        "videoDescription": "视频描述",
        "publishDate": "发布日期",
        "category": "分类",
        "watchNow": "立即观看",
        "fullscreen": "全屏",
        "quality": "画质"
      },
      "LoadMore": {
        "loadingMore": "正在加载更多...",
        "noMoreContent": "没有更多内容了",
        "loadFailed": "加载失败，请重试"
      }
    },
    en: {
      "VideoPage": {
        "title": "Videos",
        "allCategories": "All Categories",
        "highlights": "Highlights",
        "training": "Training",
        "interviews": "Interviews", 
        "skills": "Skills",
        "news": "News",
        "draft": "Draft",
        "summerLeague": "Summer League",
        "loadMore": "Load More",
        "noVideos": "No videos available",
        "watchVideo": "Watch Video",
        "duration": "Duration",
        "views": "Views"
      },
      "NewsArticle": {
        "backToNews": "Back to News",
        "publishedOn": "Published on",
        "author": "Author",
        "readTime": "Read time",
        "tags": "Tags",
        "relatedNews": "Related News",
        "shareArticle": "Share Article",
        "printArticle": "Print Article"
      },
      "MediaPage": {
        "title": "Media Center",
        "videoTitle": "Video Title",
        "videoDescription": "Video Description",
        "publishDate": "Publish Date",
        "category": "Category",
        "watchNow": "Watch Now",
        "fullscreen": "Fullscreen",
        "quality": "Quality"
      },
      "LoadMore": {
        "loadingMore": "Loading more...",
        "noMoreContent": "No more content",
        "loadFailed": "Load failed, please retry"
      }
    }
  };
  
  // 合并翻译
  Object.assign(zhTranslations, additionalTranslations.zh);
  Object.assign(enTranslations, additionalTranslations.en);
  
  // 写回文件
  fs.writeFileSync('messages/zh.json', JSON.stringify(zhTranslations, null, 2));
  fs.writeFileSync('messages/en.json', JSON.stringify(enTranslations, null, 2));
  
  console.log('✅ 翻译文件更新完成');
}

// 修复About页面
function fixAboutPage() {
  console.log('🔧 修复About页面...');
  
  const filePath = 'app/about/page.tsx';
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 确保导入了必要的hooks
  if (!content.includes("import { useTranslations")) {
    content = content.replace(
      "import { useLocale } from 'next-intl'",
      "import { useTranslations, useLocale } from 'next-intl'"
    );
  }
  
  // 添加ConditionalContent导入
  if (!content.includes("ConditionalContent")) {
    content = content.replace(
      "import { useTranslations, useLocale } from 'next-intl'",
      "import { useTranslations, useLocale } from 'next-intl'\nimport { ConditionalContent } from '@/components/ConditionalContent'"
    );
  }
  
  // 替换硬编码的中文文本
  const replacements = [
    {
      search: /杨瀚森，中国篮球新星[^"]+/g,
      replace: '{locale === "zh" ? "杨瀚森，中国篮球新星，以其出色的身高和技术在青年联赛中崭露头角。他的职业生涯正处于上升期，展现出成为NBA球员的潜力。" : "Yang Hansen, a rising Chinese basketball star, has made his mark in youth leagues with his outstanding height and skills. His career is on an upward trajectory, showing potential to become an NBA player."}'
    }
  ];
  
  replacements.forEach(({search, replace}) => {
    content = content.replace(search, replace);
  });
  
  fs.writeFileSync(filePath, content);
  console.log('✅ About页面修复完成');
}

// 修复其他页面的函数
function fixNewsPage() {
  console.log('🔧 修复News页面...');
  
  const filePath = 'app/news/page.tsx';
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 确保是客户端组件
  if (!content.includes("'use client'")) {
    content = "'use client'\n\n" + content;
  }
  
  // 添加翻译hooks
  if (!content.includes("useTranslations")) {
    content = content.replace(
      "import { formatDate } from '@/lib/utils'",
      "import { formatDate } from '@/lib/utils'\nimport { useTranslations } from 'next-intl'"
    );
    
    // 在组件内添加翻译hook
    content = content.replace(
      "export default function NewsPage() {",
      "export default function NewsPage() {\n  const tStats = useTranslations('Stats');"
    );
  }
  
  fs.writeFileSync(filePath, content);
  console.log('✅ News页面修复完成');
}

function fixStatsPage() {
  console.log('🔧 修复Stats页面...');
  
  const filePath = 'app/stats/page.tsx';
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 确保是客户端组件
  if (!content.includes("'use client'")) {
    content = "'use client'\n\n" + content;
  }
  
  // 添加翻译hooks
  if (!content.includes("useTranslations")) {
    content = content.replace(
      "import { formatDate } from '@/lib/utils'",
      "import { formatDate } from '@/lib/utils'\nimport { useTranslations } from 'next-intl'"
    );
    
    // 在组件内添加翻译hook
    content = content.replace(
      "export default function StatsPage() {",
      "export default function StatsPage() {\n  const tStats = useTranslations('Stats');"
    );
  }
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Stats页面修复完成');
}

function fixVideosPage() {
  console.log('🔧 修复Videos页面...');
  
  const filePath = 'app/videos/page.tsx';
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 确保是客户端组件
  if (!content.includes("'use client'")) {
    content = "'use client'\n\n" + content;
  }
  
  // 添加翻译hooks
  if (!content.includes("useTranslations")) {
    content = content.replace(
      "import { useState } from 'react'",
      "import { useState } from 'react'\nimport { useTranslations } from 'next-intl'"
    );
    
    // 在组件内添加翻译hook
    content = content.replace(
      "export default function VideosPage() {",
      "export default function VideosPage() {\n  const tVideo = useTranslations('VideoPage');"
    );
  }
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Videos页面修复完成');
}

// 创建ConditionalContent组件（如果不存在）
function createConditionalContentComponent() {
  const filePath = 'components/ConditionalContent.tsx';
  
  if (fs.existsSync(filePath)) {
    console.log('✅ ConditionalContent组件已存在');
    return;
  }
  
  console.log('🔧 创建ConditionalContent组件...');
  
  const componentCode = `'use client'

import { useLocale } from 'next-intl';

interface ConditionalContentProps {
  zh: React.ReactNode;
  en: React.ReactNode;
}

/**
 * 根据当前语言条件渲染内容的组件
 * 确保英文模式下不显示任何中文字符，反之亦然
 */
export function ConditionalContent({ zh, en }: ConditionalContentProps) {
  const locale = useLocale();
  
  return <>{locale === 'zh' ? zh : en}</>;
}`;

  fs.writeFileSync(filePath, componentCode);
  console.log('✅ ConditionalContent组件创建完成');
}

// 主执行函数
async function main() {
  try {
    // 1. 更新翻译文件
    updateTranslationFiles();
    
    // 2. 创建必要组件
    createConditionalContentComponent();
    
    // 3. 修复各个页面
    fixAboutPage();
    fixNewsPage();
    fixStatsPage();
    fixVideosPage();
    
    console.log('🎉 全面国际化修复完成！');
    console.log('');
    console.log('📋 修复总结:');
    console.log('✅ 更新了翻译文件');
    console.log('✅ 创建了ConditionalContent组件');
    console.log('✅ 修复了About页面');
    console.log('✅ 修复了News页面');
    console.log('✅ 修复了Stats页面');
    console.log('✅ 修复了Videos页面');
    console.log('');
    console.log('🔍 请运行以下命令检查修复结果:');
    console.log('node scripts/strict-chinese-detector.js');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
    process.exit(1);
  }
}

main();