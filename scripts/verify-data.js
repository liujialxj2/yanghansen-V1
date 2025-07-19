const fs = require('fs').promises;
const path = require('path');

async function verifyData() {
  console.log('=== 数据验证报告 ===\n');
  
  try {
    // 验证新闻数据
    const newsPath = path.join(__dirname, '../data/news.json');
    const newsData = JSON.parse(await fs.readFile(newsPath, 'utf8'));
    
    console.log('📰 新闻数据验证:');
    console.log(`  ✓ 头条新闻: ${newsData.featured?.title || '无'}`);
    console.log(`  ✓ 文章数量: ${newsData.articles?.length || 0} 篇`);
    console.log(`  ✓ 热门话题: ${newsData.trending?.length || 0} 个`);
    console.log(`  ✓ 最新更新: ${newsData.featured?.date || '未知'}`);
    
    // 验证媒体数据
    const mediaPath = path.join(__dirname, '../data/media.json');
    const mediaData = JSON.parse(await fs.readFile(mediaPath, 'utf8'));
    
    console.log('\n🎬 媒体数据验证:');
    console.log(`  ✓ 视频数量: ${mediaData.videos?.length || 0} 个`);
    console.log(`  ✓ 图片数量: ${mediaData.photos?.length || 0} 张`);
    console.log(`  ✓ 壁纸数量: ${mediaData.wallpapers?.length || 0} 个`);
    
    // 数据质量检查
    console.log('\n🔍 数据质量检查:');
    
    // 检查新闻数据完整性
    let newsIssues = 0;
    if (newsData.articles) {
      newsData.articles.forEach((article, index) => {
        if (!article.title || !article.summary || !article.image) {
          console.log(`  ⚠️  文章 ${index + 1} 缺少必要字段`);
          newsIssues++;
        }
      });
    }
    
    // 检查媒体数据完整性
    let mediaIssues = 0;
    if (mediaData.videos) {
      mediaData.videos.forEach((video, index) => {
        if (!video.title || !video.thumbnail || !video.duration) {
          console.log(`  ⚠️  视频 ${index + 1} 缺少必要字段`);
          mediaIssues++;
        }
      });
    }
    
    if (newsIssues === 0 && mediaIssues === 0) {
      console.log('  ✅ 所有数据完整性检查通过');
    }
    
    // 统计信息
    console.log('\n📊 数据统计:');
    const totalContent = (newsData.articles?.length || 0) + (mediaData.videos?.length || 0) + (mediaData.photos?.length || 0);
    console.log(`  • 总内容数量: ${totalContent} 项`);
    console.log(`  • 新闻文章: ${newsData.articles?.length || 0} 篇`);
    console.log(`  • 视频内容: ${mediaData.videos?.length || 0} 个`);
    console.log(`  • 图片内容: ${mediaData.photos?.length || 0} 张`);
    
    // 内容分类统计
    if (newsData.articles) {
      const categories = {};
      newsData.articles.forEach(article => {
        categories[article.category] = (categories[article.category] || 0) + 1;
      });
      
      console.log('\n📂 新闻分类统计:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`  • ${category}: ${count} 篇`);
      });
    }
    
    console.log('\n=== 验证完成 ===');
    console.log('✅ 数据更新成功，网站内容已就绪！');
    
  } catch (error) {
    console.error('❌ 数据验证失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyData();
}

module.exports = { verifyData };