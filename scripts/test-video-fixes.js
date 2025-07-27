#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Testing video fixes...');

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
    console.log('\n✅ Development server is ready!');
    console.log('🔗 Open http://localhost:3000/videos to test video functionality');
    console.log('\n📋 Test checklist:');
    console.log('  - Video thumbnails should load (or show placeholder)');
    console.log('  - Clicking videos should navigate to detail page');
    console.log('  - Video player should work on detail pages');
    console.log('  - No console errors related to images');
  }
});

server.stderr.on('data', (data) => {
  console.error(data.toString());
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
  }
}, 10000);
