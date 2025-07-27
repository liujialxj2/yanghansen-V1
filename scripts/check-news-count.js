#!/usr/bin/env node

/**
 * 检查新闻数量和数据完整性
 */

const fs = require('fs').promises;

async function checkNewsCount() {
  console.log('🔍 检查新闻数据...\n');

  try {
    const newsData = JSON.parse(await fs.readFile('data/news.json', 'utf8'));

    console.log('📊 新闻统计:');
    console.log(`   头条新闻: ${newsData.featured ? '✅ 有' : '❌ 无'}`);
    console.log(`   文章数量: ${newsData.articles.length}`);
    console.log(`   总新闻数: ${newsData.articles.length + (newsData.featured ? 1 : 0)}`);
    console.log(`   最后更新: ${new Date(newsData.lastUpdated).toLocaleString()}`);

    if (newsData.featured) {
      console.log('\n🌟 头条新闻:');
      console.log(`   标题: ${newsData.featured.title.substring(0, 60)}...`);
      console.log(`   来源: ${newsData.featured.originalSource}`);
      console.log(`   相关性: ${newsData.featured.relevanceScore}`);
    }

    console.log('\n📋 文章列表:');
    newsData.articles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title.substring(0, 50)}...`);
      console.log(`      来源: ${article.originalSource} | 相关性: ${article.relevanceScore.toFixed(3)}`);
    });

    // 检查数据完整性
    console.log('\n🔍 数据完整性检查:');
    const allArticles = [newsData.featured, ...newsData.articles].filter(Boolean);

    const checks = {
      '所有文章都有标题': allArticles.every(a => a.title),
      '所有文章都有URL': allArticles.every(a => a.url),
      '所有文章都有图片': allArticles.every(a => a.image),
      '所有文章都有日期': allArticles.every(a => a.date),
      '所有文章都有来源': allArticles.every(a => a.originalSource),
      '所有文章都有slug': allArticles.every(a => a.slug || a.id)
    };

    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });

    console.log('\n🌐 建议访问: http://localhost:3000/news');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

if (require.main === module) {
  checkNewsCount();
}

module.exports = { checkNewsCount };