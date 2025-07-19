const { main: fetchNews } = require('./fetch-news');
const { main: fetchMedia } = require('./fetch-media');

async function updateAllData() {
  console.log('=== 开始更新所有数据 ===\n');
  
  try {
    // 更新新闻数据
    console.log('1. 更新新闻数据...');
    await fetchNews();
    console.log('');
    
    // 更新媒体数据
    console.log('2. 更新媒体数据...');
    await fetchMedia();
    console.log('');
    
    console.log('=== 所有数据更新完成 ===');
    console.log('✓ 新闻数据已更新');
    console.log('✓ 媒体数据已更新');
    console.log('\n网站现在拥有最新的内容数据！');
    
  } catch (error) {
    console.error('数据更新失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  updateAllData();
}

module.exports = { updateAllData };