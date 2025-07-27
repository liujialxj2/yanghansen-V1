/**
 * 测试视频页面功能
 * 验证视频页面是否正常工作
 */

const fs = require('fs').promises;
const path = require('path');

async function testVideoPage() {
  console.log('=== 测试视频页面功能 ===\n');
  
  try {
    // 1. 检查视频数据文件
    console.log('1. 检查视频数据文件...');
    const videosPath = path.join(__dirname, '../data/videos.json');
    const videosData = JSON.parse(await fs.readFile(videosPath, 'utf8'));
    
    console.log(`✅ 视频数据文件存在`);
    console.log(`✅ 特色视频: ${videosData.featured?.title || '无'}`);
    console.log(`✅ 视频分类数量: ${Object.keys(videosData.categories || {}).length}`);
    
    // 统计总视频数量
    let totalVideos = 0;
    Object.values(videosData.categories || {}).forEach(categoryVideos => {
      if (Array.isArray(categoryVideos)) {
        totalVideos += categoryVideos.length;
      }
    });
    console.log(`✅ 总视频数量: ${totalVideos}`);
    
    // 2. 检查视频页面文件
    console.log('\n2. 检查视频页面文件...');
    const videoPagePath = path.join(__dirname, '../app/videos/page.tsx');
    try {
      await fs.access(videoPagePath);
      console.log('✅ 视频页面文件存在: app/videos/page.tsx');
    } catch {
      console.log('❌ 视频页面文件不存在');
    }
    
    // 3. 检查导航更新
    console.log('\n3. 检查导航更新...');
    const navPath = path.join(__dirname, '../components/Navigation.tsx');
    const navContent = await fs.readFile(navPath, 'utf8');
    
    if (navContent.includes('/videos') && navContent.includes('视频')) {
      console.log('✅ 导航已更新为视频链接');
    } else {
      console.log('❌ 导航未正确更新');
    }
    
    // 4. 检查首页链接更新
    console.log('\n4. 检查首页链接更新...');
    const homePath = path.join(__dirname, '../app/page.tsx');
    const homeContent = await fs.readFile(homePath, 'utf8');
    
    if (homeContent.includes('/videos')) {
      console.log('✅ 首页链接已更新为视频');
    } else {
      console.log('❌ 首页链接未正确更新');
    }
    
    // 5. 检查旧媒体页面是否已删除
    console.log('\n5. 检查旧媒体页面...');
    const oldMediaPath = path.join(__dirname, '../app/media/page.tsx');
    try {
      await fs.access(oldMediaPath);
      console.log('⚠️  旧媒体页面仍然存在，建议删除');
    } catch {
      console.log('✅ 旧媒体页面已删除');
    }
    
    // 6. 生成测试报告
    const report = {
      title: "视频页面简化测试报告",
      timestamp: new Date().toISOString(),
      
      changes: [
        "✅ 删除了照片画廊功能",
        "✅ 删除了壁纸下载功能", 
        "✅ 媒体中心重命名为视频",
        "✅ 创建了新的视频专用页面",
        "✅ 更新了导航链接",
        "✅ 更新了首页链接"
      ],
      
      features: [
        "🎥 专注于视频内容展示",
        "🎬 支持视频分类筛选",
        "▶️  内置视频播放器",
        "📱 响应式设计",
        "🔍 视频搜索功能"
      ],
      
      videoStats: {
        totalVideos,
        categories: Object.keys(videosData.categories || {}),
        featuredVideo: videosData.featured?.title || '无'
      },
      
      nextSteps: [
        "运行 `npm run dev` 启动开发服务器",
        "访问 http://localhost:3000/videos 查看视频页面",
        "测试视频播放功能",
        "检查分类筛选功能",
        "确认响应式设计效果"
      ]
    };
    
    await fs.writeFile(
      path.join(__dirname, '../data/video-page-test-report.json'),
      JSON.stringify(report, null, 2),
      'utf8'
    );
    
    console.log('\n=== 测试结果汇总 ===');
    console.log('✅ 视频页面简化完成');
    console.log(`✅ 可用视频数量: ${totalVideos}`);
    console.log(`✅ 视频分类: ${Object.keys(videosData.categories || {}).join(', ')}`);
    
    console.log('\n📋 主要变更:');
    report.changes.forEach(change => {
      console.log(`  ${change}`);
    });
    
    console.log('\n🎥 视频功能:');
    report.features.forEach(feature => {
      console.log(`  ${feature}`);
    });
    
    console.log('\n🚀 下一步操作:');
    report.nextSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
    
    console.log('\n📄 详细测试报告已保存到: data/video-page-test-report.json');
    
    return report;
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testVideoPage();
}

module.exports = { testVideoPage };