const NewsDataPipeline = require('../lib/news-data-pipeline');

/**
 * 生成网站兼容的数据格式
 */
function generateWebsiteCompatibleData(data) {
  return {
    lastUpdated: data.lastUpdated,
    
    // 头条新闻
    featured: data.featured ? {
      id: data.featured.id,
      title: data.featured.title,
      summary: data.featured.summary,
      content: data.featured.content,
      image: data.featured.imageUrl,
      date: data.featured.publishedAt,
      category: data.featured.category,
      readTime: data.featured.readTime,
      author: data.featured.source.name,
      url: data.featured.url,
      slug: data.featured.slug,
      relevanceScore: data.featured.relevanceScore,
      tags: data.featured.tags
    } : null,

    // 文章列表
    articles: data.articles.map(article => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      content: article.content,
      image: article.imageUrl,
      date: article.publishedAt,
      category: article.category,
      readTime: article.readTime,
      author: article.source.name,
      url: article.url,
      slug: article.slug,
      relevanceScore: article.relevanceScore,
      tags: article.tags
    })),

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
 * 更新新闻并生成完整正文内容
 */
async function updateNewsWithFullContent() {
  console.log('=== 更新Yang Hansen新闻（包含完整正文）===\n');

  const pipeline = new NewsDataPipeline({
    relevanceThreshold: 0.4,
    maxArticles: 15,
    timeRange: 30,
    outputPath: 'data/news.json',
    backupPath: 'data/backups'
  });

  try {
    const result = await pipeline.processNews();

    if (result.success) {
      console.log('\n=== 更新成功 ===');
      console.log(result.report.summary);

      // 生成网站兼容的数据格式
      console.log('\n=== 生成网站兼容格式 ===');
      const websiteData = generateWebsiteCompatibleData(result.data);
      
      // 保存网站格式的数据
      const fs = require('fs').promises;
      await fs.writeFile('data/news.json', JSON.stringify(websiteData, null, 2), 'utf8');
      console.log('✓ 网站兼容数据已保存');

      // 显示内容增强效果
      console.log('\n=== 内容增强效果展示 ===');
      const data = result.data;
      
      if (data.featured) {
        console.log('\n头条新闻内容预览:');
        console.log(`标题: ${data.featured.title}`);
        console.log(`原始内容长度: ${data.featured.originalContent ? data.featured.originalContent.length : 0} 字符`);
        console.log(`增强内容长度: ${data.featured.content.length} 字符`);
        console.log(`内容预览: ${data.featured.content.substring(0, 200)}...`);
      }

      console.log('\n其他文章内容统计:');
      data.articles.slice(0, 3).forEach((article, index) => {
        console.log(`${index + 1}. ${article.title.substring(0, 40)}...`);
        console.log(`   原始: ${article.originalContent ? article.originalContent.length : 0} 字符 → 增强: ${article.content.length} 字符`);
      });

      console.log('\n✅ 新闻内容已成功增强！现在每篇文章都有完整的正文内容。');
      console.log('💡 建议: 运行 `npm run dev` 查看网站效果');

    } else {
      console.error('❌ 更新失败:', result.error);
    }

  } catch (error) {
    console.error('❌ 处理过程中发生错误:', error.message);
  }
}

// 运行更新
if (require.main === module) {
  updateNewsWithFullContent();
}

module.exports = { updateNewsWithFullContent };