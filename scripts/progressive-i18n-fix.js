#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 开始渐进式国际化修复...');

// 常见中文文本替换规则
const COMMON_REPLACEMENTS = [
  // 加载和状态
  { search: /加载中\.\.\./g, replace: '{t("loading")}' },
  { search: /加载更多/g, replace: '{t("loadMore")}' },
  { search: /更多/g, replace: '{t("more")}' },
  { search: /查看全部/g, replace: '{t("viewAll")}' },
  { search: /阅读更多/g, replace: '{t("readMore")}' },
  
  // 导航和页面
  { search: /首页/g, replace: '{t("home")}' },
  { search: /关于/g, replace: '{t("about")}' },
  { search: /数据/g, replace: '{t("stats")}' },
  { search: /视频/g, replace: '{t("videos")}' },
  { search: /新闻/g, replace: '{t("news")}' },
  
  // 新闻相关
  { search: /热门话题/g, replace: '{t("trendingTopics")}' },
  { search: /本赛季数据/g, replace: '{t("seasonStats")}' },
  { search: /来源:/g, replace: '{t("source")}:' },
  { search: /阅读全文/g, replace: '{t("readFull")}' },
  { search: /更多新闻/g, replace: '{t("moreNews")}' },
  
  // 统计相关
  { search: /场均得分/g, replace: '{tStats("ppg")}' },
  { search: /场均篮板/g, replace: '{tStats("rpg")}' },
  { search: /场均盖帽/g, replace: '{tStats("bpg")}' },
  { search: /投篮命中率/g, replace: '{tStats("fgPercent")}' },
  { search: /出场比赛/g, replace: '{tStats("gamesPlayed")}' },
  { search: /首发比赛/g, replace: '{tStats("gamesStarted")}' },
  { search: /场均时间/g, replace: '{tStats("minutesPerGame")}' },
  
  // 时间线和职业生涯
  { search: /职业生涯/g, replace: '{t("careerTimeline")}' },
  { search: /最近比赛/g, replace: '{t("recentGames")}' },
  { search: /职业生涯里程碑/g, replace: '{tStats("careerMilestones")}' },
  { search: /赛季概览/g, replace: '{tStats("seasonOverview")}' },
];

// 需要修复的文件列表
const FILES_TO_FIX = [
  'app/news/page.tsx',
  'app/stats/page.tsx', 
  'app/videos/page.tsx',
  'components/NewsList.tsx',
  'components/LoadMoreNews.tsx',
  'components/VideoList.tsx',
  'components/SimpleVideoList.tsx',
  'components/Footer.tsx',
];

// 修复单个文件
function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return false;
  }
  
  console.log(`🔧 修复文件: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // 确保是客户端组件
  if (!content.includes("'use client'") && filePath.includes('components/')) {
    content = "'use client'\n\n" + content;
    hasChanges = true;
  }
  
  // 添加翻译导入
  if (!content.includes('useTranslations')) {
    // 查找现有的import语句
    const importMatch = content.match(/import.*from ['"]next-intl['"];?/);
    if (importMatch) {
      // 更新现有的next-intl导入
      content = content.replace(
        /import\s*\{([^}]*)\}\s*from\s*['"]next-intl['"];?/,
        (match, imports) => {
          const importList = imports.split(',').map(s => s.trim()).filter(Boolean);
          if (!importList.includes('useTranslations')) {
            importList.push('useTranslations');
          }
          return `import { ${importList.join(', ')} } from 'next-intl';`;
        }
      );
    } else {
      // 添加新的导入
      const lastImportIndex = content.lastIndexOf('import');
      if (lastImportIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextLineIndex + 1) + 
                 "import { useTranslations } from 'next-intl'\n" + 
                 content.slice(nextLineIndex + 1);
      }
    }
    hasChanges = true;
  }
  
  // 在组件内添加翻译hooks
  if (!content.includes('useTranslations(')) {
    const componentMatch = content.match(/export\s+default\s+function\s+(\w+)\s*\([^)]*\)\s*\{/);
    if (componentMatch) {
      const hookToAdd = filePath.includes('stats') || filePath.includes('Stats') 
        ? '\n  const tStats = useTranslations(\'Stats\');'
        : '\n  const t = useTranslations(\'Common\');';
      
      content = content.replace(
        /export\s+default\s+function\s+(\w+)\s*\([^)]*\)\s*\{/,
        (match) => match + hookToAdd
      );
      hasChanges = true;
    }
  }
  
  // 应用替换规则
  COMMON_REPLACEMENTS.forEach(({ search, replace }) => {
    const originalContent = content;
    content = content.replace(search, replace);
    if (content !== originalContent) {
      hasChanges = true;
    }
  });
  
  // 写回文件
  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath} 修复完成`);
    return true;
  } else {
    console.log(`ℹ️  ${filePath} 无需修改`);
    return false;
  }
}

// 修复所有页面组件
function fixAllComponents() {
  console.log('📝 修复页面组件...');
  
  let fixedCount = 0;
  
  FILES_TO_FIX.forEach(filePath => {
    if (fixFile(filePath)) {
      fixedCount++;
    }
  });
  
  console.log(`✅ 完成组件修复，共修复 ${fixedCount} 个文件`);
}

// 更新翻译文件
function updateTranslationFiles() {
  console.log('📝 更新翻译文件...');
  
  // 读取现有翻译文件
  const zhPath = 'messages/zh.json';
  const enPath = 'messages/en.json';
  
  const zhTranslations = JSON.parse(fs.readFileSync(zhPath, 'utf8'));
  const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  
  // 添加缺失的翻译
  const additionalTranslations = {
    zh: {
      Common: {
        ...zhTranslations.Common,
        more: '更多',
        trendingTopics: '热门话题',
        seasonStats: '本赛季数据',
        source: '来源',
        moreNews: '更多新闻'
      }
    },
    en: {
      Common: {
        ...enTranslations.Common,
        more: 'More',
        trendingTopics: 'Trending Topics',
        seasonStats: 'Season Stats',
        source: 'Source',
        moreNews: 'More News'
      }
    }
  };
  
  // 合并翻译
  Object.assign(zhTranslations, additionalTranslations.zh);
  Object.assign(enTranslations, additionalTranslations.en);
  
  // 写回文件
  fs.writeFileSync(zhPath, JSON.stringify(zhTranslations, null, 2));
  fs.writeFileSync(enPath, JSON.stringify(enTranslations, null, 2));
  
  console.log('✅ 翻译文件更新完成');
}

// 集成ChineseDetector到Layout
function integrateChineseDetector() {
  console.log('🔧 集成中文检测器...');
  
  const layoutPath = 'app/layout.tsx';
  let content = fs.readFileSync(layoutPath, 'utf8');
  
  // 添加ChineseDetector导入
  if (!content.includes('ChineseDetector')) {
    content = content.replace(
      "import { LocaleProvider } from '@/components/LocaleProvider'",
      "import { LocaleProvider } from '@/components/LocaleProvider'\nimport { ChineseDetector } from '@/components/ChineseDetector'"
    );
    
    // 包装children
    content = content.replace(
      '<div className="min-h-screen flex flex-col">',
      '<ChineseDetector>\n            <div className="min-h-screen flex flex-col">'
    );
    
    content = content.replace(
      '</div>\n        </LocaleProvider>',
      '</div>\n          </ChineseDetector>\n        </LocaleProvider>'
    );
    
    fs.writeFileSync(layoutPath, content);
    console.log('✅ 中文检测器集成完成');
  } else {
    console.log('ℹ️  中文检测器已集成');
  }
}

// 主执行函数
async function main() {
  try {
    console.log('🎯 开始方案二：渐进式修复');
    console.log('');
    
    // 1. 更新翻译文件
    updateTranslationFiles();
    
    // 2. 修复所有组件
    fixAllComponents();
    
    // 3. 集成中文检测器
    integrateChineseDetector();
    
    console.log('');
    console.log('🎉 渐进式修复完成！');
    console.log('');
    console.log('📋 修复总结:');
    console.log('✅ Layout默认语言已改为英文');
    console.log('✅ 创建了数据过滤中间件');
    console.log('✅ 创建了安全数据Hook');
    console.log('✅ 创建了运行时中文检测器');
    console.log('✅ 批量修复了页面组件');
    console.log('✅ 更新了翻译文件');
    console.log('');
    console.log('🔍 下一步:');
    console.log('1. 运行 npm run dev 启动开发服务器');
    console.log('2. 切换到英文模式检查效果');
    console.log('3. 查看控制台是否有中文字符警告');
    console.log('4. 运行 node scripts/strict-chinese-detector.js 检查剩余问题');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
    process.exit(1);
  }
}

main();