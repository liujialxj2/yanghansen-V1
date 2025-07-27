#!/usr/bin/env node

/**
 * 测试网站功能
 */

const http = require('http');
const fs = require('fs').promises;

async function testWebsite() {
  console.log('🧪 测试Yang Hansen网站功能...\n');
  
  const baseUrl = 'http://localhost:3000';
  const tests = [];
  
  // 1. 测试新闻数据
  console.log('1. 检查新闻数据...');
  try {
    const newsData = JSON.parse(await fs.readFile('data/news.json', 'utf8'));
    console.log(`✅ 新闻数据加载成功`);
    console.log(`   - 头条新闻: ${newsData.featured ? '✅' : '❌'}`);
    console.log(`   - 文章数量: ${newsData.articles.length}`);
    console.log(`   - 最后更新: ${new Date(newsData.lastUpdated).toLocaleString()}`);
    
    if (newsData.featured) {
      tests.push({
        name: '新闻详情页',
        url: `/news/${newsData.featured.slug || newsData.featured.id}/`
      });
    }
  } catch (error) {
    console.log(`❌ 新闻数据加载失败: ${error.message}`);
    return;
  }
  
  // 2. 测试页面访问
  console.log('\n2. 测试页面访问...');
  
  const pagesToTest = [
    { name: '首页', url: '/' },
    { name: '新闻列表', url: '/news/' },
    ...tests
  ];
  
  for (const page of pagesToTest) {
    try {
      const result = await testPage(baseUrl + page.url);
      if (result.success) {
        console.log(`✅ ${page.name}: ${result.status}`);
      } else {
        console.log(`❌ ${page.name}: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${page.name}: ${error.message}`);
    }
  }
  
  // 3. 检查图片域名配置
  console.log('\n3. 检查图片域名配置...');
  try {
    const configContent = await fs.readFile('next.config.js', 'utf8');
    const domainMatches = configContent.match(/'([^']+\.com)'/g);
    if (domainMatches) {
      console.log(`✅ 配置了 ${domainMatches.length} 个图片域名`);
      const uniqueDomains = [...new Set(domainMatches.map(m => m.replace(/'/g, '')))];
      console.log(`   - 唯一域名: ${uniqueDomains.length} 个`);
    }
  } catch (error) {
    console.log(`❌ 配置检查失败: ${error.message}`);
  }
  
  console.log('\n🎉 测试完成！');
  console.log('\n📋 建议检查项目:');
  console.log('   1. 访问 http://localhost:3000/news 查看新闻列表');
  console.log('   2. 点击新闻标题查看详情页');
  console.log('   3. 检查图片是否正常显示');
  console.log('   4. 测试"阅读完整文章"按钮');
}

function testPage(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({
        success: res.statusCode === 200,
        status: `${res.statusCode} ${res.statusMessage}`,
        headers: res.headers
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout'
      });
    });
  });
}

if (require.main === module) {
  testWebsite().catch(console.error);
}

module.exports = { testWebsite };