#!/usr/bin/env node

/**
 * Yang Hansen新闻每日更新脚本
 * 简化版本，适合每天手动或自动执行
 */

const NewsDataPipeline = require('../lib/news-data-pipeline');
const fs = require('fs').promises;
const path = require('path');

async function dailyNewsUpdate() {
  console.log('🔄 开始每日新闻更新...\n');
  
  const startTime = new Date();
  
  try {
    // 配置管道
    const pipeline = new NewsDataPipeline({
      relevanceThreshold: 0.4,
      maxArticles: 15, // 每日更新数量适中
      timeRange: 7,    // 最近7天的新闻
      outputPath: 'data/news.json'
    });

    // 执行更新
    const result = await pipeline.processNews();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    // 转换为网站格式
    const websiteData = {
      lastUpdated: new Date().toISOString(),
      featured: result.data.featured ? convertArticle(result.data.featured) : null,
      articles: result.data.articles.map(convertArticle),
      trending: result.data.trending,
      statistics: result.data.statistics
    };

    // 保存数据
    await fs.writeFile('data/news.json', JSON.stringify(websiteData, null, 2));
    
    // 自动检测和更新图片域名
    console.log('\n🖼️  检测图片域名配置...');
    try {
      const { updateImageDomains } = require('./update-image-domains');
      await updateImageDomains();
    } catch (error) {
      console.warn('图片域名检测失败:', error.message);
    }
    
    // 计算用时
    const duration = Math.round((new Date() - startTime) / 1000);
    
    // 输出结果
    console.log('✅ 每日新闻更新完成！');
    console.log(`📊 更新统计:`);
    console.log(`   - 处理时间: ${duration}秒`);
    console.log(`   - 新闻总数: ${websiteData.articles.length + (websiteData.featured ? 1 : 0)}篇`);
    console.log(`   - 头条新闻: ${websiteData.featured ? websiteData.featured.title.substring(0, 50) + '...' : '无'}`);
    console.log(`   - 新闻来源: ${result.data.statistics.sources.slice(0, 3).join(', ')}等`);
    console.log(`   - 平均相关性: ${result.data.statistics.averageRelevance.toFixed(2)}`);
    
    return { success: true, count: websiteData.articles.length };
    
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 转换文章格式
function convertArticle(article) {
  return {
    id: article.id,
    title: article.title,
    description: article.summary,
    summary: article.summary,
    contentSnippet: article.content,
    hasFullContent: false,
    url: article.url,
    originalSource: article.source.name,
    image: article.imageUrl,
    date: article.publishedAt,
    category: article.category,
    tags: article.tags,
    author: article.source.name,
    readTime: article.readTime,
    slug: article.slug,
    relevanceScore: article.relevanceScore,
    isRealContent: true,
    contentType: "snippet"
  };
}

// 如果直接运行此脚本
if (require.main === module) {
  dailyNewsUpdate();
}

module.exports = { dailyNewsUpdate };