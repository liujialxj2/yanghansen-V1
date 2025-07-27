const YangHansenNewsSearcher = require('../lib/yang-hansen-news-searcher');
const EnhancedRelevanceValidator = require('../lib/enhanced-relevance-validator');
const RelevanceValidator = require('../lib/relevance-validator');

/**
 * 测试增强版相关性验证器
 */
async function testEnhancedRelevanceValidator() {
  console.log('=== 增强版相关性验证器测试 ===\n');

  const searcher = new YangHansenNewsSearcher();
  const originalValidator = new RelevanceValidator();
  const enhancedValidator = new EnhancedRelevanceValidator();

  try {
    // 1. 获取测试数据
    console.log('1. 获取测试新闻数据...');
    const searchResult = await searcher.searchWithMultipleStrategies({
      maxArticlesPerStrategy: 3,
      totalMaxArticles: 15,
      relevanceThreshold: 0.1, // 设置很低的阈值获取更多样本
      timeRange: 30
    });

    const testArticles = searchResult.processedArticles.slice(0, 10);
    console.log(`获得 ${testArticles.length} 篇测试文章\n`);

    // 2. 对比两种验证器的结果
    console.log('2. 对比原版和增强版验证器...\n');
    
    const comparisonResults = [];
    
    for (let i = 0; i < testArticles.length; i++) {
      const article = testArticles[i];
      
      // 原版验证器
      const originalResult = originalValidator.validateArticle(article, 0.5);
      
      // 增强版验证器
      const enhancedResult = enhancedValidator.validateArticle(article, 0.5);
      
      comparisonResults.push({
        article,
        original: originalResult,
        enhanced: enhancedResult
      });
      
      console.log(`文章 ${i + 1}: ${article.title.substring(0, 60)}...`);
      console.log(`来源: ${article.source.name}`);
      console.log(`原版分数: ${originalResult.score.toFixed(3)} (${originalResult.isRelevant ? '相关' : '不相关'})`);
      console.log(`增强版分数: ${enhancedResult.score.toFixed(3)} (${enhancedResult.isRelevant ? '相关' : '不相关'})`);
      console.log(`增强版解释: ${enhancedResult.explanation}`);
      
      // 显示详细分析
      if (enhancedResult.details) {
        console.log('详细分析:');
        console.log(`  - 精确匹配: ${enhancedResult.details.exactMatch.toFixed(3)}`);
        console.log(`  - 描述词匹配: ${enhancedResult.details.descriptorMatch.toFixed(3)}`);
        console.log(`  - 篮球相关性: ${enhancedResult.details.basketballRelevance.toFixed(3)}`);
        console.log(`  - 开拓者连接: ${enhancedResult.details.blazersConnection.toFixed(3)}`);
        console.log(`  - 来源可信度: ${enhancedResult.details.sourceCredibility.toFixed(3)}`);
        console.log(`  - 上下文奖励: ${enhancedResult.details.contextBonus.toFixed(3)}`);
        if (enhancedResult.details.negativePenalty > 0) {
          console.log(`  - 负面惩罚: ${enhancedResult.details.negativePenalty.toFixed(3)}`);
        }
      }
      
      console.log('---\n');
    }

    // 3. 统计对比结果
    console.log('3. 验证器性能对比统计:\n');
    
    const originalRelevant = comparisonResults.filter(r => r.original.isRelevant).length;
    const enhancedRelevant = comparisonResults.filter(r => r.enhanced.isRelevant).length;
    
    const originalScores = comparisonResults.map(r => r.original.score);
    const enhancedScores = comparisonResults.map(r => r.enhanced.score);
    
    const originalAvg = originalScores.reduce((sum, score) => sum + score, 0) / originalScores.length;
    const enhancedAvg = enhancedScores.reduce((sum, score) => sum + score, 0) / enhancedScores.length;
    
    console.log('相关文章数量:');
    console.log(`  原版验证器: ${originalRelevant}/${testArticles.length} (${(originalRelevant/testArticles.length*100).toFixed(1)}%)`);
    console.log(`  增强版验证器: ${enhancedRelevant}/${testArticles.length} (${(enhancedRelevant/testArticles.length*100).toFixed(1)}%)`);
    
    console.log('\n平均相关性分数:');
    console.log(`  原版验证器: ${originalAvg.toFixed(3)}`);
    console.log(`  增强版验证器: ${enhancedAvg.toFixed(3)}`);
    
    console.log('\n分数分布:');
    console.log('原版验证器:');
    console.log(`  高分 (≥0.8): ${originalScores.filter(s => s >= 0.8).length}`);
    console.log(`  中分 (0.5-0.8): ${originalScores.filter(s => s >= 0.5 && s < 0.8).length}`);
    console.log(`  低分 (<0.5): ${originalScores.filter(s => s < 0.5).length}`);
    
    console.log('增强版验证器:');
    console.log(`  高分 (≥0.8): ${enhancedScores.filter(s => s >= 0.8).length}`);
    console.log(`  中分 (0.5-0.8): ${enhancedScores.filter(s => s >= 0.5 && s < 0.8).length}`);
    console.log(`  低分 (<0.5): ${enhancedScores.filter(s => s < 0.5).length}`);

    // 4. 分析改进效果
    console.log('\n4. 改进效果分析:\n');
    
    let improvedCount = 0;
    let degradedCount = 0;
    let unchangedCount = 0;
    
    comparisonResults.forEach((result, index) => {
      const scoreDiff = result.enhanced.score - result.original.score;
      if (Math.abs(scoreDiff) < 0.05) {
        unchangedCount++;
      } else if (scoreDiff > 0) {
        improvedCount++;
        if (scoreDiff > 0.2) {
          console.log(`显著改进 ${index + 1}: ${result.article.title.substring(0, 50)}...`);
          console.log(`  分数提升: ${result.original.score.toFixed(3)} → ${result.enhanced.score.toFixed(3)} (+${scoreDiff.toFixed(3)})`);
        }
      } else {
        degradedCount++;
        if (scoreDiff < -0.2) {
          console.log(`显著降低 ${index + 1}: ${result.article.title.substring(0, 50)}...`);
          console.log(`  分数降低: ${result.original.score.toFixed(3)} → ${result.enhanced.score.toFixed(3)} (${scoreDiff.toFixed(3)})`);
        }
      }
    });
    
    console.log(`\n改进统计:`);
    console.log(`  改进: ${improvedCount} 篇`);
    console.log(`  降低: ${degradedCount} 篇`);
    console.log(`  不变: ${unchangedCount} 篇`);

    // 5. 推荐阈值测试
    console.log('\n5. 推荐阈值分析:\n');
    
    const recommendedThreshold = enhancedValidator.getRecommendedThreshold(testArticles);
    console.log(`推荐阈值: ${recommendedThreshold.toFixed(3)}`);
    
    const thresholds = [0.3, 0.4, 0.5, 0.6, 0.7];
    console.log('\n不同阈值下的相关文章数量:');
    
    thresholds.forEach(threshold => {
      const relevantCount = enhancedScores.filter(score => score >= threshold).length;
      console.log(`  阈值 ${threshold}: ${relevantCount}/${testArticles.length} 篇 (${(relevantCount/testArticles.length*100).toFixed(1)}%)`);
    });

    // 6. 详细统计信息
    console.log('\n6. 增强版验证器详细统计:\n');
    
    const batchResult = enhancedValidator.validateArticles(testArticles, 0.5);
    const stats = batchResult.statistics;
    
    console.log('分数统计:');
    console.log(`  平均分: ${stats.scoreStats.average.toFixed(3)}`);
    console.log(`  最高分: ${stats.scoreStats.max.toFixed(3)}`);
    console.log(`  最低分: ${stats.scoreStats.min.toFixed(3)}`);
    console.log(`  中位数: ${stats.scoreStats.median.toFixed(3)}`);
    
    console.log('\n特征统计:');
    console.log(`  精确匹配: ${stats.detailStats.exactMatches}/${testArticles.length}`);
    console.log(`  描述词匹配: ${stats.detailStats.descriptorMatches}/${testArticles.length}`);
    console.log(`  篮球相关: ${stats.detailStats.basketballRelevant}/${testArticles.length}`);
    console.log(`  开拓者相关: ${stats.detailStats.blazersConnected}/${testArticles.length}`);
    console.log(`  权威来源: ${stats.detailStats.authoritativeSources}/${testArticles.length}`);

    console.log('\n=== 测试完成 ===');
    console.log('✓ 增强版相关性验证器测试完成！');

  } catch (error) {
    console.error('✗ 测试过程中发生错误:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
if (require.main === module) {
  testEnhancedRelevanceValidator();
}

module.exports = { testEnhancedRelevanceValidator };