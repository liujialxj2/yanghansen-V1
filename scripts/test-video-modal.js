#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🎬 Testing Video Modal Functionality\n');

console.log('📋 New Features:');
console.log('  ✅ Created VideoModal component for popup video playback');
console.log('  ✅ Updated VideoList to use modal instead of navigation');
console.log('  ✅ Fixed VideoPlayer Play button functionality');
console.log('  ✅ Added proper YouTube embed URLs with autoplay');
console.log('  ✅ Added keyboard support (Escape to close modal)');
console.log('  ✅ Added backdrop click to close modal');

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
    console.log('\n🔗 Test URL: http://localhost:3000/videos');
    
    console.log('\n📋 Test the following features:');
    console.log('  1. ✅ Click any video in the list');
    console.log('  2. ✅ Modal should open with video thumbnail');
    console.log('  3. ✅ Click the play button in modal');
    console.log('  4. ✅ YouTube video should start playing');
    console.log('  5. ✅ Press Escape or click backdrop to close');
    console.log('  6. ✅ Click "Watch on YouTube" for external link');
    
    console.log('\n💡 Expected behavior:');
    console.log('  - Videos open in popup modal, not new page');
    console.log('  - Play button works and starts YouTube video');
    console.log('  - Modal can be closed with Escape or backdrop click');
    console.log('  - Video info and tags are displayed in modal');
    
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