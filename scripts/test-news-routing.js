#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 测试新闻路由和数据...\n');

// 1. 检查新闻数据文件
const newsDataPath = path.join(process.cwd(), 'data/news.json');
if (!fs.existsSync(newsDataPath)) {
  console.error('❌ 新闻数据文件不存在: data/news.json');
  process.exit(1);
}

const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf8'));
console.log('✅ 新闻数据文件存在');
console.log(`📊 数据统计:`);
console.log(`   - 头条新闻: 1篇`);
console.log(`   - 普通文章: ${newsData.articles.length}篇`);
console.log(`   - 总计: ${newsData.articles.length + 1}篇`);

// 2. 检查页面文件
const newsPagePath = path.join(process.cwd(), 'app/[locale]/news/page.tsx');
const newsDetailPath = path.join(process.cwd(), 'app/[locale]/news/[slug]/page.tsx');

if (!fs.existsSync(newsPagePath)) {
  console.error('❌ 新闻列表页面不存在: app/[locale]/news/page.tsx');
  process.exit(1);
}

if (!fs.existsSync(newsDetailPath)) {
  console.error('❌ 新闻详情页面不存在: app/[locale]/news/[slug]/page.tsx');
  process.exit(1);
}

console.log('✅ 新闻页面文件存在');

// 3. 检查旧文件是否已删除
const oldNewsPath = path.join(process.cwd(), 'app/news');
if (fs.existsSync(oldNewsPath)) {
  console.warn('⚠️  旧的新闻目录仍然存在: app/news (可能导致路由冲突)');
} else {
  console.log('✅ 旧的新闻目录已清理');
}

// 4. 显示文章列表和路由
console.log('\n📰 可用的新闻文章:');
console.log('头条新闻:');
console.log(`   - ${newsData.featured.title}`);
console.log(`   - 路由: /zh/news/${newsData.featured.slug || newsData.featured.id}`);

console.log('\n普通文章:');
newsData.articles.forEach((article, index) => {
  console.log(`   ${index + 1}. ${article.title}`);
  console.log(`      路由: /zh/news/${article.slug || article.id}`);
});

// 5. 检查中间件配置
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  console.log('\n✅ 中间件配置存在 (支持国际化路由)');
  console.log('📍 访问方式:');
  console.log('   - 中文: http://localhost:3000/zh/news');
  console.log('   - 英文: http://localhost:3000/en/news');
  console.log('   - 自动重定向: http://localhost:3000/news → http://localhost:3000/zh/news');
} else {
  console.warn('⚠️  中间件配置不存在');
}

console.log('\n🚀 建议的测试步骤:');
console.log('1. 启动开发服务器: npm run dev');
console.log('2. 访问新闻列表: http://localhost:3000/zh/news');
console.log('3. 点击任意文章测试详情页');
console.log('4. 测试语言切换: http://localhost:3000/en/news');

console.log('\n✅ 新闻路由测试完成!');