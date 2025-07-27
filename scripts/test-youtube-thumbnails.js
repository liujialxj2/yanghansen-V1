#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// 读取视频数据
const videosPath = path.join(__dirname, '../data/videos.json');
const videosData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

// 提取所有视频
const allVideos = [];
if (videosData.featured) {
  allVideos.push(videosData.featured);
}
if (videosData.categories) {
  Object.values(videosData.categories).forEach(categoryVideos => {
    if (Array.isArray(categoryVideos)) {
      allVideos.push(...categoryVideos);
    }
  });
}

console.log(`Testing ${allVideos.length} YouTube thumbnails...`);

// 测试单个缩略图
function testThumbnail(video) {
  return new Promise((resolve) => {
    const url = video.thumbnail;
    console.log(`Testing: ${video.title}`);
    console.log(`URL: ${url}`);
    
    const request = https.get(url, (response) => {
      console.log(`Status: ${response.statusCode}`);
      console.log(`Content-Type: ${response.headers['content-type']}`);
      
      if (response.statusCode === 200) {
        console.log('✅ Thumbnail loaded successfully');
        resolve({ success: true, video, status: response.statusCode });
      } else {
        console.log('❌ Thumbnail failed to load');
        resolve({ success: false, video, status: response.statusCode });
      }
    });
    
    request.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve({ success: false, video, error: error.message });
    });
    
    request.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      request.destroy();
      resolve({ success: false, video, error: 'timeout' });
    });
  });
}

// 测试所有缩略图
async function testAllThumbnails() {
  const results = [];
  
  for (let i = 0; i < Math.min(5, allVideos.length); i++) {
    const video = allVideos[i];
    console.log(`\n--- Testing ${i + 1}/${Math.min(5, allVideos.length)} ---`);
    const result = await testThumbnail(video);
    results.push(result);
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 统计结果
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n=== SUMMARY ===');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${(successful / results.length * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n=== FAILED THUMBNAILS ===');
    results.filter(r => !r.success).forEach(result => {
      console.log(`❌ ${result.video.title}`);
      console.log(`   URL: ${result.video.thumbnail}`);
      console.log(`   Error: ${result.error || result.status}`);
    });
  }
}

testAllThumbnails().catch(console.error);