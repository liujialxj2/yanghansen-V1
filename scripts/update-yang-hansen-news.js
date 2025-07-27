const NewsDataPipeline = require('../lib/news-data-pipeline');
const fs = require('fs').promises;
const path = require('path');

/**
 * 更新Yang Hansen新闻到网站
 * 替换现有的模拟新闻数据
 */
async function updateYangHansenNews() {
  console.log('=== 更新Yang Hansen真实新闻到网站 ===\n');

  const pipeline = new NewsDataPipeline({
    relevanceThreshold: 0.4,
    maxArticles: 20,
    timeRange: 30,
    outputPath: 'data/news.json',
    backupPath: 'data/backups'
  });

  try {
    // 1. 处理新闻数据
    console.log('1. 处理Yang Hansen真实新闻数据...');
    const result = await pipeline.processNews();

    if (!result.success) {
      throw new Error(`新闻处理失败: ${result.error}`);
    }

    console.log('✓ 新闻数据处理完成');
    console.log(result.report.summary);

    // 2. 验证数据质量
    console.log('\n2. 验证数据质量...');
    const data = result.data;
    
    const qualityChecks = {
      hasArticles: data.articles.length > 0,
      hasFeatured: data.featured !== null,
      hasValidUrls: data.articles.every(a => a.url && a.url.startsWith('http')),
      hasValidDates: data.articles.every(a => a.publishedAt && !isNaN(new Date(a.publishedAt))),
      hasValidSources: data.articles.every(a => a.source && a.source.name),
      hasValidRelevance: data.articles.every(a => a.relevanceScore >= 0.4),
      hasCategories: Object.keys(data.categories).length > 0,
      hasTrending: data.trending.length > 0
    };

    const passedChecks = Object.values(qualityChecks).filter(Boolean).length;
    const totalChecks = Object.keys(qualityChecks).length;

    console.log(`✓ 数据质量检查: ${passedChecks}/${totalChecks} 项通过`);
    
    if (passedChecks < totalChecks) {
      console.log('质量检查详情:');
      Object.entries(qualityChecks).forEach(([check, passed]) => {
        console.log(`  ${passed ? '✓' : '✗'} ${check}`);
      });
    }

    // 3. 更新媒体数据（如果需要）
    console.log('\n3. 检查是否需要更新媒体数据...');
    await updateMediaDataIfNeeded(data);

    // 4. 生成网站兼容的数据格式
    console.log('\n4. 生成网站兼容的数据格式...');
    const websiteData = generateWebsiteCompatibleData(data);
    
    // 保存网站格式的数据
    await fs.writeFile('data/news.json', JSON.stringify(websiteData, null, 2), 'utf8');
    console.log('✓ 网站兼容数据已保存');

    // 5. 更新统计信息
    console.log('\n5. 生成更新统计信息...');
    const updateStats = {
      updatedAt: new Date().toISOString(),
      articlesCount: data.articles.length + (data.featured ? 1 : 0),
      categories: Object.keys(data.categories),
      sources: data.statistics.sources,
      timeRange: data.statistics.timeRange,
      averageRelevance: data.statistics.averageRelevance,
      processing: data.processing
    };

    await fs.writeFile('data/news-update-stats.json', JSON.stringify(updateStats, null, 2), 'utf8');
    console.log('✓ 更新统计信息已保存');

    // 6. 显示更新结果
    console.log('\n=== 更新完成 ===');
    console.log(`✓ 成功更新 ${updateStats.articlesCount} 篇Yang Hansen真实新闻`);
    console.log(`✓ 涵盖时间范围: ${new Date(updateStats.timeRange.oldest).toLocaleDateString()} - ${new Date(updateStats.timeRange.newest).toLocaleDateString()}`);
    console.log(`✓ 新闻来源: ${updateStats.sources.join(', ')}`);
    console.log(`✓ 平均相关性: ${updateStats.averageRelevance.toFixed(3)}`);
    console.log(`✓ 新闻分类: ${updateStats.categories.join(', ')}`);

    // 7. 提供使用建议
    console.log('\n=== 使用建议 ===');
    console.log('1. 运行 `npm run dev` 启动开发服务器查看更新效果');
    console.log('2. 检查 /news 页面确认新闻显示正常');
    console.log('3. 可以设置定时任务每天自动更新新闻');
    console.log('4. 建议每周检查一次数据质量和相关性');

    return {
      success: true,
      stats: updateStats,
      data: websiteData
    };

  } catch (error) {
    console.error('✗ 更新失败:', error.message);
    console.error('错误详情:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 更新媒体数据（如果需要）
 */
async function updateMediaDataIfNeeded(newsData) {
  try {
    // 检查是否有新的视频内容需要添加
    const videoArticles = newsData.articles.filter(article => 
      article.title.toLowerCase().includes('video') || 
      article.title.toLowerCase().includes('highlights') ||
      article.category === 'performance'
    );

    if (videoArticles.length > 0) {
      console.log(`发现 ${videoArticles.length} 篇可能包含视频的文章`);
      
      // 读取现有媒体数据
      let mediaData = {};
      try {
        const mediaContent = await fs.readFile('data/media.json', 'utf8');
        mediaData = JSON.parse(mediaContent);
      } catch (error) {
        console.log('未找到现有媒体数据，将创建新的');
        mediaData = { videos: [], photos: [], wallpapers: [] };
      }

      // 为视频文章生成视频条目
      const newVideos = videoArticles.map(article => ({
        id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: article.title,
        description: article.summary,
        thumbnail: article.imageUrl,
        url: article.url, // 链接到原文
        duration: "N/A", // 无法获取实际时长
        publishedAt: article.publishedAt,
        views: "N/A",
        source: article.source.name,
        category: "news",
        relevanceScore: article.relevanceScore,
        isNewsArticle: true // 标记这是新闻文章而非真实视频
      }));

      // 合并到现有视频数据
      mediaData.videos = [...(mediaData.videos || []), ...newVideos];
      mediaData.lastUpdated = new Date().toISOString();

      // 保存更新的媒体数据
      await fs.writeFile('data/media.json', JSON.stringify(mediaData, null, 2), 'utf8');
      console.log(`✓ 已添加 ${newVideos.length} 个视频相关条目到媒体数据`);
    }
  } catch (error) {
    console.warn('更新媒体数据时出错:', error.message);
  }
}

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
 * 设置定时更新任务
 */
async function setupScheduledUpdate() {
  console.log('\n=== 设置定时更新任务 ===');
  
  const cronScript = `#!/bin/bash
# Yang Hansen新闻自动更新脚本
# 每天早上8点执行

cd "$(dirname "$0")/.."
node scripts/update-yang-hansen-news.js >> logs/news-update.log 2>&1
`;

  try {
    // 创建logs目录
    await fs.mkdir('logs', { recursive: true });
    
    // 创建cron脚本
    await fs.writeFile('scripts/update-news-cron.sh', cronScript, 'utf8');
    
    // 设置执行权限
    const { execSync } = require('child_process');
    execSync('chmod +x scripts/update-news-cron.sh');
    
    console.log('✓ 定时更新脚本已创建: scripts/update-news-cron.sh');
    console.log('✓ 可以添加到crontab: 0 8 * * * /path/to/scripts/update-news-cron.sh');
    
  } catch (error) {
    console.warn('设置定时任务时出错:', error.message);
  }
}

// 运行更新
if (require.main === module) {
  updateYangHansenNews().then(result => {
    if (result.success) {
      console.log('\n🎉 Yang Hansen新闻更新成功！');
      
      // 询问是否设置定时任务
      setupScheduledUpdate();
    } else {
      console.log('\n❌ Yang Hansen新闻更新失败');
      process.exit(1);
    }
  });
}

module.exports = { updateYangHansenNews };