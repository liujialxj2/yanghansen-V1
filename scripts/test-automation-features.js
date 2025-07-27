const TranslationService = require('../lib/translation-service');
const TaskScheduler = require('../lib/task-scheduler');
const VideoRelevanceValidator = require('../lib/video-relevance-validator');

/**
 * 测试自动化功能的简单脚本
 */
async function testAutomationFeatures() {
  console.log('🧪 测试自动化功能...\n');

  // 1. 测试翻译服务
  console.log('1️⃣ 测试翻译服务');
  try {
    const translationService = new TranslationService();
    const result = await translationService.testTranslation();
    console.log('✅ 翻译服务测试:', result.success ? '通过' : '失败');
    if (result.success) {
      console.log('   英译中:', result.results.englishToChinese);
      console.log('   中译英:', result.results.chineseToEnglish);
    }
  } catch (error) {
    console.log('❌ 翻译服务测试失败:', error.message);
  }

  console.log('');

  // 2. 测试任务调度器
  console.log('2️⃣ 测试任务调度器');
  try {
    const scheduler = new TaskScheduler();
    
    // 添加测试任务
    let executed = false;
    scheduler.addTask('test', '*/5 * * * * *', () => {
      executed = true;
      return 'Test task completed';
    });

    // 手动执行
    const result = await scheduler.executeTask('test');
    console.log('✅ 任务调度器测试:', executed ? '通过' : '失败');
    console.log('   执行结果:', result);

    // 获取统计
    const stats = scheduler.getStats();
    console.log('   系统统计:', stats);

    scheduler.removeTask('test');
  } catch (error) {
    console.log('❌ 任务调度器测试失败:', error.message);
  }

  console.log('');

  // 3. 测试视频相关性验证
  console.log('3️⃣ 测试视频相关性验证');
  try {
    const validator = new VideoRelevanceValidator();
    
    // 测试视频数据
    const testVideo = {
      id: 'test123',
      title: 'Yang Hansen Basketball Highlights',
      description: 'Amazing performance by Yang Hansen in the game',
      channelTitle: 'NBA Official',
      duration: 'PT5M30S',
      viewCount: 50000,
      likeCount: 1500,
      publishedAt: new Date().toISOString(),
      tags: ['basketball', 'nba', 'highlights']
    };

    const validation = validator.validateVideo(testVideo, 0.5);
    console.log('✅ 视频验证测试:', validation.isRelevant ? '通过' : '失败');
    console.log('   相关性评分:', validation.score.toFixed(3));
    console.log('   推荐等级:', validation.recommendation.level);
    console.log('   视频分类:', validation.category);
    console.log('   质量等级:', validation.quality.grade);
  } catch (error) {
    console.log('❌ 视频验证测试失败:', error.message);
  }

  console.log('');

  // 4. 测试系统集成
  console.log('4️⃣ 测试系统集成');
  try {
    // 检查数据文件
    const fs = require('fs').promises;
    const path = require('path');
    
    const newsPath = path.join(__dirname, '../data/news.json');
    const videoPath = path.join(__dirname, '../data/videos.json');
    
    const newsExists = await fs.access(newsPath).then(() => true).catch(() => false);
    const videoExists = await fs.access(videoPath).then(() => true).catch(() => false);
    
    console.log('✅ 数据文件检查:');
    console.log('   新闻数据:', newsExists ? '存在' : '不存在');
    console.log('   视频数据:', videoExists ? '存在' : '不存在');

    if (newsExists) {
      const newsData = JSON.parse(await fs.readFile(newsPath, 'utf8'));
      console.log('   新闻数量:', newsData.articles?.length || 0);
    }

    if (videoExists) {
      const videoData = JSON.parse(await fs.readFile(videoPath, 'utf8'));
      console.log('   视频数量:', videoData.statistics?.total || 0);
    }
  } catch (error) {
    console.log('❌ 系统集成测试失败:', error.message);
  }

  console.log('\n🎉 功能测试完成!');
}

// 运行测试
if (require.main === module) {
  testAutomationFeatures().catch(console.error);
}

module.exports = testAutomationFeatures;