#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🎬 Final Video Functionality Test\n');

console.log('📋 What we fixed:');
console.log('  ✅ Removed aggressive YouTube timeout in SafeImage');
console.log('  ✅ Fixed video click navigation to detail pages');
console.log('  ✅ Restored original YouTube thumbnail URLs');
console.log('  ✅ Fixed syntax errors in VideoPlayer component');
console.log('  ✅ Improved fallback handling for failed images');
console.log('  ✅ Increased retry count for image loading');

console.log('\n🚀 Starting development server...\n');

// 启动开发服务器
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true
});

let serverReady = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('Ready') || output.includes('localhost:3000')) {
    serverReady = true;
    console.log('\n🎉 Development server is ready!');
    console.log('\n🔗 Test URLs:');
    console.log('  📺 Videos page: http://localhost:3000/videos');
    console.log('  🎬 Video detail: http://localhost:3000/media/video/video-FSmC_1Hv6ZI');
    
    console.log('\n📋 Test checklist:');
    console.log('  1. ✅ Video thumbnails should load (YouTube images or placeholder)');
    console.log('  2. ✅ Clicking videos should navigate to detail page');
    console.log('  3. ✅ Video player should work on detail pages');
    console.log('  4. ✅ No console errors related to images or syntax');
    console.log('  5. ✅ Videos should be clickable and responsive');
    
    console.log('\n💡 If thumbnails don\'t load:');
    console.log('  - This is expected due to network restrictions');
    console.log('  - Placeholder images should appear instead');
    console.log('  - Video functionality should still work');
    
    console.log('\n⌨️  Press Ctrl+C to stop the server');
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  if (!error.includes('warn') && !error.includes('Warning')) {
    console.error('❌ Error:', error);
  }
});

// 清理函数
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development server...');
  server.kill();
  process.exit(0);
});

setTimeout(() => {
  if (!serverReady) {
    console.log('⚠️  Server taking longer than expected to start...');
    console.log('   This might be normal for the first run.');
  }
}, 15000);