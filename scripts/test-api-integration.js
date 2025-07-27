#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * 测试API集成功能
 * 验证新闻和视频数据是否正确加载和显示
 */
async function testAPIIntegration() {
  console.log('🧪 测试API集成功能...\n');

  const results = {
    news: { status: 'pending', data: null, error: null },
    videos: { status: 'pending', data: null, error: null },
    components: { status: 'pending', issues: [] }
  };

  try {
    // 1. 测试新闻数据
    console.log('1. 测试新闻数据...');
    try {
      const newsContent = await fs.readFile('data/news.json', 'utf8');
      const newsData = JSON.parse(newsContent);
      
      results.news.status = 'success';
      results.news.data = {
        articlesCount: newsData.articles?.length || 0,
        hasFeatured: !!newsData.featured,
        lastUpdated: newsData.lastUpdated,
        categories: newsData.statistics?.categories || {},
        sources: newsData.statistics?.sources || []
      };
      
      console.log(`   ✅ 新闻数据加载成功`);
      console.log(`   📰 文章数量: ${results.news.data.articlesCount}`);
      console.log(`   🏆 头条新闻: ${results.news.data.hasFeatured ? '有' : '无'}`);
      console.log(`   📅 最后更新: ${results.news.data.lastUpdated ? new Date(results.news.data.lastUpdated).toLocaleString('zh-CN') : '未知'}`);
      
    } catch (error) {
      results.news.status = 'error';
      results.news.error = error.message;
      console.log(`   ❌ 新闻数据加载失败: ${error.message}`);
    }

    // 2. 测试视频数据
    console.log('\n2. 测试视频数据...');
    try {
      const videosContent = await fs.readFile('data/videos.json', 'utf8');
      const videosData = JSON.parse(videosContent);
      
      results.videos.status = 'success';
      // 计算所有分类中的视频总数
      let totalVideos = 0;
      if (videosData.categories) {
        Object.values(videosData.categories).forEach(categoryVideos => {
          if (Array.isArray(categoryVideos)) {
            totalVideos += categoryVideos.length;
          }
        });
      }
      
      results.videos.data = {
        videosCount: totalVideos,
        hasFeatured: !!videosData.featured,
        lastUpdated: videosData.lastUpdated,
        categories: videosData.statistics?.byCategory || {},
        totalViews: videosData.statistics?.totalViews || 0
      };
      
      console.log(`   ✅ 视频数据加载成功`);
      console.log(`   🎥 视频数量: ${results.videos.data.videosCount}`);
      console.log(`   🏆 头条视频: ${results.videos.data.hasFeatured ? '有' : '无'}`);
      console.log(`   📅 最后更新: ${results.videos.data.lastUpdated ? new Date(results.videos.data.lastUpdated).toLocaleString('zh-CN') : '未知'}`);
      console.log(`   👀 总观看量: ${results.videos.data.totalViews.toLocaleString()}`);
      
    } catch (error) {
      results.videos.status = 'error';
      results.videos.error = error.message;
      console.log(`   ❌ 视频数据加载失败: ${error.message}`);
    }

    // 3. 测试组件文件
    console.log('\n3. 测试组件文件...');
    const componentsToCheck = [
      'components/NewsList.tsx',
      'components/SimpleVideoList.tsx',
      'components/NewsImageSimple.tsx',
      'components/LoadMoreNews.tsx'
    ];

    for (const componentPath of componentsToCheck) {
      try {
        await fs.access(componentPath);
        console.log(`   ✅ ${componentPath} 存在`);
      } catch (error) {
        console.log(`   ❌ ${componentPath} 不存在`);
        results.components.issues.push(`缺少组件: ${componentPath}`);
      }
    }

    results.components.status = results.components.issues.length === 0 ? 'success' : 'warning';

    // 4. 测试API服务
    console.log('\n4. 测试API服务...');
    const apiServices = [
      'lib/newsapi-service.js',
      'lib/youtube-api-service.js',
      'lib/yang-hansen-news-searcher.js',
      'lib/yang-hansen-video-searcher.js'
    ];

    let apiServicesOk = true;
    for (const servicePath of apiServices) {
      try {
        await fs.access(servicePath);
        console.log(`   ✅ ${servicePath} 存在`);
      } catch (error) {
        console.log(`   ❌ ${servicePath} 不存在`);
        apiServicesOk = false;
      }
    }

    // 5. 检查环境变量
    console.log('\n5. 检查环境变量...');
    try {
      const envContent = await fs.readFile('.env.local', 'utf8');
      const hasNewsAPI = envContent.includes('NEWSAPI_KEY');
      const hasYouTubeAPI = envContent.includes('YOUTUBE_API_KEY');
      
      console.log(`   ${hasNewsAPI ? '✅' : '⚠️'} NewsAPI密钥: ${hasNewsAPI ? '已配置' : '未配置'}`);
      console.log(`   ${hasYouTubeAPI ? '✅' : '⚠️'} YouTube API密钥: ${hasYouTubeAPI ? '已配置' : '未配置'}`);
      
      if (!hasNewsAPI || !hasYouTubeAPI) {
        console.log('   💡 提示: 运行更新脚本需要配置API密钥');
      }
    } catch (error) {
      console.log('   ⚠️ 无法读取.env.local文件');
    }

    // 6. 生成测试报告
    console.log('\n=== 测试报告 ===');
    
    const overallStatus = 
      results.news.status === 'success' && 
      results.videos.status === 'success' && 
      results.components.status !== 'error';

    console.log(`📊 总体状态: ${overallStatus ? '✅ 正常' : '❌ 有问题'}`);
    
    if (results.news.status === 'success' && results.videos.status === 'success') {
      console.log('\n🎉 API集成功能正常！');
      console.log('📋 功能状态:');
      console.log(`   - 新闻系统: ✅ ${results.news.data.articlesCount} 篇文章`);
      console.log(`   - 视频系统: ✅ ${results.videos.data.videosCount} 个视频`);
      console.log(`   - 组件系统: ${results.components.status === 'success' ? '✅' : '⚠️'} ${results.components.status === 'success' ? '正常' : '有警告'}`);
      
      console.log('\n🚀 建议操作:');
      console.log('1. 运行 `npm run dev` 启动开发服务器');
      console.log('2. 访问 /news 页面查看新闻功能');
      console.log('3. 访问 /videos 页面查看视频功能');
      console.log('4. 如需更新数据，运行:');
      console.log('   - `node scripts/update-yang-hansen-news.js` 更新新闻');
      console.log('   - `node scripts/update-video-data.js` 更新视频');
    } else {
      console.log('\n❌ 发现问题:');
      if (results.news.status === 'error') {
        console.log(`   - 新闻数据: ${results.news.error}`);
      }
      if (results.videos.status === 'error') {
        console.log(`   - 视频数据: ${results.videos.error}`);
      }
      if (results.components.issues.length > 0) {
        console.log(`   - 组件问题: ${results.components.issues.join(', ')}`);
      }
      
      console.log('\n🔧 修复建议:');
      console.log('1. 运行数据更新脚本生成数据文件');
      console.log('2. 检查组件文件是否存在');
      console.log('3. 确保API密钥正确配置');
    }

    // 保存测试结果
    const testReport = {
      timestamp: new Date().toISOString(),
      results,
      overallStatus,
      recommendations: overallStatus ? [
        '系统运行正常，可以正常使用',
        '建议定期更新新闻和视频数据',
        '监控API配额使用情况'
      ] : [
        '修复数据文件问题',
        '检查组件完整性',
        '验证API配置'
      ]
    };

    await fs.writeFile('data/api-integration-test-report.json', JSON.stringify(testReport, null, 2), 'utf8');
    console.log('\n📄 测试报告已保存到 data/api-integration-test-report.json');

    return testReport;

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    return {
      timestamp: new Date().toISOString(),
      error: error.message,
      overallStatus: false
    };
  }
}

// 运行测试
if (require.main === module) {
  testAPIIntegration().then(report => {
    if (report.overallStatus) {
      console.log('\n✅ API集成测试通过！');
      process.exit(0);
    } else {
      console.log('\n❌ API集成测试失败！');
      process.exit(1);
    }
  });
}

module.exports = { testAPIIntegration };