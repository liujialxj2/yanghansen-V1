#!/usr/bin/env node

/**
 * 检查并修复新闻数据中的图片域名配置
 */

const fs = require('fs').promises;
const path = require('path');

async function fixNewImageDomains() {
  console.log('=== 检查并修复图片域名配置 ===\n');

  try {
    // 读取新闻数据
    const newsPath = path.join(process.cwd(), 'data', 'news.json');
    const newsData = JSON.parse(await fs.readFile(newsPath, 'utf8'));

    // 提取所有图片URL
    const imageUrls = [];
    
    // 精选文章图片
    if (newsData.featured?.image) {
      imageUrls.push(newsData.featured.image);
    }

    // 所有文章图片
    newsData.articles?.forEach(article => {
      if (article.image) {
        imageUrls.push(article.image);
      }
    });

    console.log(`找到 ${imageUrls.length} 个图片URL`);

    // 提取域名
    const domains = new Set();
    imageUrls.forEach(url => {
      try {
        const urlObj = new URL(url);
        domains.add(urlObj.hostname);
      } catch (error) {
        console.log(`无效URL: ${url}`);
      }
    });

    console.log('\n发现的图片域名:');
    domains.forEach(domain => {
      console.log(`  - ${domain}`);
    });

    // 读取当前配置
    const configPath = path.join(process.cwd(), 'next.config.js');
    const configContent = await fs.readFile(configPath, 'utf8');

    // 提取当前域名列表
    const domainsMatch = configContent.match(/domains:\s*\[([\s\S]*?)\]/);
    if (!domainsMatch) {
      console.error('❌ 无法找到domains配置');
      return;
    }

    const currentDomainsStr = domainsMatch[1];
    const currentDomains = new Set();
    
    // 解析当前域名
    const domainMatches = currentDomainsStr.match(/'([^']+)'/g);
    if (domainMatches) {
      domainMatches.forEach(match => {
        const domain = match.replace(/'/g, '');
        currentDomains.add(domain);
      });
    }

    console.log(`\n当前配置中有 ${currentDomains.size} 个域名`);

    // 找出缺失的域名
    const missingDomains = [];
    domains.forEach(domain => {
      if (!currentDomains.has(domain)) {
        missingDomains.push(domain);
      }
    });

    if (missingDomains.length === 0) {
      console.log('✓ 所有域名都已配置');
      return;
    }

    console.log(`\n需要添加 ${missingDomains.length} 个新域名:`);
    missingDomains.forEach(domain => {
      console.log(`  + ${domain}`);
    });

    // 更新配置
    const allDomains = [...currentDomains, ...missingDomains].sort();
    const newDomainsStr = allDomains.map(domain => `      '${domain}'`).join(',\n');
    
    const newConfigContent = configContent.replace(
      /domains:\s*\[([\s\S]*?)\]/,
      `domains: [\n${newDomainsStr}\n    ]`
    );

    await fs.writeFile(configPath, newConfigContent, 'utf8');
    console.log('\n✓ next.config.js 已更新');

    console.log('\n=== 修复完成 ===');
    console.log('请重启开发服务器以应用更改');

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    process.exit(1);
  }
}

// 执行修复
if (require.main === module) {
  fixNewImageDomains();
}

module.exports = { fixNewImageDomains };