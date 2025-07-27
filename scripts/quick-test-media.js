#!/usr/bin/env node

/**
 * 快速测试媒体页面脚本
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 快速测试媒体页面...');

// 检查数据文件
const fs = require('fs');
const videosPath = path.join(__dirname, '../data/videos.json');

try {
  const videosData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
  const totalVideos = Object.values(videosData.categories || {}).reduce((total, videos) => total + videos.length, 0);
  
  console.log('📊 数据检查:');
  console.log(`- 视频数据文件: ✅ 存在`);
  console.log(`- 总视频数: ${totalVideos}`);
  console.log(`- 分类数: ${Object.keys(videosData.categories || {}).length}`);
  
  if (totalVideos === 0) {
    console.log('❌ 警告: 没有视频数据！');
    console.log('🔧 尝试更新视频数据...');
    
    const updateProcess = spawn('node', ['scripts/update-video-data.js'], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    updateProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 视频数据更新完成');
      } else {
        console.log('❌ 视频数据更新失败');
      }
    });
  } else {
    console.log('✅ 视频数据正常');
  }
  
} catch (error) {
  console.error('❌ 读取视频数据失败:', error.message);
}

console.log('\n🌐 测试页面:');
console.log('- 主媒体页面: http://localhost:3000/media');
console.log('- 调试页面: http://localhost:3000/debug-media');

console.log('\n💡 调试提示:');
console.log('1. 打开浏览器开发者工具查看控制台');
console.log('2. 查看 "Media Page Debug" 和 "VideoList Debug" 日志');
console.log('3. 检查网络请求是否有错误');
console.log('4. 确认图片域名配置是否正确');

console.log('\n🔧 如果视频仍然不显示，尝试:');
console.log('- npm run fix-image-domains');
console.log('- npm run update-videos');
console.log('- 重启开发服务器');

module.exports = {};