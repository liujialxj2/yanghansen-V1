const NewsAPIService = require('../lib/newsapi-service');

/**
 * 测试不同的Yang Hansen搜索策略
 */
async function testDifferentSearchStrategies() {
  console.log('=== 测试不同的Yang Hansen搜索策略 ===\n');

  const newsService = new NewsAPIService();

  // 不同的搜索策略
  const searchStrategies = [
    {
      name: '策略1: 直接搜索Yang Hansen',
      query: 'Yang Hansen',
      language: 'en'
    },
    {
      name: '策略2: 搜索中文名',
      query: '杨瀚森',
      language: 'zh'
    },
    {
      name: '策略3: 篮球相关搜索',
      query: 'Yang Hansen basketball',
      language: 'en'
    },
    {
      name: '策略4: 中国篮球搜索',
      query: 'Yang Hansen China basketball',
      language: 'en'
    },
    {
      name: '策略5: NBA相关搜索',
      query: 'Yang Hansen NBA draft',
      language: 'en'
    },
    {
      name: '策略6: 扩大时间范围',
      query: 'Yang Hansen',
      language: 'en',
      from: '2020-01-01'
    },
    {
      name: '策略7: 搜索所有语言',
      query: 'Yang Hansen OR 杨瀚森',
      // 不指定语言
    },
    {
      name: '策略8: 中锋相关搜索',
      query: 'Yang Hansen center basketball China',
      language: 'en'
    }
  ];

  for (const strategy of searchStrategies) {
    try {
      console.log(`\n${strategy.name}:`);
      console.log(`查询: "${strategy.query}"`);
      console.log(`语言: ${strategy.language || '所有语言'}`);
      
      const searchOptions = {
        q: strategy.query,
        pageSize: 5,
        sortBy: 'relevancy'
      };
      
      if (strategy.language) {
        searchOptions.language = strategy.language;
      }
      
      if (strategy.from) {
        searchOptions.from = strategy.from;
      }

      const result = await newsService.searchYangHansenNews(searchOptions);
      
      if (result.success && result.articles.length > 0) {
        console.log(`✓ 找到 ${result.articles.length} 篇文章 (总计: ${result.totalResults})`);
        
        result.articles.forEach((article, index) => {
          console.log(`  ${index + 1}. ${article.title}`);
          console.log(`     来源: ${article.source.name}`);
          console.log(`     时间: ${new Date(article.publishedAt).toLocaleDateString()}`);
          
          // 检查是否真的包含Yang Hansen
          const content = (article.title + ' ' + (article.description || '')).toLowerCase();
          const hasYangHansen = content.includes('yang hansen') || content.includes('杨瀚森');
          console.log(`     包含Yang Hansen: ${hasYangHansen ? '✓' : '✗'}`);
          console.log('');
        });
      } else {
        console.log('✗ 没有找到相关文章');
        if (!result.success) {
          console.log(`错误: ${result.error}`);
        }
      }
      
      // 等待一下避免API限制
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`✗ 策略执行失败: ${error.message}`);
    }
  }

  console.log('\n=== 搜索策略测试完成 ===');
  console.log('配额使用情况:', newsService.getUsageStats());
}

// 运行测试
if (require.main === module) {
  testDifferentSearchStrategies();
}

module.exports = { testDifferentSearchStrategies };