#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * 自动检测NewsAPI新闻中的图片域名并更新next.config.js
 */
async function fixNewsAPIImageDomains() {
  console.log('🔧 修复NewsAPI图片域名配置...\n');

  try {
    // 1. 读取新闻数据
    console.log('1. 读取新闻数据...');
    const newsContent = await fs.readFile('data/news.json', 'utf8');
    const newsData = JSON.parse(newsContent);
    
    // 2. 提取所有图片URL
    console.log('2. 提取图片URL...');
    const imageUrls = [];
    
    // 添加头条新闻图片
    if (newsData.featured && newsData.featured.image) {
      imageUrls.push(newsData.featured.image);
    }
    
    // 添加文章图片
    if (newsData.articles) {
      newsData.articles.forEach(article => {
        if (article.image) {
          imageUrls.push(article.image);
        }
      });
    }
    
    console.log(`找到 ${imageUrls.length} 个图片URL`);
    
    // 3. 提取域名
    console.log('3. 提取图片域名...');
    const domains = new Set();
    
    imageUrls.forEach(url => {
      try {
        const urlObj = new URL(url);
        domains.add(urlObj.hostname);
      } catch (error) {
        console.warn(`无效URL: ${url}`);
      }
    });
    
    const domainList = Array.from(domains);
    console.log('发现的图片域名:');
    domainList.forEach(domain => console.log(`  - ${domain}`));
    
    // 4. 读取当前next.config.js
    console.log('\n4. 读取next.config.js...');
    const configPath = 'next.config.js';
    const configContent = await fs.readFile(configPath, 'utf8');
    
    // 5. 检查哪些域名需要添加
    console.log('5. 检查需要添加的域名...');
    const missingDomains = [];
    
    domainList.forEach(domain => {
      if (!configContent.includes(`'${domain}'`) && !configContent.includes(`"${domain}"`)) {
        missingDomains.push(domain);
      }
    });
    
    if (missingDomains.length === 0) {
      console.log('✅ 所有域名都已配置');
      return;
    }
    
    console.log('需要添加的域名:');
    missingDomains.forEach(domain => console.log(`  + ${domain}`));
    
    // 6. 更新next.config.js
    console.log('\n6. 更新next.config.js...');
    
    // 找到domains数组的结束位置
    const domainsEndRegex = /(\s*)(\/\/[^\n]*\n\s*)?]\s*,/;
    const match = configContent.match(domainsEndRegex);
    
    if (!match) {
      console.error('❌ 无法找到domains数组结束位置');
      return;
    }
    
    // 构建新的域名条目
    const newDomainEntries = missingDomains.map(domain => `      '${domain}',`).join('\n');
    const newsApiComment = '      // NewsAPI 动态添加的图片域名';
    
    // 替换内容
    const updatedContent = configContent.replace(
      domainsEndRegex,
      `${match[1]}${newsApiComment}\n${newDomainEntries}\n${match[1]}],`
    );
    
    // 备份原文件
    const backupPath = `next.config.js.backup.${Date.now()}`;
    await fs.writeFile(backupPath, configContent, 'utf8');
    console.log(`✅ 已备份原配置到: ${backupPath}`);
    
    // 写入更新的配置
    await fs.writeFile(configPath, updatedContent, 'utf8');
    console.log('✅ next.config.js 已更新');
    
    // 7. 生成报告
    const report = {
      timestamp: new Date().toISOString(),
      totalImageUrls: imageUrls.length,
      totalDomains: domainList.length,
      addedDomains: missingDomains,
      allDomains: domainList
    };
    
    await fs.writeFile('data/image-domains-report.json', JSON.stringify(report, null, 2), 'utf8');
    
    console.log('\n=== 修复完成 ===');
    console.log(`✅ 添加了 ${missingDomains.length} 个新域名`);
    console.log(`📊 总共配置了 ${domainList.length} 个图片域名`);
    console.log('🔄 请重启开发服务器以应用更改');
    
    return {
      success: true,
      addedDomains: missingDomains,
      totalDomains: domainList.length
    };
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 运行修复
if (require.main === module) {
  fixNewsAPIImageDomains().then(result => {
    if (result.success) {
      console.log('\n✅ 图片域名修复成功！');
      process.exit(0);
    } else {
      console.log('\n❌ 图片域名修复失败');
      process.exit(1);
    }
  });
}

module.exports = { fixNewsAPIImageDomains };