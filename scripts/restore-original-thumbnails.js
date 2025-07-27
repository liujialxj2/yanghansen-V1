#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Restoring original YouTube thumbnail URLs...\n');

// 恢复视频数据中的原始缩略图URL
const videosDataPath = path.join(__dirname, '../data/videos.json');
const videosData = JSON.parse(fs.readFileSync(videosDataPath, 'utf8'));

function restoreVideoThumbnails(videos) {
  if (Array.isArray(videos)) {
    return videos.map(video => ({
      ...video,
      thumbnail: video.originalThumbnail || `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`
    }));
  }
  return videos;
}

// 恢复featured视频
if (videosData.featured) {
  videosData.featured.thumbnail = videosData.featured.originalThumbnail || `https://i.ytimg.com/vi/${videosData.featured.youtubeId}/hqdefault.jpg`;
}

// 恢复分类视频
if (videosData.categories) {
  Object.keys(videosData.categories).forEach(category => {
    videosData.categories[category] = restoreVideoThumbnails(videosData.categories[category]);
  });
}

fs.writeFileSync(videosDataPath, JSON.stringify(videosData, null, 2));
console.log('✅ Restored original YouTube thumbnail URLs');

// 更新VideoThumbnail组件以使用更好的fallback
const safeImagePath = path.join(__dirname, '../components/SafeImage.tsx');
let safeImageContent = fs.readFileSync(safeImagePath, 'utf8');

// 更新VideoThumbnail的fallback
safeImageContent = safeImageContent.replace(
  /fallbackSrc="\/images\/video-placeholder\.svg"/,
  'fallbackSrc="/images/video-placeholder.svg"'
);

// 增加重试次数
safeImageContent = safeImageContent.replace(
  /retryCount={1}/,
  'retryCount={2}'
);

fs.writeFileSync(safeImagePath, safeImageContent);
console.log('✅ Updated SafeImage component with better fallback handling');

console.log('\n🎉 Restoration completed!');
console.log('\n🚀 Now you can:');
console.log('  1. Run: npm run dev');
console.log('  2. Test video functionality at http://localhost:3000/videos');
console.log('  3. Videos should show thumbnails or fallback to placeholder');