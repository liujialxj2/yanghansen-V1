const NewsDataPipeline = require('../lib/news-data-pipeline');

/**
 * 更新真实新闻内容（移除模板生成的正文）
 */
async function updateRealNewsContent() {
  console.log('=== 更新真实新闻内容（无模板生成）===\n');

  // 创建不使用内容增强的管道
  const pipeline = new NewsDataPipeline({
    relevanceThreshold: 0.4,
    maxArticles: 15,
    timeRange: 30,
    outputPath: 'data/news-temp.json',
    backupPath: 'data/backups'
  });

  try {
    // 临时禁用内容增强
    pipeline.contentEnhancer = null;

    const result = await pipeline.processNews();

    if (result.success) {
      console.log('\n=== 更新成功 ===');
      console.log(result.report.summary);

      // 生成真实内容的网站兼容格式
      console.log('\n=== 生成真实内容格式 ===');
      const websiteData = generateRealContentFormat(result.data);
      
      // 保存真实内容数据
      const fs = require('fs').promises;
      await fs.writeFile('data/news.json', JSON.stringify(websiteData, null, 2), 'utf8');
      console.log('✓ 真实新闻内容已保存');

      // 显示真实内容示例
      console.log('\n=== 真实内容示例 ===');
      if (websiteData.featured) {
        console.log(`头条: ${websiteData.featured.title}`);
        console.log(`描述: ${websiteData.featured.description}`);
        console.log(`内容片段: ${websiteData.featured.contentSnippet}`);
        console.log(`原文链接: ${websiteData.featured.url}`);
      }

      console.log('\n✅ 已移除模板生成的正文，现在显示NewsAPI的真实内容！');
      console.log('💡 用户可以通过"阅读完整文章"链接查看原文');

    } else {
      console.error('❌ 更新失败:', result.error);
    }

  } catch (error) {
    console.error('❌ 处理过程中发生错误:', error.message);
  }
}

/**
 * 生成基于真实内容的网站格式
 */
function generateRealContentFormat(data) {
  return {
    lastUpdated: data.lastUpdated,
    
    // 头条新闻 - 使用真实内容
    featured: data.featured ? formatRealArticle(data.featured) : null,

    // 文章列表 - 使用真实内容
    articles: data.articles.map(article => formatRealArticle(article)),

    // 热门话题
    trending: data.trending,

    // 统计信息
    statistics: {
      total: data.statistics.total,
      categories: data.statistics.byCategory,
      sources: data.statistics.sources,
      averageRelevance: data.statistics.averageRelevance,
      timeRange: data.statistics.timeRange,
      lastProcessed: data.processing.processedAt
    }
  };
}

/**
 * 格式化真实文章内容
 */
function formatRealArticle(article) {
  // 清理和处理NewsAPI的content字段
  let contentSnippet = '';
  let fullContentAvailable = false;
  
  if (article.content) {
    // 移除 "[+XXXX chars]" 标记
    contentSnippet = article.content.replace(/\[\+\d+\s+chars\]$/, '').trim();
    fullContentAvailable = article.content.includes('[+') && article.content.includes('chars]');
  }

  // 如果没有content，使用description
  if (!contentSnippet && article.description) {
    contentSnippet = article.description;
  }

  return {
    id: article.id,
    title: article.title,
    
    // 使用真实的描述和摘要
    description: article.description || article.summary || '',
    summary: article.summary || article.description || '',
    
    // 真实的内容片段
    contentSnippet: contentSnippet,
    hasFullContent: fullContentAvailable,
    
    // 原文信息
    url: article.url,
    originalSource: article.source?.name || 'Unknown',
    
    // 媒体信息
    image: article.imageUrl || article.urlToImage,
    
    // 时间信息
    date: article.publishedAt,
    
    // 分类和标签
    category: article.category,
    tags: article.tags || [],
    
    // 作者信息
    author: article.author || article.source?.name || 'Unknown',
    
    // 阅读信息
    readTime: estimateReadTime(contentSnippet),
    
    // SEO信息
    slug: article.slug || generateSlug(article.title),
    
    // 相关性信息
    relevanceScore: article.relevanceScore || 0,
    
    // 标记这是真实内容
    isRealContent: true,
    contentType: 'snippet' // 标记这是内容片段，不是完整文章
  };
}

/**
 * 估算阅读时间
 */
function estimateReadTime(content) {
  if (!content) return '1分钟';
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes}分钟`;
}

/**
 * 生成URL slug
 */
function generateSlug(title) {
  if (!title) return 'news-article';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

// 运行更新
if (require.main === module) {
  updateRealNewsContent();
}

module.exports = { updateRealNewsContent };