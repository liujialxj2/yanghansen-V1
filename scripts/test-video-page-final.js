#!/usr/bin/env node

console.log('🎬 Final Video Page Test...\n');

// Test 1: Check if Chinese characters are removed from ChineseDetector
console.log('1️⃣ Testing ChineseDetector component...');
const fs = require('fs');
const chineseDetectorContent = fs.readFileSync('components/ChineseDetector.tsx', 'utf8');
const chineseMatches = chineseDetectorContent.match(/[\u4e00-\u9fff]/g);

if (chineseMatches) {
  console.log(`  ❌ Found ${chineseMatches.length} Chinese characters in ChineseDetector`);
  console.log(`  Characters: ${[...new Set(chineseMatches)].join(', ')}`);
} else {
  console.log('  ✅ No Chinese characters found in ChineseDetector');
}

// Test 2: Check SafeImage fallback configuration
console.log('\n2️⃣ Testing SafeImage fallback configuration...');
const safeImageContent = fs.readFileSync('components/SafeImage.tsx', 'utf8');

const hasYouTubeTimeout = safeImageContent.includes('YouTube image timeout');
const hasFallbackSvg = safeImageContent.includes('/images/video-placeholder.svg');
const hasYouTubeDetection = safeImageContent.includes('ytimg.com');

console.log(`  ${hasYouTubeTimeout ? '✅' : '❌'} YouTube timeout mechanism`);
console.log(`  ${hasFallbackSvg ? '✅' : '❌'} SVG fallback configured`);
console.log(`  ${hasYouTubeDetection ? '✅' : '❌'} YouTube URL detection`);

// Test 3: Check if placeholder SVG exists
console.log('\n3️⃣ Testing placeholder image...');
const placeholderExists = fs.existsSync('public/images/video-placeholder.svg');
console.log(`  ${placeholderExists ? '✅' : '❌'} Placeholder SVG exists`);

if (placeholderExists) {
  const svgContent = fs.readFileSync('public/images/video-placeholder.svg', 'utf8');
  const isValidSvg = svgContent.includes('<svg') && svgContent.includes('</svg>');
  console.log(`  ${isValidSvg ? '✅' : '❌'} Valid SVG format`);
}

// Test 4: Check video data cleaning
console.log('\n4️⃣ Testing video data...');
const videoData = JSON.parse(fs.readFileSync('data/videos.json', 'utf8'));

let totalVideos = 0;
let chineseCharCount = 0;

function countChineseInObject(obj) {
  if (typeof obj === 'string') {
    const matches = obj.match(/[\u4e00-\u9fff]/g);
    if (matches) {
      chineseCharCount += matches.length;
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(countChineseInObject);
  } else if (obj && typeof obj === 'object') {
    if (obj.title && obj.thumbnail) {
      totalVideos++;
    }
    Object.values(obj).forEach(countChineseInObject);
  }
}

countChineseInObject(videoData);

console.log(`  📊 Total videos: ${totalVideos}`);
console.log(`  ${chineseCharCount === 0 ? '✅' : '❌'} Chinese characters in data: ${chineseCharCount}`);

// Test 5: Check build configuration
console.log('\n5️⃣ Testing build configuration...');
const nextConfigContent = fs.readFileSync('next.config.js', 'utf8');
const hasYouTubeDomains = nextConfigContent.includes('i.ytimg.com');
console.log(`  ${hasYouTubeDomains ? '✅' : '❌'} YouTube domains configured`);

// Summary
console.log('\n📋 Test Summary:');
const allPassed = !chineseMatches && hasYouTubeTimeout && hasFallbackSvg && 
                  hasYouTubeDetection && placeholderExists && chineseCharCount === 0 && 
                  hasYouTubeDomains;

if (allPassed) {
  console.log('🎉 All tests passed! Video page should work correctly now.');
  console.log('\n🚀 Ready to test:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Visit: http://localhost:3000/videos');
  console.log('   3. Video thumbnails should show placeholder if YouTube images fail');
  console.log('   4. No Chinese character warnings in console');
} else {
  console.log('⚠️  Some tests failed. Please check the issues above.');
}

console.log('\n💡 Expected behavior:');
console.log('   - Video thumbnails may show placeholder initially');
console.log('   - This is normal due to YouTube access restrictions');
console.log('   - Placeholder images should be visible and functional');
console.log('   - No hydration errors should occur');
console.log('   - No Chinese character warnings in English mode');