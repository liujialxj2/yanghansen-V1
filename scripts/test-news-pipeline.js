const NewsDataPipeline = require('../lib/news-data-pipeline');
const fs = require('fs').promises;

/**
 * 测试新闻数据处理管道
 */
async function testNewsDataPipeline() {
  console.log('=== 新闻数据处理管道测试 ===\n');

  const pipeline = new NewsDataPipeline({
    relevanceThreshold: 0.4,
    maxArticles: 15,
    timeRange: 30,
    outputPath: 'data/test-news.json'
  });

  try {
    // 执行完整的处理流程
    const result = await pipeline.processNews();

    if (result.success) {
      console.log('\n=== 处理成功 ===');
      console.log(result.report.summary);

      // 显示详细数据结构
      console.log('\n=== 数据结构分析 ===');
      const data = result.data;
      
      console.log(`\n头条新闻:`);
      if (data.featured) {
        console.log(`  标题: ${data.featured.title}`);
        console.log(`  来源: ${data.featured.source.name}`);
        console.log(`  相关性: ${data.featured.relevanceScore.toFixed(3)}`);
        console.log(`  分类: ${data.featured.category}`);
        console.log(`  标签: ${data.featured.tags.join(', ')}`);
      } else {
        console.log('  无头条新闻');
      }

      console.log(`\n文章列表 (${data.articles.length} 篇):`);
      data.articles.slice(0, 5).forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   来源: ${article.source.name} | 相关性: ${article.relevanceScore.toFixed(3)}`);
        console.log(`   分类: ${article.category} | 阅读时间: ${article.readTime}`);
        console.log(`   发布: ${new Date(article.publishedAt).toLocaleDateString()}`);
        console.log(`   URL: ${article.url}`);
        console.log('');
      });

      if (data.articles.length > 5) {
        console.log(`   ... 还有 ${data.articles.length - 5} 篇文章`);
      }

      console.log(`\n热门话题:`);
      console.log(`  ${data.trending.join(', ')}`);

      console.log(`\n分类统计:`);
      Object.entries(data.categories).forEach(([category, articles]) => {
        console.log(`  ${category}: ${articles.length} 篇`);
      });

      console.log(`\n来源统计:`);
      data.statistics.sources.forEach(source => {
        const count = data.articles.filter(a => a.source.name === source).length;
        console.log(`  ${source}: ${count} 篇`);
      });

      console.log(`\n时间范围:`);
      console.log(`  最早: ${new Date(data.statistics.timeRange.oldest).toLocaleDateString()}`);
      console.log(`  最新: ${new Date(data.statistics.timeRange.newest).toLocaleDateString()}`);

      // 验证数据文件
      console.log('\n=== 验证保存的数据文件 ===');
      try {
        const savedData = await fs.readFile('data/test-news.json', 'utf8');
        const parsedData = JSON.parse(savedData);
        
        console.log('✓ 数据文件格式正确');
        console.log(`✓ 包含 ${parsedData.articles.length + (parsedData.featured ? 1 : 0)} 篇文章`);
        console.log(`✓ 最后更新: ${parsedData.lastUpdated}`);
        
        // 验证数据完整性
        const requiredFields = ['id', 'title', 'summary', 'url', 'publishedAt', 'source', 'category', 'relevanceScore'];
        const allArticles = parsedData.featured ? [parsedData.featured, ...parsedData.articles] : parsedData.articles;
        
        let validArticles = 0;
        allArticles.forEach(article => {
          const hasAllFields = requiredFields.every(field => article.hasOwnProperty(field));
          if (hasAllFields) validArticles++;
        });
        
        console.log(`✓ ${validArticles}/${allArticles.length} 篇文章包含所有必需字段`);
        
      } catch (error) {
        console.error('✗ 数据文件验证失败:', error.message);
      }

      // 测试不同配置
      console.log('\n=== 测试不同配置 ===');
      
      console.log('\n测试高阈值配置...');
      const highThresholdResult = await pipeline.processNews({
        relevanceThreshold: 0.6,
        maxArticles: 10,
        outputPath: 'data/test-news-high-threshold.json'
      });
      
      if (highThresholdResult.success) {
        console.log(`✓ 高阈值处理成功，获得 ${highThresholdResult.data.articles.length + (highThresholdResult.data.featured ? 1 : 0)} 篇文章`);
        console.log(`  平均相关性: ${highThresholdResult.data.statistics.averageRelevance.toFixed(3)}`);
      }

      console.log('\n测试短时间范围配置...');
      const shortTimeResult = await pipeline.processNews({
        relevanceThreshold: 0.4,
        maxArticles: 8,
        timeRange: 7, // 最近一周
        outputPath: 'data/test-news-recent.json'
      });
      
      if (shortTimeResult.success) {
        console.log(`✓ 短时间范围处理成功，获得 ${shortTimeResult.data.articles.length + (shortTimeResult.data.featured ? 1 : 0)} 篇文章`);
        console.log(`  时间范围: ${new Date(shortTimeResult.data.statistics.timeRange.oldest).toLocaleDateString()} - ${new Date(shortTimeResult.data.statistics.timeRange.newest).toLocaleDateString()}`);
      }

      console.log('\n=== 所有测试完成 ===');
      console.log('✓ 新闻数据处理管道工作正常！');

    } else {
      console.error('✗ 处理失败:', result.error);
      console.error('统计信息:', result.stats);
    }

  } catch (error) {
    console.error('✗ 测试过程中发生错误:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
if (require.main === module) {
  testNewsDataPipeline();
}

module.exports = { testNewsDataPipeline };