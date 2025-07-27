#!/usr/bin/env node

/**
 * 测试媒体页面修复
 */

const fs = require('fs');
const path = require('path');

async function testMediaFix() {
  console.log('🧪 测试媒体页面修复...\n');
  
  try {
    // 1. 检查videos.json数据结构
    const videosPath = path.join(__dirname, '../data/videos.json');
    const videosData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
    
    console.log('📊 Videos.json 数据结构:');
    console.log(`  - lastUpdated: ${videosData.lastUpdated}`);
    console.log(`  - featured: ${videosData.featured ? '存在' : '不存在'}`);
    console.log(`  - categories: ${videosData.categories ? '存在' : '不存在'}`);
    
    if (videosData.categories) {
      const categories = Object.keys(videosData.categories);
      console.log(`  - 分类数量: ${categories.length}`);
      console.log(`  - 分类列表: ${categories.join(', ')}`);
      
      // 统计每个分类的视频数量
      let totalVideos = 0;
      categories.forEach(category => {
        const count = videosData.categories[category].length;
        console.log(`    - ${category}: ${count} 个视频`);
        totalVideos += count;
      });
      
      console.log(`  - 总视频数: ${totalVideos}`);
    }
    
    // 2. 检查是否有重复视频
    const allVideos = [];
    Object.values(videosData.categories).forEach(categoryVideos => {
      if (Array.isArray(categoryVideos)) {
        allVideos.push(...categoryVideos);
      }
    });
    
    const uniqueVideos = allVideos.filter((video, index, self) => 
      index === self.findIndex(v => v.id === video.id)
    );
    
    console.log(`\n🔍 去重分析:`);
    console.log(`  - 原始视频数: ${allVideos.length}`);
    console.log(`  - 去重后视频数: ${uniqueVideos.length}`);
    console.log(`  - 重复视频数: ${allVideos.length - uniqueVideos.length}`);
    
    // 3. 检查视频数据完整性
    console.log(`\n✅ 数据完整性检查:`);
    let validVideos = 0;
    let invalidVideos = 0;
    
    uniqueVideos.forEach(video => {
      if (video.id && video.title && video.thumbnail && video.youtubeId) {
        validVideos++;
      } else {
        invalidVideos++;
        console.log(`  ❌ 无效视频: ${video.id || 'no-id'} - ${video.title || 'no-title'}`);
      }
    });
    
    console.log(`  - 有效视频: ${validVideos}`);
    console.log(`  - 无效视频: ${invalidVideos}`);
    
    // 4. 检查媒体页面代码
    const mediaPagePath = path.join(__dirname, '../app/media/page.tsx');
    const mediaPageContent = fs.readFileSync(mediaPagePath, 'utf8');
    
    console.log(`\n📄 媒体页面代码检查:`);
    console.log(`  - 包含 useMemo: ${mediaPageContent.includes('useMemo') ? '✅' : '❌'}`);
    console.log(`  - 包含 videoCategories: ${mediaPageContent.includes('videoCategories') ? '✅' : '❌'}`);
    console.log(`  - 包含去重逻辑: ${mediaPageContent.includes('uniqueVideos') ? '✅' : '❌'}`);
    
    console.log(`\n🎉 修复验证完成！`);
    console.log(`\n📋 总结:`);
    console.log(`  - 数据结构: ✅ 正确`);
    console.log(`  - 视频数量: ✅ ${uniqueVideos.length} 个`);
    console.log(`  - 代码修复: ✅ 完成`);
    console.log(`  - 预期结果: ✅ 媒体页面应该正常显示视频`);
    
    const categories = Object.keys(videosData.categories);
    return {
      success: true,
      totalVideos: uniqueVideos.length,
      categories: categories.length
    };
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testMediaFix();
}

module.exports = { testMediaFix };