#!/usr/bin/env node

/**
 * 自动检测新闻数据中的图片域名并更新next.config.js
 */

const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

async function updateImageDomains() {
  console.log('🔍 检测新闻数据中的图片域名...');
  
  try {
    // 1. 读取新闻数据
    const newsData = JSON.parse(await fs.readFile('data/news.json', 'utf8'));
    
    // 2. 提取所有图片URL
    const imageUrls = [];
    
    // 从featured文章提取
    if (newsData.featured && newsData.featured.image) {
      imageUrls.push(newsData.featured.image);
    }
    
    // 从文章列表提取
    newsData.articles.forEach(article => {
      if (article.image) {
        imageUrls.push(article.image);
      }
    });
    
    console.log(`📊 找到 ${imageUrls.length} 个图片URL`);
    
    // 3. 提取域名
    const domains = new Set();
    const invalidUrls = [];
    
    imageUrls.forEach(url => {
      try {
        const urlObj = new URL(url);
        domains.add(urlObj.hostname);
      } catch (error) {
        invalidUrls.push(url);
      }
    });
    
    if (invalidUrls.length > 0) {
      console.log(`⚠️  发现 ${invalidUrls.length} 个无效URL:`, invalidUrls);
    }
    
    console.log(`🌐 发现 ${domains.size} 个不同的域名:`);
    Array.from(domains).sort().forEach(domain => {
      console.log(`   - ${domain}`);
    });
    
    // 4. 读取当前的next.config.js
    const configPath = 'next.config.js';
    const configContent = await fs.readFile(configPath, 'utf8');
    
    // 5. 提取当前配置的域名
    const domainRegex = /'([^']+)'/g;
    const currentDomains = new Set();
    let match;
    
    while ((match = domainRegex.exec(configContent)) !== null) {
      const domain = match[1];
      if (domain.includes('.') && !domain.includes('/')) {
        currentDomains.add(domain);
      }
    }
    
    console.log(`📋 当前配置的域名数量: ${currentDomains.size}`);
    
    // 6. 找出新域名
    const newDomains = Array.from(domains).filter(domain => !currentDomains.has(domain));
    
    if (newDomains.length === 0) {
      console.log('✅ 所有域名都已配置，无需更新');
      return;
    }
    
    console.log(`🆕 发现 ${newDomains.length} 个新域名需要添加:`);
    newDomains.forEach(domain => {
      console.log(`   + ${domain}`);
    });
    
    // 7. 更新配置文件
    const domainsSection = configContent.match(/domains:\s*\[([\s\S]*?)\]/);
    if (!domainsSection) {
      throw new Error('无法找到domains配置段');
    }
    
    const currentDomainsText = domainsSection[1];
    const newDomainsText = newDomains.map(domain => `      '${domain}'`).join(',\n');
    
    const updatedDomainsText = currentDomainsText.trim().endsWith(',') 
      ? currentDomainsText + '\n' + newDomainsText
      : currentDomainsText + ',\n' + newDomainsText;
    
    const updatedConfig = configContent.replace(
      /domains:\s*\[([\s\S]*?)\]/,
      `domains: [\n${updatedDomainsText}\n    ]`
    );
    
    // 8. 备份原配置
    await fs.copyFile(configPath, `${configPath}.backup`);
    console.log('💾 已备份原配置文件');
    
    // 9. 写入新配置
    await fs.writeFile(configPath, updatedConfig, 'utf8');
    console.log('✅ 已更新next.config.js');
    
    // 10. 显示结果
    console.log('\n🎉 更新完成！');
    console.log('📝 新增的域名:');
    newDomains.forEach(domain => {
      console.log(`   ✓ ${domain}`);
    });
    
    console.log('\n⚠️  重要提醒:');
    console.log('   需要重启开发服务器才能生效:');
    console.log('   npm run dev');
    
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  updateImageDomains();
}

module.exports = { updateImageDomains };