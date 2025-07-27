#!/usr/bin/env node

const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function testNewsAPI() {
  const apiKey = process.env.NEWSAPI_KEY;
  console.log('🧪 测试NewsAPI连接...');
  console.log('API密钥:', apiKey ? '已设置' : '未设置');
  
  if (!apiKey) {
    console.log('❌ 未找到API密钥');
    return;
  }

  // 测试简单的头条新闻请求
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${apiKey}`;
  
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ NewsAPI连接成功');
          console.log('状态:', response.status);
          console.log('总结果数:', response.totalResults);
          console.log('文章数:', response.articles?.length || 0);
          
          if (response.articles && response.articles.length > 0) {
            console.log('示例文章:', response.articles[0].title);
          }
          
          resolve(response);
        } catch (error) {
          console.log('❌ 解析响应失败:', error.message);
          console.log('原始响应:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ 请求失败:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ 请求超时');
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// 测试Yang Hansen搜索
async function testYangHansenSearch() {
  const apiKey = process.env.NEWSAPI_KEY;
  console.log('\n🔍 测试Yang Hansen新闻搜索...');
  
  const url = `https://newsapi.org/v2/everything?q=basketball&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;
  
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ 篮球新闻搜索成功');
          console.log('状态:', response.status);
          console.log('总结果数:', response.totalResults);
          console.log('文章数:', response.articles?.length || 0);
          
          if (response.articles && response.articles.length > 0) {
            console.log('\n📰 找到的篮球新闻:');
            response.articles.slice(0, 3).forEach((article, index) => {
              console.log(`${index + 1}. ${article.title}`);
              console.log(`   来源: ${article.source.name}`);
              console.log(`   发布时间: ${article.publishedAt}`);
            });
          }
          
          resolve(response);
        } catch (error) {
          console.log('❌ 解析响应失败:', error.message);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ 搜索请求失败:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ 搜索请求超时');
      req.destroy();
      reject(new Error('Search request timeout'));
    });
  });
}

async function main() {
  try {
    await testNewsAPI();
    await testYangHansenSearch();
    console.log('\n🎉 NewsAPI测试完成！');
  } catch (error) {
    console.log('\n❌ 测试失败:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testNewsAPI, testYangHansenSearch };