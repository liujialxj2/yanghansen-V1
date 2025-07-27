const YangHansenVideoSearcher = require('../lib/yang-hansen-video-searcher');
const fs = require('fs').promises;
const path = require('path');

/**
 * 更新Yang Hansen视频数据到网站
 * 获取YouTube视频并保存到data/videos.json
 */
async function updateVideoData() {
  console.log('=== 更新Yang Hansen视频数据 ===\n');

  const startTime = new Date();
  
  try {
    // 1. 初始化视频搜索器
    console.log('1. 初始化YouTube视频搜索器...');
    const videoSearcher = new YangHansenVideoSearcher();
    
    // 2. 执行多策略视频搜索
    console.log('2. 执行多策略视频搜索...');
    const searchResult = await videoSearcher.searchWithMultipleStrategies({
      maxVideosPerStrategy: 10,
      totalMaxVideos: 40,
      timeRange: 120, // 最近4个月
      includeAllStrategies: true
    });

    if (searchResult.processedVideos.length === 0) {
      throw new Error('未找到任何Yang Hansen相关视频');
    }

    console.log(`✅ 成功获取 ${searchResult.processedVideos.length} 个视频`);

    // 3. 按分类组织视频
    console.log('3. 按分类组织视频数据...');
    const categorizedVideos = organizeVideosByCategory(searchResult.processedVideos);
    
    // 4. 选择头条视频
    console.log('4. 选择头条视频...');
    const featuredVideo = selectFeaturedVideo(searchResult.processedVideos);
    
    // 5. 生成网站兼容的数据格式
    console.log('5. 生成网站数据格式...');
    const websiteData = generateWebsiteVideoData({
      videos: searchResult.processedVideos,
      categorized: categorizedVideos,
      featured: featuredVideo,
      searchResults: searchResult.searchResults,
      statistics: searchResult.statistics
    });

    // 6. 备份现有数据（如果存在）
    await backupExistingData();

    // 7. 保存新数据
    console.log('6. 保存视频数据...');
    await fs.writeFile('data/videos.json', JSON.stringify(websiteData, null, 2), 'utf8');
    console.log('✅ 视频数据已保存到 data/videos.json');

    // 8. 更新媒体数据（合并到现有media.json）
    console.log('7. 更新媒体数据...');
    await updateMediaData(websiteData);

    // 9. 生成更新报告
    const duration = Math.round((new Date() - startTime) / 1000);
    const report = generateUpdateReport(websiteData, searchResult, duration);
    
    // 保存更新报告
    await fs.writeFile('data/video-update-report.json', JSON.stringify(report, null, 2), 'utf8');

    // 10. 显示更新结果
    console.log('\n=== 更新完成 ===');
    console.log(`✅ 成功更新 ${websiteData.statistics.total} 个Yang Hansen视频`);
    console.log(`📊 更新统计:`);
    console.log(`   - 处理时间: ${duration}秒`);
    console.log(`   - 头条视频: ${featuredVideo ? featuredVideo.title.substring(0, 50) + '...' : '无'}`);
    console.log(`   - 视频分类: ${Object.keys(websiteData.categories).join(', ')}`);
    console.log(`   - 平均相关性: ${websiteData.statistics.averageRelevance.toFixed(3)}`);
    console.log(`   - 平均质量: ${websiteData.statistics.averageQuality.toFixed(3)}`);
    console.log(`   - API使用: ${searchResult.statistics.apiUsage.used}/${searchResult.statistics.apiUsage.limit}`);

    console.log('\n📋 分类统计:');
    Object.entries(websiteData.statistics.byCategory).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} 个视频`);
    });

    console.log('\n🎯 推荐下一步:');
    console.log('1. 运行 `npm run dev` 查看更新后的媒体中心页面');
    console.log('2. 检查视频播放和展示效果');
    console.log('3. 可以设置定时任务每日自动更新视频');

    return {
      success: true,
      videoCount: websiteData.statistics.total,
      report: report
    };

  } catch (error) {
    console.error('❌ 视频数据更新失败:', error.message);
    console.error('错误详情:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 按分类组织视频
 */
function organizeVideosByCategory(videos) {
  const categories = {
    highlights: [],
    draft: [],
    summer_league: [],
    interview: [],
    training: [],
    news: [],
    skills: []
  };

  videos.forEach(video => {
    const category = video.category || 'news';
    if (categories[category]) {
      categories[category].push(video);
    } else {
      categories.news.push(video);
    }
  });

  // 按质量评分排序每个分类
  Object.keys(categories).forEach(category => {
    categories[category].sort((a, b) => {
      const scoreA = (a.relevanceScore || 0) * 0.6 + (a.qualityScore || 0) * 0.4;
      const scoreB = (b.relevanceScore || 0) * 0.6 + (b.qualityScore || 0) * 0.4;
      return scoreB - scoreA;
    });
  });

  return categories;
}

/**
 * 选择头条视频
 */
function selectFeaturedVideo(videos) {
  if (videos.length === 0) return null;

  // 计算综合评分并选择最佳视频作为头条
  const scoredVideos = videos.map(video => ({
    ...video,
    featuredScore: calculateFeaturedScore(video)
  }));

  scoredVideos.sort((a, b) => b.featuredScore - a.featuredScore);
  
  return scoredVideos[0];
}

/**
 * 计算头条视频评分
 */
function calculateFeaturedScore(video) {
  const relevance = video.relevanceScore || 0;
  const quality = video.qualityScore || 0;
  const authority = video.channelAuthority || 0;
  const viewCount = Math.min(video.viewCount / 1000000, 1); // 百万观看为满分
  
  // 最近发布的视频加分
  const publishedDate = new Date(video.publishedAt);
  const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
  const recencyBonus = daysSincePublished <= 7 ? 0.2 : (daysSincePublished <= 30 ? 0.1 : 0);
  
  return relevance * 0.3 + quality * 0.25 + authority * 0.2 + viewCount * 0.15 + recencyBonus + 0.1;
}

/**
 * 生成网站兼容的视频数据
 */
function generateWebsiteVideoData({ videos, categorized, featured, searchResults, statistics }) {
  return {
    lastUpdated: new Date().toISOString(),
    
    // 头条视频
    featured: featured ? convertToWebsiteFormat(featured) : null,
    
    // 按分类组织的视频
    categories: Object.fromEntries(
      Object.entries(categorized).map(([category, categoryVideos]) => [
        category,
        categoryVideos.map(convertToWebsiteFormat)
      ])
    ),
    
    // 所有视频的扁平列表（按评分排序）
    videos: videos.map(convertToWebsiteFormat),
    
    // 统计信息
    statistics: {
      total: videos.length,
      byCategory: Object.fromEntries(
        Object.entries(categorized).map(([category, categoryVideos]) => [
          category,
          categoryVideos.length
        ])
      ),
      averageRelevance: videos.reduce((sum, v) => sum + (v.relevanceScore || 0), 0) / videos.length,
      averageQuality: videos.reduce((sum, v) => sum + (v.qualityScore || 0), 0) / videos.length,
      averageAuthority: videos.reduce((sum, v) => sum + (v.channelAuthority || 0), 0) / videos.length,
      totalViews: videos.reduce((sum, v) => sum + (v.viewCount || 0), 0),
      timeRange: {
        oldest: videos.reduce((oldest, v) => 
          !oldest || new Date(v.publishedAt) < new Date(oldest) ? v.publishedAt : oldest, null),
        newest: videos.reduce((newest, v) => 
          !newest || new Date(v.publishedAt) > new Date(newest) ? v.publishedAt : newest, null)
      },
      lastProcessed: new Date().toISOString(),
      searchStrategies: searchResults.length,
      apiUsage: statistics.apiUsage
    },
    
    // 处理元信息
    processing: {
      searchResults: searchResults,
      totalFound: statistics.totalFound,
      afterDeduplication: statistics.afterDeduplication,
      finalCount: statistics.finalCount,
      processedAt: new Date().toISOString()
    }
  };
}

/**
 * 转换为网站格式
 */
function convertToWebsiteFormat(video) {
  return {
    id: `video-${video.id}`,
    youtubeId: video.id,
    title: video.title,
    description: video.description,
    thumbnail: video.thumbnailUrl,
    duration: video.formattedDuration,
    publishedAt: video.publishedAt,
    viewCount: video.viewCount,
    formattedViewCount: video.formattedViewCount,
    likeCount: video.likeCount,
    channelTitle: video.channelTitle,
    channelId: video.channelId,
    category: video.category,
    tags: video.enhancedTags,
    relevanceScore: video.relevanceScore,
    qualityScore: video.qualityScore,
    channelAuthority: video.channelAuthority,
    embedUrl: video.embedUrl,
    watchUrl: video.watchUrl,
    searchStrategy: video.searchStrategy,
    isProcessed: true,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * 备份现有数据
 */
async function backupExistingData() {
  try {
    const backupDir = 'data/backups';
    await fs.mkdir(backupDir, { recursive: true });
    
    // 备份videos.json
    try {
      const existingData = await fs.readFile('data/videos.json', 'utf8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await fs.writeFile(`${backupDir}/videos-${timestamp}.json`, existingData, 'utf8');
      console.log('✅ 已备份现有视频数据');
    } catch (error) {
      console.log('ℹ️  未找到现有视频数据，跳过备份');
    }
  } catch (error) {
    console.warn('⚠️  备份失败:', error.message);
  }
}

/**
 * 更新媒体数据
 */
async function updateMediaData(videoData) {
  try {
    let mediaData = {};
    
    // 读取现有媒体数据
    try {
      const mediaContent = await fs.readFile('data/media.json', 'utf8');
      mediaData = JSON.parse(mediaContent);
    } catch (error) {
      console.log('ℹ️  未找到现有媒体数据，将创建新的');
      mediaData = { videos: [], photos: [], wallpapers: [] };
    }

    // 更新视频部分
    mediaData.videos = videoData.videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      url: video.watchUrl,
      embedUrl: video.embedUrl,
      duration: video.duration,
      publishedAt: video.publishedAt,
      views: video.formattedViewCount,
      source: 'YouTube',
      category: video.category,
      relevanceScore: video.relevanceScore
    }));

    mediaData.lastUpdated = new Date().toISOString();

    // 保存更新的媒体数据
    await fs.writeFile('data/media.json', JSON.stringify(mediaData, null, 2), 'utf8');
    console.log('✅ 已更新媒体数据');
    
  } catch (error) {
    console.warn('⚠️  更新媒体数据失败:', error.message);
  }
}

/**
 * 生成更新报告
 */
function generateUpdateReport(websiteData, searchResult, duration) {
  return {
    timestamp: new Date().toISOString(),
    duration: duration,
    success: true,
    summary: {
      totalVideos: websiteData.statistics.total,
      featuredVideo: websiteData.featured ? websiteData.featured.title : null,
      categories: Object.keys(websiteData.categories),
      averageRelevance: websiteData.statistics.averageRelevance,
      averageQuality: websiteData.statistics.averageQuality,
      totalViews: websiteData.statistics.totalViews
    },
    searchResults: searchResult.searchResults,
    apiUsage: searchResult.statistics.apiUsage,
    qualityMetrics: {
      highQualityVideos: websiteData.videos.filter(v => v.qualityScore >= 0.7).length,
      highRelevanceVideos: websiteData.videos.filter(v => v.relevanceScore >= 0.7).length,
      authorityChannelVideos: websiteData.videos.filter(v => v.channelAuthority >= 0.7).length
    },
    recommendations: [
      '定期检查视频内容质量和相关性',
      '监控API配额使用情况',
      '考虑添加更多搜索策略以获取更全面的内容',
      '根据用户反馈调整视频分类和推荐算法'
    ]
  };
}

// 运行更新
if (require.main === module) {
  updateVideoData().then(result => {
    if (result.success) {
      console.log('\n🎉 Yang Hansen视频数据更新成功！');
    } else {
      console.log('\n❌ Yang Hansen视频数据更新失败');
      process.exit(1);
    }
  });
}

module.exports = { updateVideoData };