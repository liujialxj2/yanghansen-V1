const fs = require('fs');
const path = require('path');

/**
 * 调试视频数据脚本
 * 检查视频数据的结构和内容
 */
function debugVideoData() {
  console.log('🔍 调试视频数据...\n');

  try {
    // 读取视频数据文件
    const videosPath = path.join(__dirname, '../data/videos.json');
    const videosData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

    console.log('📊 视频数据结构:');
    console.log('- lastUpdated:', videosData.lastUpdated);
    console.log('- featured:', videosData.featured ? '存在' : '不存在');
    console.log('- categories:', Object.keys(videosData.categories || {}));
    console.log('- statistics:', videosData.statistics ? '存在' : '不存在');

    console.log('\n📈 分类统计:');
    if (videosData.categories) {
      Object.entries(videosData.categories).forEach(([category, videos]) => {
        console.log(`- ${category}: ${videos.length} 个视频`);
      });
    }

    console.log('\n🎯 特色视频:');
    if (videosData.featured) {
      console.log('- ID:', videosData.featured.id);
      console.log('- 标题:', videosData.featured.title);
      console.log('- 分类:', videosData.featured.category);
      console.log('- 相关性评分:', videosData.featured.relevanceScore);
    }

    // 计算总视频数
    const totalVideos = Object.values(videosData.categories || {}).reduce((total, videos) => {
      return total + videos.length;
    }, 0);

    console.log('\n📊 总计:');
    console.log('- 总视频数:', totalVideos);
    console.log('- 统计中的总数:', videosData.statistics?.total || 0);

    // 检查前几个视频的数据结构
    console.log('\n🔍 视频数据示例:');
    const allVideos = Object.values(videosData.categories || {}).flat();
    if (allVideos.length > 0) {
      const sampleVideo = allVideos[0];
      console.log('- 示例视频ID:', sampleVideo.id);
      console.log('- 示例视频标题:', sampleVideo.title);
      console.log('- 示例视频缩略图:', sampleVideo.thumbnail);
      console.log('- 示例视频分类:', sampleVideo.category);
      console.log('- 示例视频字段:', Object.keys(sampleVideo));
    } else {
      console.log('❌ 没有找到视频数据');
    }

    // 检查数据完整性
    console.log('\n✅ 数据完整性检查:');
    let validVideos = 0;
    let invalidVideos = 0;

    allVideos.forEach(video => {
      if (video.id && video.title && video.thumbnail && video.youtubeId) {
        validVideos++;
      } else {
        invalidVideos++;
        console.log('❌ 无效视频:', video.id || '无ID', '缺少字段');
      }
    });

    console.log('- 有效视频:', validVideos);
    console.log('- 无效视频:', invalidVideos);

    // 检查媒体页面需要的数据格式
    console.log('\n🎨 媒体页面数据格式检查:');
    console.log('- videosData.categories 存在:', !!videosData.categories);
    console.log('- Object.values(categories).flat() 长度:', Object.values(videosData.categories || {}).flat().length);

    // 模拟媒体页面的数据处理
    const videoCategories = videosData?.categories || {};
    const allVideosForPage = Object.values(videoCategories).flat() || [];
    
    console.log('- 媒体页面会获得的视频数量:', allVideosForPage.length);

    if (allVideosForPage.length === 0) {
      console.log('❌ 媒体页面将显示空列表！');
      console.log('🔧 可能的原因:');
      console.log('  1. categories 对象为空');
      console.log('  2. 所有分类数组都为空');
      console.log('  3. 数据结构不匹配');
    } else {
      console.log('✅ 媒体页面应该能正常显示视频');
    }

  } catch (error) {
    console.error('❌ 读取视频数据失败:', error.message);
  }
}

// 运行调试
debugVideoData();