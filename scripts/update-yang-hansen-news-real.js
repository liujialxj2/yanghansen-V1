#!/usr/bin/env node

/**
 * 使用Yang Hansen专用搜索器更新新闻数据
 * 获取真正与杨瀚森相关的新闻内容
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs').promises;
const path = require('path');
const YangHansenNewsSearcher = require('../lib/yang-hansen-news-searcher');

async function updateYangHansenNews() {
  console.log('=== 更新杨瀚森真实新闻数据 ===\n');

  try {
    // 初始化搜索器
    const searcher = new YangHansenNewsSearcher();
    
    // 搜索最新的杨瀚森新闻
    console.log('1. 搜索最新杨瀚森新闻...');
    const searchResult = await searcher.searchWithMultipleStrategies({
      maxArticlesPerStrategy: 8,
      totalMaxArticles: 20,
      relevanceThreshold: 0.3,
      timeRange: 30 // 最近30天 (NewsAPI免费计划限制)
    });

    if (searchResult.processedArticles.length === 0) {
      console.log('❌ 未找到相关新闻');
      return;
    }

    console.log(`✓ 找到 ${searchResult.processedArticles.length} 篇相关新闻`);

    // 转换为网站数据格式
    console.log('\n2. 转换数据格式...');
    const newsData = await convertToWebsiteFormat(searchResult.processedArticles);

    // 保存数据
    console.log('\n3. 保存新闻数据...');
    const dataPath = path.join(process.cwd(), 'data', 'news.json');
    await fs.writeFile(dataPath, JSON.stringify(newsData, null, 2), 'utf8');

    console.log('✓ 新闻数据已更新');

    // 显示统计信息
    console.log('\n=== 更新统计 ===');
    console.log(`总文章数: ${newsData.articles.length}`);
    console.log(`精选文章: ${newsData.featured.title}`);
    console.log(`平均相关性: ${newsData.statistics.averageRelevance.toFixed(3)}`);
    console.log(`数据来源: ${newsData.statistics.sources.join(', ')}`);
    console.log(`API使用: ${searchResult.statistics.apiUsage.used}/${searchResult.statistics.apiUsage.limit}`);

    // 显示文章列表
    console.log('\n=== 文章列表 ===');
    newsData.articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   来源: ${article.source.name} | 相关性: ${article.relevanceScore.toFixed(3)} | 时间: ${new Date(article.date).toLocaleDateString()}`);
    });

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    process.exit(1);
  }
}

/**
 * 转换搜索结果为网站数据格式
 */
async function convertToWebsiteFormat(articles) {
  // 按相关性排序
  const sortedArticles = articles.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // 选择最相关的文章作为精选
  const featuredArticle = sortedArticles[0];
  
  // 转换文章格式
  const convertedArticles = sortedArticles.map((article, index) => ({
    id: `yang-hansen-${Date.now()}-${index}`,
    title: article.title,
    summary: article.description || article.content?.substring(0, 200) + '...' || '暂无摘要',
    content: article.content || article.description || '内容详情请查看原文',
    image: article.urlToImage || getDefaultImage(),
    date: article.publishedAt,
    category: getCategoryFromContent(article),
    readTime: estimateReadTime(article.content || article.description || ''),
    author: article.source?.name || 'Unknown',
    url: article.url,
    slug: generateSlug(article.title),
    tags: generateTags(article),
    relevanceScore: article.relevanceScore,
    source: {
      name: article.source?.name || 'Unknown',
      url: article.url
    }
  }));

  // 生成趋势标签
  const allTags = convertedArticles.flatMap(a => a.tags);
  const tagCounts = {};
  allTags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  const trending = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  // 统计信息
  const sources = [...new Set(convertedArticles.map(a => a.source.name))];
  const categories = {};
  convertedArticles.forEach(a => {
    categories[a.category] = (categories[a.category] || 0) + 1;
  });
  
  const averageRelevance = convertedArticles.reduce((sum, a) => sum + a.relevanceScore, 0) / convertedArticles.length;

  return {
    lastUpdated: new Date().toISOString(),
    dataSource: "yang_hansen_specialized_search",
    featured: {
      ...convertedArticles[0],
      id: `featured-${Date.now()}`
    },
    articles: convertedArticles.slice(1), // 除了精选的其他文章
    trending,
    statistics: {
      total: convertedArticles.length,
      categories,
      sources,
      averageRelevance,
      timeRange: {
        oldest: Math.min(...convertedArticles.map(a => new Date(a.date).getTime())),
        newest: Math.max(...convertedArticles.map(a => new Date(a.date).getTime()))
      }
    }
  };
}

/**
 * 根据内容判断分类
 */
function getCategoryFromContent(article) {
  const title = (article.title || '').toLowerCase();
  const content = (article.content || article.description || '').toLowerCase();
  const text = title + ' ' + content;

  if (text.includes('draft') || text.includes('选秀')) return 'draft';
  if (text.includes('summer league') || text.includes('夏季联赛')) return 'summer_league';
  if (text.includes('blazers') || text.includes('开拓者')) return 'team';
  if (text.includes('performance') || text.includes('stats') || text.includes('表现')) return 'performance';
  if (text.includes('interview') || text.includes('采访')) return 'interview';
  
  return 'general';
}

/**
 * 生成标签
 */
function generateTags(article) {
  const tags = ['杨瀚森', 'Yang Hansen'];
  const text = ((article.title || '') + ' ' + (article.content || article.description || '')).toLowerCase();

  if (text.includes('nba')) tags.push('NBA');
  if (text.includes('blazers') || text.includes('portland')) tags.push('开拓者');
  if (text.includes('draft')) tags.push('选秀');
  if (text.includes('summer league')) tags.push('夏季联赛');
  if (text.includes('chinese jokic')) tags.push('中国约基奇');
  if (text.includes('basketball')) tags.push('篮球');
  if (text.includes('center')) tags.push('中锋');
  if (text.includes('china')) tags.push('中国');

  return [...new Set(tags)];
}

/**
 * 生成URL slug
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

/**
 * 估算阅读时间
 */
function estimateReadTime(content) {
  const wordsPerMinute = 200;
  const wordCount = (content || '').split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes}分钟`;
}

/**
 * 获取默认图片
 */
function getDefaultImage() {
  return 'https://via.placeholder.com/800x400/1f2937/ffffff?text=Yang+Hansen+News';
}

// 执行更新
if (require.main === module) {
  updateYangHansenNews();
}

module.exports = { updateYangHansenNews };