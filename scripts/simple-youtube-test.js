const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function simpleYouTubeTest() {
  console.log('🧪 简单YouTube API测试\n');
  
  const apiKey = process.env.YOUTUBE_API_KEY;
  console.log('API密钥状态:', apiKey ? '✅ 已设置' : '❌ 未设置');
  console.log('API密钥长度:', apiKey ? apiKey.length : 0);
  console.log('API密钥前缀:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
  
  if (!apiKey) {
    console.error('❌ 请在.env.local文件中设置YOUTUBE_API_KEY');
    return;
  }
  
  try {
    console.log('\n🔍 测试API连接...');
    
    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });
    
    // 执行一个简单的搜索测试
    const response = await youtube.search.list({
      part: 'snippet',
      q: 'test',
      type: 'video',
      maxResults: 1
    });
    
    if (response.data && response.data.items) {
      console.log('✅ API连接成功！');
      console.log('📊 测试结果:');
      console.log(`   - 找到 ${response.data.items.length} 个结果`);
      console.log(`   - 总结果数: ${response.data.pageInfo.totalResults}`);
      
      if (response.data.items.length > 0) {
        const firstVideo = response.data.items[0];
        console.log(`   - 第一个视频: ${firstVideo.snippet.title}`);
        console.log(`   - 频道: ${firstVideo.snippet.channelTitle}`);
      }
      
      console.log('\n🎉 YouTube API配置成功！');
      console.log('💡 现在可以运行: npm run update-videos');
      
    } else {
      console.error('❌ API返回了无效的响应');
    }
    
  } catch (error) {
    console.error('❌ API测试失败:');
    console.error('错误信息:', error.message);
    
    if (error.message.includes('API key not valid')) {
      console.log('\n💡 解决建议:');
      console.log('1. 检查API密钥是否正确复制');
      console.log('2. 确认YouTube Data API v3已启用');
      console.log('3. 完成API密钥的"Restrict key"设置');
      console.log('4. 等待5-10分钟让设置生效');
    }
    
    if (error.message.includes('quota')) {
      console.log('\n💡 配额问题:');
      console.log('1. 检查是否超出了每日10,000单位的免费配额');
      console.log('2. 等待次日配额重置');
    }
  }
}

// 运行测试
simpleYouTubeTest();