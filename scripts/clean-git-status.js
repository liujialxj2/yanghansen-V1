#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧹 清理Git状态和优化提交...\n');

// 1. 检查当前状态
console.log('📋 当前Git状态:');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  const lines = status.split('\n').filter(line => line.trim());
  console.log(`  总计未跟踪文件: ${lines.length}`);
  
  // 分类统计
  const categories = {
    reports: lines.filter(line => line.includes('_REPORT') || line.includes('COMPLETION')).length,
    scripts: lines.filter(line => line.includes('scripts/')).length,
    docs: lines.filter(line => line.includes('docs/') || line.includes('.md')).length,
    lib: lines.filter(line => line.includes('lib/')).length,
    data: lines.filter(line => line.includes('data/')).length,
    config: lines.filter(line => line.includes('.json') || line.includes('.js')).length,
    other: 0
  };
  
  categories.other = lines.length - Object.values(categories).reduce((a, b) => a + b, 0);
  
  console.log('  文件分类:');
  Object.entries(categories).forEach(([type, count]) => {
    if (count > 0) console.log(`    ${type}: ${count} 个文件`);
  });
  
} catch (error) {
  console.error('无法获取Git状态');
}

console.log('\n💡 建议的处理方案:');
console.log('1. 🎯 只提交核心功能文件 (推荐)');
console.log('2. 📦 批量提交所有文件');
console.log('3. 🗑️  重置并清理不必要文件');

console.log('\n🚀 推荐命令:');
console.log('选择方案1 - 只提交核心文件:');
console.log('  git add lib/ components/ app/ pages/ data/videos.json data/news.json');
console.log('  git add messages/ middleware.js next-intl.config.js');
console.log('  git commit -m "feat: 添加核心功能文件"');
console.log('  git push origin main');

console.log('\n选择方案2 - 批量提交所有文件:');
console.log('  git add .');
console.log('  git commit -m "feat: 批量提交所有开发文件"');
console.log('  git push origin main');

console.log('\n选择方案3 - 清理不必要文件:');
console.log('  git clean -fd  # 删除未跟踪文件');
console.log('  git add lib/ components/ app/ pages/ data/videos.json data/news.json');
console.log('  git commit -m "feat: 只添加必要的核心文件"');