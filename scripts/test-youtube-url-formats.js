#!/usr/bin/env node

const https = require('https');

// 测试不同的YouTube缩略图URL格式
const youtubeId = 'FSmC_1Hv6ZI';
const thumbnailFormats = [
  `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
  `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
  `https://i.ytimg.com/vi/${youtubeId}/sddefault.jpg`,
  `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`,
  `https://i.ytimg.com/vi/${youtubeId}/default.jpg`,
  `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
  `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
  `https://img.youtube.com/vi/${youtubeId}/sddefault.jpg`,
  `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
  `https://img.youtube.com/vi/${youtubeId}/default.jpg`
];

function testUrl(url) {
  return new Promise((resolve) => {
    console.log(`Testing: ${url}`);
    
    const request = https.get(url, (response) => {
      console.log(`Status: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        console.log('✅ Success');
        resolve({ success: true, url, status: response.statusCode });
      } else {
        console.log('❌ Failed');
        resolve({ success: false, url, status: response.statusCode });
      }
    });
    
    request.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve({ success: false, url, error: error.message });
    });
    
    request.setTimeout(5000, () => {
      console.log('❌ Timeout');
      request.destroy();
      resolve({ success: false, url, error: 'timeout' });
    });
  });
}

async function testAllFormats() {
  console.log(`Testing ${thumbnailFormats.length} different YouTube thumbnail formats...\n`);
  
  const results = [];
  
  for (let i = 0; i < thumbnailFormats.length; i++) {
    console.log(`--- Format ${i + 1}/${thumbnailFormats.length} ---`);
    const result = await testUrl(thumbnailFormats[i]);
    results.push(result);
    console.log('');
    
    // 添加延迟
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 统计结果
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('=== SUMMARY ===');
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n=== WORKING FORMATS ===');
    successful.forEach(result => {
      console.log(`✅ ${result.url}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n=== FAILED FORMATS ===');
    failed.forEach(result => {
      console.log(`❌ ${result.url} - ${result.error || result.status}`);
    });
  }
}

testAllFormats().catch(console.error);