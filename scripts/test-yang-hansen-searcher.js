const YangHansenNewsSearcher = require('../lib/yang-hansen-news-searcher');

/**
 * 测试Yang Hansen新闻搜索器
 */
async function testYangHansenSearcher() {
  console.log('=== Yang Hansen新闻搜索器测试 ===\n');

  const searcher = new YangHansenNewsSearcher();

  try {
    // 1. 测试多策略搜索
    console.log('1. 测试多策略搜索...');
    const multiSearchResult = await searcher.searchWithMultipleStrategies({
      maxArticlesPerStrategy: 3,
      totalMaxArticles: 10,
      relevanceThreshold: 0.4,
      timeRange: 30
    });

    console.log('\n搜索策略结果:');
    multiSearchResult.searchResults.forEach(result => {
      console.log(`  ${result.strategy}: ${result.found} 篇 (总计: ${result.total})`);
      if (result.error) {
        console.log(`    错误: ${result.error}`);
      }
    });

    console.log('\n处理统计:');
    const stats = multiSearchResult.statistics;
    console.log(`  原始文章数: ${stats.totalFound}`);
    console.log(`  去重后: ${stats.afterDeduplication}`);
    console.log(`  相关性过滤后: ${stats.afterRelevanceFilter}`);
    console.log(`  相关性阈值: ${stats.relevanceThreshold}`);

    console.log('\n最终文章列表:');
    multiSearchResult.processedArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   来源: ${article.source.name}`);
      console.log(`   时间: ${new Date(article.publishedAt).toLocaleDateString()}`);
      console.log(`   相关性: ${article.relevanceScore.toFixed(3)}`);
      console.log(`   策略: ${article.searchStrategy} (权重: ${article.strategyWeight})`);
      console.log(`   URL: ${article.url}`);
      console.log('');
    });

    // 2. 测试最新新闻搜索
    console.log('\n2. 测试最新新闻搜索...');
    const latestResult = await searcher.searchLatestNews(5);
    
    console.log(`找到 ${latestResult.processedArticles.length} 篇最新新闻:`);
    latestResult.processedArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   时间: ${new Date(article.publishedAt).toLocaleDateString()}`);
      console.log(`   相关性: ${article.relevanceScore.toFixed(3)}`);
      console.log('');
    });

    // 3. 测试分类搜索
    console.log('\n3. 测试分类搜索...');
    const categories = ['draft', 'summer_league', 'blazers'];
    
    for (const category of categories) {
      try {
        console.log(`\n搜索 ${category} 类别新闻:`);
        const categoryResult = await searcher.searchByCategory(category, 3);
        
        if (categoryResult.articles.length > 0) {
          console.log(`✓ 找到 ${categoryResult.articles.length} 篇相关文章:`);
          categoryResult.articles.forEach((article, index) => {
            console.log(`  ${index + 1}. ${article.title}`);
            console.log(`     相关性: ${article.relevanceScore.toFixed(3)}`);
          });
        } else {
          console.log(`✗ 未找到 ${category} 类别的相关文章`);
          if (categoryResult.error) {
            console.log(`     错误: ${categoryResult.error}`);
          }
        }
        
        // 避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`分类 ${category} 搜索失败:`, error.message);
      }
    }

    // 4. 显示搜索统计
    console.log('\n4. 搜索统计信息:');
    const searchStats = searcher.getSearchStats();
    console.log('API使用情况:', searchStats.apiUsage);
    console.log('\n搜索策略配置:');
    searchStats.strategies.forEach(strategy => {
      console.log(`  ${strategy.name}: "${strategy.query}" (权重: ${strategy.weight})`);
    });

    console.log('\n=== 测试完成 ===');
    console.log('✓ Yang Hansen新闻搜索器工作正常！');

  } catch (error) {
    console.error('✗ 测试过程中发生错误:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
if (require.main === module) {
  testYangHansenSearcher();
}

module.exports = { testYangHansenSearcher };