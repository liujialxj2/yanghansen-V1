const YangHansenVideoSearcher = require('../lib/yang-hansen-video-searcher');
const YouTubeAPIService = require('../lib/youtube-api-service');

/**
 * 测试YouTube API集成和视频搜索功能
 */
async function testYouTubeIntegration() {
  console.log('=== YouTube API集成测试 ===\n');

  try {
    // 1. 测试YouTube API服务
    console.log('1. 测试YouTube API服务...');
    const youtubeService = new YouTubeAPIService();
    
    // 健康检查
    const healthCheck = await youtubeService.healthCheck();
    console.log('API健康检查:', healthCheck);
    
    if (!healthCheck.apiKeyValid) {
      console.error('❌ YouTube API密钥无效，请检查环境变量YOUTUBE_API_KEY');
      return;
    }
    
    console.log('✅ YouTube API服务正常\n');

    // 2. 测试基础视频搜索
    console.log('2. 测试基础视频搜索...');
    const basicSearchResult = await youtubeService.searchVideos('Yang Hansen basketball', {
      maxResults: 5
    });
    
    if (basicSearchResult.success) {
      console.log(`✅ 基础搜索成功，找到 ${basicSearchResult.items.length} 个视频`);
      
      // 显示前3个视频的基本信息
      basicSearchResult.items.slice(0, 3).forEach((video, index) => {
        console.log(`${index + 1}. ${video.title}`);
        console.log(`   频道: ${video.channelTitle}`);
        console.log(`   观看数: ${video.viewCount.toLocaleString()}`);
        console.log(`   时长: ${youtubeService.formatDuration(video.duration)}`);
        console.log(`   发布时间: ${new Date(video.publishedAt).toLocaleDateString()}`);
        console.log(`   URL: ${video.watchUrl}\n`);
      });
    } else {
      console.error('❌ 基础搜索失败:', basicSearchResult.error);
      return;
    }

    // 3. 测试多策略视频搜索器
    console.log('3. 测试多策略视频搜索器...');
    const videoSearcher = new YangHansenVideoSearcher();
    
    const multiSearchResult = await videoSearcher.searchWithMultipleStrategies({
      maxVideosPerStrategy: 3,
      totalMaxVideos: 15,
      timeRange: 90, // 最近3个月
      includeAllStrategies: false // 只使用主要策略以节省配额
    });

    console.log('\n多策略搜索结果:');
    multiSearchResult.searchResults.forEach(result => {
      console.log(`  ${result.strategy}: ${result.found} 个视频 (权重: ${result.weight})`);
      if (result.error) {
        console.log(`    错误: ${result.error}`);
      }
    });

    console.log('\n处理统计:');
    const stats = multiSearchResult.statistics;
    console.log(`  原始视频数: ${stats.totalFound}`);
    console.log(`  去重后: ${stats.afterDeduplication}`);
    console.log(`  最终数量: ${stats.finalCount}`);
    console.log(`  成功策略: ${stats.successfulStrategies}/${stats.strategiesUsed}`);

    // 4. 展示处理后的视频信息
    console.log('\n4. 处理后的视频列表:');
    multiSearchResult.processedVideos.slice(0, 10).forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   频道: ${video.channelTitle} (权威性: ${video.channelAuthority.toFixed(2)})`);
      console.log(`   分类: ${video.category}`);
      console.log(`   相关性: ${video.relevanceScore.toFixed(3)}`);
      console.log(`   质量评分: ${video.qualityScore.toFixed(3)}`);
      console.log(`   观看数: ${video.formattedViewCount}`);
      console.log(`   时长: ${video.formattedDuration}`);
      console.log(`   搜索策略: ${video.searchStrategy}`);
      console.log(`   标签: ${video.enhancedTags.slice(0, 5).join(', ')}`);
      console.log(`   URL: ${video.watchUrl}`);
      console.log('');
    });

    // 5. 测试分类搜索
    console.log('5. 测试分类搜索...');
    const categories = ['highlights', 'draft', 'summer_league'];
    
    for (const category of categories) {
      try {
        console.log(`\n搜索 ${category} 类别视频:`);
        const categoryResult = await videoSearcher.searchByCategory(category, 3);
        
        if (categoryResult.videos.length > 0) {
          console.log(`✅ 找到 ${categoryResult.videos.length} 个 ${category} 视频:`);
          categoryResult.videos.forEach((video, index) => {
            console.log(`  ${index + 1}. ${video.title}`);
            console.log(`     相关性: ${video.relevanceScore.toFixed(3)}, 质量: ${video.qualityScore.toFixed(3)}`);
          });
        } else {
          console.log(`❌ 未找到 ${category} 类别的视频`);
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

    // 6. 测试最新视频搜索
    console.log('\n6. 测试最新视频搜索...');
    const latestResult = await videoSearcher.searchLatestVideos(5);
    
    if (latestResult.processedVideos.length > 0) {
      console.log(`✅ 找到 ${latestResult.processedVideos.length} 个最新视频:`);
      latestResult.processedVideos.forEach((video, index) => {
        console.log(`${index + 1}. ${video.title}`);
        console.log(`   发布时间: ${new Date(video.publishedAt).toLocaleDateString()}`);
        console.log(`   相关性: ${video.relevanceScore.toFixed(3)}`);
        console.log('');
      });
    } else {
      console.log('❌ 未找到最新视频');
    }

    // 7. 显示API使用统计
    console.log('7. API使用统计:');
    const apiStats = youtubeService.getUsageStats();
    console.log(`   已使用配额: ${apiStats.used}/${apiStats.limit} (${apiStats.utilizationRate})`);
    console.log(`   剩余配额: ${apiStats.remaining}`);
    console.log(`   配额重置时间: ${apiStats.resetTime}`);

    // 8. 显示搜索器统计
    console.log('\n8. 搜索器配置:');
    const searchStats = videoSearcher.getSearchStats();
    console.log('   搜索策略:');
    searchStats.strategies.forEach(strategy => {
      console.log(`     ${strategy.name}: "${strategy.query}" (权重: ${strategy.weight})`);
    });
    
    console.log('\n   权威频道列表:');
    searchStats.authorityChannels.forEach(channel => {
      console.log(`     - ${channel}`);
    });

    console.log('\n=== 测试完成 ===');
    console.log('✅ YouTube API集成测试成功！');
    console.log('\n建议下一步:');
    console.log('1. 运行 `node scripts/update-video-data.js` 获取完整视频数据');
    console.log('2. 检查生成的 `data/videos.json` 文件');
    console.log('3. 更新前端媒体页面以展示真实视频内容');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    console.error('错误详情:', error);
    
    // 检查常见问题
    if (error.message.includes('API key')) {
      console.log('\n💡 解决建议:');
      console.log('1. 确保在 .env.local 文件中设置了 YOUTUBE_API_KEY');
      console.log('2. 检查API密钥是否有效且未过期');
      console.log('3. 确认YouTube Data API v3已启用');
    }
    
    if (error.message.includes('quota')) {
      console.log('\n💡 配额建议:');
      console.log('1. YouTube API每日免费配额为10,000单位');
      console.log('2. 搜索操作消耗100单位，视频详情消耗1单位');
      console.log('3. 可以等待明天配额重置，或考虑付费提升配额');
    }
  }
}

// 运行测试
if (require.main === module) {
  testYouTubeIntegration();
}

module.exports = { testYouTubeIntegration };