#!/usr/bin/env node

/**
 * 快速修复图片域名问题
 * 从新闻数据中提取所有图片域名并添加到next.config.js
 */

const fs = require('fs').promises;
const { URL } = require('url');

async function quickFixImageDomains() {
  console.log('🔧 快速修复图片域名问题...');
  
  try {
    // 1. 读取新闻数据
    const newsData = JSON.parse(await fs.readFile('data/news.json', 'utf8'));
    
    // 2. 提取所有图片URL
    const imageUrls = [];
    
    if (newsData.featured?.image) {
      imageUrls.push(newsData.featured.image);
    }
    
    newsData.articles?.forEach(article => {
      if (article.image) {
        imageUrls.push(article.image);
      }
    });
    
    // 3. 提取域名
    const domains = new Set();
    
    imageUrls.forEach(url => {
      try {
        const urlObj = new URL(url);
        domains.add(urlObj.hostname);
      } catch (error) {
        console.warn(`无效URL: ${url}`);
      }
    });
    
    const domainList = Array.from(domains).sort();
    console.log(`📊 发现 ${domainList.length} 个图片域名:`);
    domainList.forEach(domain => console.log(`   - ${domain}`));
    
    // 4. 读取并更新next.config.js
    const configPath = 'next.config.js';
    let configContent = await fs.readFile(configPath, 'utf8');
    
    // 5. 构建新的域名列表
    const allDomains = [
      'images.unsplash.com',
      'via.placeholder.com',
      ...domainList
    ];
    
    // 6. 生成新的domains配置
    const domainsConfig = allDomains.map(domain => `      '${domain}'`).join(',\n');
    
    // 7. 替换配置
    const newConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
${domainsConfig}
    ],
    unoptimized: false,
  },
  // 静态导出配置（可选）
  trailingSlash: true,
}

module.exports = nextConfig`;
    
    // 8. 备份并写入
    await fs.copyFile(configPath, `${configPath}.backup-${Date.now()}`);
    await fs.writeFile(configPath, newConfig, 'utf8');
    
    console.log('✅ 已更新next.config.js');
    console.log(`📝 配置了 ${allDomains.length} 个图片域名`);
    console.log('\n⚠️  请重启开发服务器:');
    console.log('   npm run dev');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  quickFixImageDomains();
}

module.exports = { quickFixImageDomains };