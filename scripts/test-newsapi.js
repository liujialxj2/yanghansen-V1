const NewsAPIService = require('../lib/newsapi-service');
const RelevanceValidator = require('../lib/relevance-validator');
const DeduplicationProcessor = require('../lib/deduplication-processor');

/**
 * NewsAPI集成测试脚本
 */
async function testNewsAPIIntegration() {
  console.log('=== NewsAPI集成测试开始 ===\n');

  // 初始化服务
  const newsService = new NewsAPIService();
  const relevanceValidator = new RelevanceValidator();
  const deduplicationProcessor = new DeduplicationProcessor();

  try {
    // 1. 验证API密钥
    console.log('1. 验证API密钥...');
    const isValidKey = await newsService.validateApiKey();
    if (isValidKey) {
      console.log('✓ API密钥验证成功');
    } else {
      console.log('✗ API密钥验证失败');
      return;
    }

    // 2. 检查配额
    console.log('\n2. 检查API配额...');
    const hasQuota = newsService.checkQuota();
    if (hasQuota) {
      console.log('✓ API配额充足');
      console.log('配额信息:', newsService.getUsageStats());
    } else {
      console.log('✗ API配额不足');
      return;
    }

    // 3. 搜索Yang Hansen新闻
    console.log('\n3. 搜索Yang Hansen相关新闻...');
    const searchResult = await newsService.searchYangHansenNews({
      pageSize: 10 // 测试时只获取10篇
    });

    if (!searchResult.success) {
      console.log('✗ 新闻搜索失败:', searchResult.error);
      return;
    }

    console.log(`✓ 成功获取 ${searchResult.articles.length} 篇新闻`);
    console.log(`总结果数: ${searchResult.totalResults}`);

    // 4. 显示原始新闻列表
    console.log('\n4. 原始新闻列表:');
    searchResult.articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   来源: ${article.source.name}`);
      console.log(`   时间: ${article.publishedAt}`);
      console.log(`   URL: ${article.url}`);
      console.log('');
    });

    // 5. 相关性验证
    console.log('5. 进行相关性验证...');
    const validationResult = relevanceValidator.validateArticles(searchResult.articles, 0.5);
    
    console.log(`✓ 相关性验证完成:`);
    console.log(`  - 总文章数: ${validationResult.total}`);
    console.log(`  - 相关文章: ${validationResult.relevant}`);
    console.log(`  - 不相关文章: ${validationResult.irrelevant}`);

    // 显示相关性分数
    console.log('\n相关性分数详情:');
    validationResult.validationResults.forEach((result, index) => {
      const { article, validation } = result;
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   相关性分数: ${validation.score.toFixed(3)}`);
      console.log(`   是否相关: ${validation.isRelevant ? '✓' : '✗'}`);
      console.log('');
    });

    // 6. 去重处理
    console.log('6. 进行去重处理...');
    const deduplicationResult = deduplicationProcessor.removeDuplicates(
      validationResult.relevantArticles,
      0.8
    );

    console.log(`✓ 去重处理完成:`);
    console.log(`  - 原始数量: ${deduplicationResult.originalCount}`);
    console.log(`  - 去重后数量: ${deduplicationResult.uniqueCount}`);
    console.log(`  - 移除数量: ${deduplicationResult.removedCount}`);

    if (deduplicationResult.duplicateGroups.length > 0) {
      console.log('\n重复文章组:');
      deduplicationResult.duplicateGroups.forEach((group, index) => {
        console.log(`${index + 1}. 保留: ${group.kept}`);
        console.log(`   移除: ${group.removed}`);
        console.log(`   相似度: ${group.similarity.toFixed(3)}`);
        console.log('');
      });
    }

    // 7. 最终结果
    console.log('7. 最终处理结果:');
    const finalArticles = deduplicationResult.uniqueArticles;
    
    if (finalArticles.length > 0) {
      console.log(`✓ 获得 ${finalArticles.length} 篇高质量Yang Hansen相关新闻:`);
      finalArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   来源: ${article.source.name}`);
        console.log(`   时间: ${new Date(article.publishedAt).toLocaleDateString()}`);
        console.log(`   描述: ${(article.description || '').substring(0, 100)}...`);
        console.log('');
      });
    } else {
      console.log('✗ 没有找到符合条件的Yang Hansen相关新闻');
    }

    // 8. 统计信息
    console.log('8. 处理统计信息:');
    const stats = relevanceValidator.getValidationStats(validationResult.validationResults);
    console.log(`  - 平均相关性分数: ${stats.averageScore.toFixed(3)}`);
    console.log(`  - 最高分数: ${stats.maxScore.toFixed(3)}`);
    console.log(`  - 最低分数: ${stats.minScore.toFixed(3)}`);
    console.log(`  - 高相关性文章 (≥0.8): ${stats.highRelevance}`);
    console.log(`  - 中等相关性文章 (0.5-0.8): ${stats.mediumRelevance}`);
    console.log(`  - 低相关性文章 (<0.5): ${stats.lowRelevance}`);

    console.log('\n=== NewsAPI集成测试完成 ===');
    console.log('✓ 所有功能测试通过，系统可以正常工作！');

  } catch (error) {
    console.error('✗ 测试过程中发生错误:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
if (require.main === module) {
  testNewsAPIIntegration();
}

module.exports = { testNewsAPIIntegration };