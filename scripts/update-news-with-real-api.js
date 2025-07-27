#!/usr/bin/env node

const NewsAPIService = require('../lib/newsapi-service');
const fs = require('fs').promises;
const path = require('path');

/**
 * 使用NewsAPI获取真实的篮球新闻数据
 * 由于Yang Hansen不是真实球员，我们获取相关的篮球新闻
 */
async function updateNewsWithRealAPI() {
  console.log('🔄 使用NewsAPI获取真实篮球新闻...\n');

  const newsService = new NewsAPIService();

  try {
    // 1. 验证API连接
    console.log('1. 验证NewsAPI连接...');
    const isValid = await newsService.validateApiKey();
    if (!isValid) {
      throw new Error('NewsAPI密钥验证失败');
    }
    console.log('✅ NewsAPI连接成功');

    // 2. 搜索相关的篮球新闻
    console.log('\n2. 搜索篮球相关新闻...');
    
    const searchQueries = [
      'NBA Portland Trail Blazers',
      'Chinese basketball NBA',
      'NBA draft 2025',
      'Portland Blazers center',
      'NBA international players'
    ];

    let allArticles = [];
    
    for (const query of searchQueries) {
      console.log(`   搜索: "${query}"`);
      
      const result = await newsService.searchYangHansenNews({
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 5,
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 最近7天
      });
      
      if (result.success && result.articles.length > 0) {
        console.log(`   ✅ 找到 ${result.articles.length} 篇文章`);
        allArticles.push(...result.articles);
      } else {
        console.log(`   ⚠️  未找到相关文章`);
      }
      
      // 避免API限制，稍作延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n总共获取到 ${allArticles.length} 篇文章`);

    // 3. 处理和格式化文章
    console.log('\n3. 处理文章数据...');
    
    // 去重
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.url === article.url)
    );
    
    console.log(`去重后剩余 ${uniqueArticles.length} 篇文章`);

    // 选择最好的文章
    const processedArticles = uniqueArticles
      .filter(article => 
        article.title && 
        article.description && 
        article.urlToImage &&
        !article.title.toLowerCase().includes('[removed]')
      )
      .slice(0, 10) // 最多10篇
      .map((article, index) => ({
        id: `newsapi-article-${Date.now()}-${index}`,
        title: article.title,
        summary: article.description,
        content: article.content || article.description,
        image: article.urlToImage,
        date: article.publishedAt,
        category: getCategoryFromTitle(article.title),
        readTime: estimateReadTime(article.content || article.description),
        author: article.source.name,
        url: article.url,
        slug: generateSlug(article.title),
        tags: generateTags(article.title, article.description),
        relevanceScore: calculateRelevance(article.title, article.description),
        source: {
          name: article.source.name,
          url: article.url
        }
      }));

    console.log(`处理后剩余 ${processedArticles.length} 篇文章`);

    // 4. 选择头条新闻
    const featuredArticle = processedArticles.length > 0 ? 
      processedArticles.reduce((best, current) => 
        current.relevanceScore > best.relevanceScore ? current : best
      ) : null;

    // 5. 生成最终数据结构
    const newsData = {
      lastUpdated: new Date().toISOString(),
      dataSource: "newsapi_real_time",
      
      featured: featuredArticle,
      
      articles: processedArticles.filter(article => 
        !featuredArticle || article.id !== featuredArticle.id
      ).slice(0, 8), // 最多8篇其他文章
      
      trending: generateTrendingTopics(processedArticles),
      
      statistics: {
        total: processedArticles.length,
        categories: getCategoryStats(processedArticles),
        sources: [...new Set(processedArticles.map(a => a.author))],
        averageRelevance: processedArticles.reduce((sum, a) => sum + a.relevanceScore, 0) / processedArticles.length,
        timeRange: {
          oldest: processedArticles.reduce((oldest, a) => 
            !oldest || new Date(a.date) < new Date(oldest) ? a.date : oldest, null),
          newest: processedArticles.reduce((newest, a) => 
            !newest || new Date(a.date) > new Date(newest) ? a.date : newest, null)
        }
      }
    };

    // 6. 保存数据
    console.log('\n4. 保存新闻数据...');
    
    // 备份现有数据
    try {
      const existingData = await fs.readFile('data/news.json', 'utf8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await fs.writeFile(`data/news-backup-${timestamp}.json`, existingData, 'utf8');
      console.log('✅ 已备份现有数据');
    } catch (error) {
      console.log('ℹ️  未找到现有数据，跳过备份');
    }

    // 保存新数据
    await fs.writeFile('data/news.json', JSON.stringify(newsData, null, 2), 'utf8');
    console.log('✅ 新闻数据已保存');

    // 7. 生成报告
    const report = {
      timestamp: new Date().toISOString(),
      success: true,
      dataSource: "NewsAPI",
      totalArticles: processedArticles.length,
      featuredArticle: featuredArticle?.title || null,
      categories: Object.keys(newsData.statistics.categories),
      sources: newsData.statistics.sources,
      averageRelevance: newsData.statistics.averageRelevance,
      apiUsage: newsService.getUsageStats()
    };

    await fs.writeFile('data/newsapi-update-report.json', JSON.stringify(report, null, 2), 'utf8');

    console.log('\n=== 更新完成 ===');
    console.log(`✅ 成功获取 ${report.totalArticles} 篇真实新闻`);
    console.log(`📰 头条新闻: ${report.featuredArticle || '无'}`);
    console.log(`📊 新闻来源: ${report.sources.join(', ')}`);
    console.log(`🎯 平均相关性: ${report.averageRelevance.toFixed(3)}`);
    console.log(`📈 API使用: ${report.apiUsage.used}/${report.apiUsage.limit}`);

    console.log('\n🎉 NewsAPI新闻更新成功！');
    console.log('现在访问 /news 页面将显示来自NewsAPI的真实新闻内容');

    return { success: true, report };

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 辅助函数
function getCategoryFromTitle(title) {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('draft')) return 'draft';
  if (titleLower.includes('trade') || titleLower.includes('signing')) return 'trade';
  if (titleLower.includes('game') || titleLower.includes('score')) return 'game';
  if (titleLower.includes('injury')) return 'injury';
  if (titleLower.includes('playoff')) return 'playoff';
  return 'general';
}

function estimateReadTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes}分钟`;
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

function generateTags(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const commonTags = ['nba', 'basketball', 'portland', 'blazers', 'trail blazers', 'player', 'game', 'season'];
  return commonTags.filter(tag => text.includes(tag));
}

function calculateRelevance(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0.5; // 基础分数
  
  // 篮球相关关键词
  if (text.includes('nba')) score += 0.2;
  if (text.includes('basketball')) score += 0.15;
  if (text.includes('portland') || text.includes('blazers')) score += 0.15;
  if (text.includes('player')) score += 0.1;
  
  return Math.min(score, 1.0);
}

function generateTrendingTopics(articles) {
  const topics = new Set();
  articles.forEach(article => {
    article.tags.forEach(tag => topics.add(tag));
  });
  return Array.from(topics).slice(0, 10);
}

function getCategoryStats(articles) {
  const stats = {};
  articles.forEach(article => {
    stats[article.category] = (stats[article.category] || 0) + 1;
  });
  return stats;
}

// 运行更新
if (require.main === module) {
  updateNewsWithRealAPI().then(result => {
    if (result.success) {
      console.log('\n✅ NewsAPI新闻更新成功！');
      process.exit(0);
    } else {
      console.log('\n❌ NewsAPI新闻更新失败');
      process.exit(1);
    }
  });
}

module.exports = { updateNewsWithRealAPI };