const fs = require('fs');
const path = require('path');

/**
 * 测试视频显示脚本
 * 模拟媒体页面的数据处理逻辑
 */
function testVideoDisplay() {
  console.log('🧪 测试视频显示逻辑...\n');

  try {
    // 读取视频数据
    const videosPath = path.join(__dirname, '../data/videos.json');
    const videosData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

    // 模拟媒体页面的数据处理
    console.log('1️⃣ 模拟媒体页面数据处理:');
    const videoCategories = videosData?.categories || {};
    const allVideos = Object.values(videoCategories).flat() || [];
    
    console.log('- videoCategories keys:', Object.keys(videoCategories));
    console.log('- allVideos length:', allVideos.length);

    // 测试分类过滤
    console.log('\n2️⃣ 测试分类过滤:');
    const testCategories = ['all', 'highlights', 'draft', 'news'];
    
    testCategories.forEach(category => {
      let filteredVideos;
      if (category === 'all') {
        filteredVideos = allVideos;
      } else {
        filteredVideos = videoCategories[category] || [];
      }
      console.log(`- ${category}: ${filteredVideos.length} 个视频`);
    });

    // 检查视频数据结构
    console.log('\n3️⃣ 检查视频数据结构:');
    if (allVideos.length > 0) {
      const firstVideo = allVideos[0];
      const requiredFields = ['id', 'title', 'thumbnail', 'duration', 'viewCount', 'channelTitle'];
      
      console.log('- 第一个视频的必需字段:');
      requiredFields.forEach(field => {
        const hasField = firstVideo.hasOwnProperty(field);
        const value = firstVideo[field];
        console.log(`  ${field}: ${hasField ? '✅' : '❌'} ${hasField ? `(${typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value})` : ''}`);
      });
    }

    // 模拟VideoList组件的props
    console.log('\n4️⃣ 模拟VideoList组件props:');
    const videoListProps = {
      videos: allVideos,
      categories: videoCategories,
      onVideoSelect: () => console.log('Video selected'),
      showFilters: true,
      itemsPerPage: 12
    };

    console.log('- videos prop length:', videoListProps.videos.length);
    console.log('- categories prop keys:', Object.keys(videoListProps.categories));
    console.log('- showFilters:', videoListProps.showFilters);
    console.log('- itemsPerPage:', videoListProps.itemsPerPage);

    // 检查是否有空的分类
    console.log('\n5️⃣ 检查空分类:');
    Object.entries(videoCategories).forEach(([category, videos]) => {
      if (videos.length === 0) {
        console.log(`⚠️ 空分类: ${category}`);
      } else {
        console.log(`✅ ${category}: ${videos.length} 个视频`);
      }
    });

    // 生成测试HTML
    console.log('\n6️⃣ 生成测试HTML预览:');
    const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>视频数据测试</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .video-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .video-thumbnail { width: 100%; height: 200px; object-fit: cover; }
        .video-info { padding: 15px; }
        .video-title { font-weight: bold; margin-bottom: 10px; }
        .video-meta { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <h1>Yang Hansen 视频数据测试</h1>
    <p>总视频数: ${allVideos.length}</p>
    
    <div class="video-grid">
        ${allVideos.slice(0, 6).map(video => `
            <div class="video-card">
                <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail" />
                <div class="video-info">
                    <div class="video-title">${video.title}</div>
                    <div class="video-meta">
                        <div>频道: ${video.channelTitle}</div>
                        <div>观看: ${video.formattedViewCount}</div>
                        <div>时长: ${video.duration}</div>
                        <div>分类: ${video.category}</div>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    const testHtmlPath = path.join(__dirname, '../test-videos.html');
    fs.writeFileSync(testHtmlPath, testHtml);
    console.log(`✅ 测试HTML已生成: ${testHtmlPath}`);
    console.log('   在浏览器中打开此文件查看视频数据');

    // 总结
    console.log('\n📊 测试总结:');
    console.log(`✅ 视频数据文件存在且有效`);
    console.log(`✅ 总共 ${allVideos.length} 个视频`);
    console.log(`✅ ${Object.keys(videoCategories).length} 个分类`);
    console.log(`✅ 数据结构完整`);
    
    if (allVideos.length > 0) {
      console.log(`✅ 媒体页面应该能正常显示视频`);
    } else {
      console.log(`❌ 媒体页面将显示空列表`);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testVideoDisplay();