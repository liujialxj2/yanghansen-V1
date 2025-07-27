#!/usr/bin/env node

/**
 * 预览新闻内容
 */

const fs = require('fs').promises;

async function previewNews() {
  console.log('📰 Yang Hansen新闻内容预览\n');
  
  try {
    const newsData = JSON.parse(await fs.readFile('data/news.json', 'utf8'));
    
    // 显示统计信息
    console.log('📊 新闻统计:');
    console.log(`   - 最后更新: ${new Date(newsData.lastUpdated).toLocaleString()}`);
    console.log(`   - 头条新闻: ${newsData.featured ? '✅' : '❌'}`);
    console.log(`   - 文章总数: ${newsData.articles.length}`);
    console.log(`   - 热门话题: ${newsData.trending?.join(', ') || '无'}`);
    console.log('');
    
    // 显示头条新闻
    if (newsData.featured) {
      console.log('🌟 头条新闻:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`标题: ${newsData.featured.title}`);
      console.log(`来源: ${newsData.featured.originalSource}`);
      console.log(`日期: ${new Date(newsData.featured.date).toLocaleString()}`);
      console.log(`分类: ${newsData.featured.category}`);
      console.log(`相关性: ${newsData.featured.relevanceScore.toFixed(3)}`);
      console.log(`标签: ${newsData.featured.tags.join(', ')}`);
      console.log(`摘要: ${newsData.featured.summary}`);
      console.log(`链接: ${newsData.featured.url}`);
      console.log('');
    }
    
    // 显示其他文章
    console.log('📋 其他文章:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    newsData.articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   来源: ${article.originalSource} | 日期: ${new Date(article.date).toLocaleDateString()}`);
      console.log(`   分类: ${article.category} | 相关性: ${article.relevanceScore.toFixed(3)}`);
      console.log(`   摘要: ${article.summary}`);
      console.log(`   链接: ${article.url}`);
      console.log('');
    });
    
    // 显示分类统计
    const categories = {};
    [newsData.featured, ...newsData.articles].forEach(article => {
      if (article && article.category) {
        categories[article.category] = (categories[article.category] || 0) + 1;
      }
    });
    
    console.log('📈 分类统计:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count}篇`);
    });
    console.log('');
    
    // 显示来源统计
    const sources = {};
    [newsData.featured, ...newsData.articles].forEach(article => {
      if (article && article.originalSource) {
        sources[article.originalSource] = (sources[article.originalSource] || 0) + 1;
      }
    });
    
    console.log('📰 来源统计:');
    Object.entries(sources).forEach(([source, count]) => {
      console.log(`   - ${source}: ${count}篇`);
    });
    console.log('');
    
    console.log('🌐 访问网站: http://localhost:3000/news');
    
  } catch (error) {
    console.error('❌ 预览失败:', error.message);
  }
}

if (require.main === module) {
  previewNews();
}

module.exports = { previewNews };