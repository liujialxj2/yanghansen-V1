const fs = require('fs').promises;
const path = require('path');

/**
 * 修复图片域名配置脚本
 * 自动检测数据文件中的图片域名并更新Next.js配置
 */
async function fixImageDomains() {
  console.log('🔍 检测图片域名...');

  try {
    // 读取数据文件
    const newsPath = path.join(__dirname, '../data/news.json');
    const videosPath = path.join(__dirname, '../data/videos.json');
    const mediaPath = path.join(__dirname, '../data/media.json');
    
    const domains = new Set();

    // 检查新闻数据
    try {
      const newsData = JSON.parse(await fs.readFile(newsPath, 'utf8'));
      
      // 检查特色新闻
      if (newsData.featured?.image) {
        const domain = extractDomain(newsData.featured.image);
        if (domain) domains.add(domain);
      }
      
      // 检查所有文章
      if (newsData.articles) {
        newsData.articles.forEach(article => {
          if (article.image) {
            const domain = extractDomain(article.image);
            if (domain) domains.add(domain);
          }
        });
      }
      
      console.log(`✅ 新闻数据检查完成，找到 ${newsData.articles?.length || 0} 篇文章`);
    } catch (error) {
      console.log('⚠️ 新闻数据文件不存在或格式错误');
    }

    // 检查视频数据
    try {
      const videosData = JSON.parse(await fs.readFile(videosPath, 'utf8'));
      
      // 检查特色视频
      if (videosData.featured?.thumbnail) {
        const domain = extractDomain(videosData.featured.thumbnail);
        if (domain) domains.add(domain);
      }
      
      // 检查所有分类的视频
      if (videosData.categories) {
        Object.values(videosData.categories).forEach(categoryVideos => {
          if (Array.isArray(categoryVideos)) {
            categoryVideos.forEach(video => {
              if (video.thumbnail) {
                const domain = extractDomain(video.thumbnail);
                if (domain) domains.add(domain);
              }
            });
          }
        });
      }
      
      console.log(`✅ 视频数据检查完成，找到 ${videosData.statistics?.total || 0} 个视频`);
    } catch (error) {
      console.log('⚠️ 视频数据文件不存在或格式错误');
    }

    // 检查媒体数据
    try {
      const mediaData = JSON.parse(await fs.readFile(mediaPath, 'utf8'));
      
      // 检查照片
      if (mediaData.photos) {
        mediaData.photos.forEach(photo => {
          if (photo.url) {
            const domain = extractDomain(photo.url);
            if (domain) domains.add(domain);
          }
        });
      }
      
      // 检查壁纸
      if (mediaData.wallpapers) {
        mediaData.wallpapers.forEach(wallpaper => {
          if (wallpaper.preview) {
            const domain = extractDomain(wallpaper.preview);
            if (domain) domains.add(domain);
          }
        });
      }
      
      console.log(`✅ 媒体数据检查完成`);
    } catch (error) {
      console.log('⚠️ 媒体数据文件不存在或格式错误');
    }

    // 读取当前配置
    const configPath = path.join(__dirname, '../next.config.js');
    let configContent = await fs.readFile(configPath, 'utf8');
    
    // 提取当前域名列表
    const currentDomains = extractCurrentDomains(configContent);
    
    // 合并域名
    const allDomains = new Set([...currentDomains, ...domains]);
    
    console.log('\n📋 发现的图片域名:');
    Array.from(domains).forEach(domain => {
      console.log(`  - ${domain}`);
    });
    
    console.log('\n📋 当前配置的域名:');
    currentDomains.forEach(domain => {
      console.log(`  - ${domain}`);
    });

    // 更新配置文件
    const newConfigContent = updateDomainsInConfig(configContent, Array.from(allDomains));
    
    if (newConfigContent !== configContent) {
      await fs.writeFile(configPath, newConfigContent);
      console.log('\n✅ Next.js配置已更新');
      console.log('🔄 请重启开发服务器以应用更改');
      console.log('   npm run dev');
    } else {
      console.log('\n✅ 配置已是最新，无需更新');
    }

    console.log('\n📊 总结:');
    console.log(`  - 总域名数: ${allDomains.size}`);
    console.log(`  - 新增域名: ${domains.size - currentDomains.filter(d => domains.has(d)).length}`);

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    process.exit(1);
  }
}

/**
 * 从URL中提取域名
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * 从配置文件中提取当前域名列表
 */
function extractCurrentDomains(configContent) {
  const domains = [];
  const domainRegex = /['"`]([^'"`]+\.[^'"`]+)['"`]/g;
  const domainsSection = configContent.match(/domains:\s*\[([\s\S]*?)\]/);
  
  if (domainsSection) {
    let match;
    while ((match = domainRegex.exec(domainsSection[1])) !== null) {
      const domain = match[1];
      if (domain && !domain.includes('//') && domain.includes('.')) {
        domains.push(domain);
      }
    }
  }
  
  return domains;
}

/**
 * 更新配置文件中的域名列表
 */
function updateDomainsInConfig(configContent, domains) {
  const sortedDomains = domains.sort();
  const domainsString = sortedDomains
    .map(domain => `      '${domain}'${domain.includes('espncdn') ? ', // ESPN图片域名' : domain.includes('ytimg') ? ', // YouTube缩略图域名' : ''}`)
    .join(',\n');

  const newDomainsSection = `    domains: [
${domainsString}
    ],`;

  return configContent.replace(
    /domains:\s*\[([\s\S]*?)\],/,
    newDomainsSection
  );
}

// 运行脚本
if (require.main === module) {
  fixImageDomains().catch(console.error);
}

module.exports = fixImageDomains;