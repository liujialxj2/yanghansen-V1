#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

console.log('🖼️  Testing video thumbnail URLs...');

// Read video data
const videosPath = './data/videos.json';
const videoData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

// Extract all videos
const allVideos = [];
if (videoData.featured) allVideos.push(videoData.featured);
if (videoData.categories) {
  Object.values(videoData.categories).forEach(categoryVideos => {
    if (Array.isArray(categoryVideos)) {
      allVideos.push(...categoryVideos);
    }
  });
}

// Remove duplicates
const uniqueVideos = allVideos.filter((video, index, self) => 
  index === self.findIndex(v => v.youtubeId === video.youtubeId)
);

console.log(`📊 Testing ${uniqueVideos.length} unique video thumbnails...\n`);

// Test function
function testUrl(url, title) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(url, (res) => {
      const loadTime = Date.now() - startTime;
      const status = res.statusCode;
      const contentType = res.headers['content-type'];
      
      resolve({
        url,
        title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
        status,
        contentType,
        loadTime,
        success: status === 200
      });
      
      // Consume response to free up memory
      res.resume();
    });
    
    req.on('error', (error) => {
      const loadTime = Date.now() - startTime;
      resolve({
        url,
        title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
        status: 'ERROR',
        contentType: null,
        loadTime,
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      const loadTime = Date.now() - startTime;
      resolve({
        url,
        title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
        status: 'TIMEOUT',
        contentType: null,
        loadTime,
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

// Test first 5 thumbnails
async function testThumbnails() {
  const testVideos = uniqueVideos.slice(0, 5);
  const results = [];
  
  for (const video of testVideos) {
    console.log(`🔍 Testing: ${video.title.substring(0, 60)}...`);
    const result = await testUrl(video.thumbnail, video.title);
    results.push(result);
    
    if (result.success) {
      console.log(`  ✅ Status: ${result.status} | Load time: ${result.loadTime}ms | Type: ${result.contentType}`);
    } else {
      console.log(`  ❌ Status: ${result.status} | Load time: ${result.loadTime}ms | Error: ${result.error || 'Unknown'}`);
    }
    console.log('');
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;
  
  console.log('📊 Test Summary:');
  console.log(`  ✅ Successful: ${successful}/${results.length}`);
  console.log(`  ❌ Failed: ${failed}/${results.length}`);
  console.log(`  ⏱️  Average load time: ${Math.round(avgLoadTime)}ms`);
  
  if (failed > 0) {
    console.log('\n⚠️  Failed URLs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.url}`);
      console.log(`    Error: ${r.error || r.status}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (avgLoadTime > 2000) {
    console.log('  - Consider implementing lazy loading for better performance');
    console.log('  - Add loading placeholders to improve user experience');
  }
  if (failed > 0) {
    console.log('  - Update failed thumbnail URLs');
    console.log('  - Implement better fallback mechanisms');
  }
  if (successful === results.length) {
    console.log('  - All thumbnails are loading correctly!');
    console.log('  - Consider optimizing load times if needed');
  }
}

testThumbnails().catch(console.error);