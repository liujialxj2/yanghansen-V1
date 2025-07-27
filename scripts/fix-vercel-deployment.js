#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 修复Vercel部署缺失文件...\n');

// 需要强制添加的文件和目录
const requiredFiles = [
  // 组件文件
  'components/LanguageSwitcher.tsx',
  'components/LocaleProvider.tsx',
  'components/HomePageClient.tsx',
  'components/SafeImage.tsx',
  'components/NewsList.tsx',
  'components/LoadMoreNews.tsx',
  'components/VideoList.tsx',
  'components/VideoPlayer.tsx',
  'components/VideoModal.tsx',
  'components/VideoLoadingStates.tsx',
  'components/VideoErrorBoundary.tsx',
  'components/SimpleVideoList.tsx',
  'components/Navigation.tsx',
  'components/ui/',
  
  // Lib文件
  'lib/data-filter.ts',
  'lib/locale.ts',
  'lib/date-utils.ts',
  'lib/video-data-sanitizer.ts',
  
  // 配置文件
  'next-intl.config.js',
  'next.config.js',
  
  // 消息文件
  'messages/',
  
  // 数据文件
  'data/videos.json',
  'data/news.json',
  'data/player.json',
  
  // 页面文件
  'app/videos/',
  
  // 中间件
  'middleware.js',
  
  // API路由
  'pages/'
];

console.log('📁 强制添加必要文件到Git...');

// 分批添加文件
const batches = [];
for (let i = 0; i < requiredFiles.length; i += 5) {
  batches.push(requiredFiles.slice(i, i + 5));
}

batches.forEach((batch, index) => {
  try {
    const files = batch.filter(file => {
      const fullPath = path.join(process.cwd(), file);
      return fs.existsSync(fullPath);
    });
    
    if (files.length > 0) {
      console.log(`  批次 ${index + 1}: 添加 ${files.join(', ')}`);
      execSync(`git add -f ${files.join(' ')}`, { stdio: 'pipe' });
    }
  } catch (error) {
    console.warn(`  警告: 批次 ${index + 1} 部分文件添加失败`);
  }
});

console.log('\n✅ 文件添加完成');

// 检查状态
console.log('\n📋 检查Git状态...');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  const stagedFiles = status.split('\n').filter(line => line.startsWith('A ') || line.startsWith('M ')).length;
  console.log(`  已暂存文件数量: ${stagedFiles}`);
} catch (error) {
  console.error('无法检查Git状态');
}

console.log('\n🚀 准备提交...');
console.log('请运行以下命令完成部署修复:');
console.log('  git commit -m "fix: 批量修复Vercel部署缺失文件"');
console.log('  git push origin main');