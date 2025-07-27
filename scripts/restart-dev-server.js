#!/usr/bin/env node

/**
 * 重启开发服务器脚本
 * 用于在配置更改后重启Next.js开发服务器
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 重启Next.js开发服务器...');
console.log('📝 配置更改已应用，需要重启服务器生效');

// 杀死现有的开发服务器进程
console.log('🛑 停止现有服务器...');

// 在不同平台上杀死进程
const killCommand = process.platform === 'win32' ? 'taskkill' : 'pkill';
const killArgs = process.platform === 'win32' 
  ? ['/f', '/im', 'node.exe'] 
  : ['-f', 'next dev'];

const killProcess = spawn(killCommand, killArgs, { stdio: 'inherit' });

killProcess.on('close', (code) => {
  console.log('✅ 服务器已停止');
  
  // 等待一秒后启动新的服务器
  setTimeout(() => {
    console.log('🚀 启动新的开发服务器...');
    
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    devProcess.on('error', (error) => {
      console.error('❌ 启动服务器失败:', error.message);
    });

    console.log('✅ 开发服务器正在启动...');
    console.log('🌐 请访问 http://localhost:3000');
    console.log('📱 媒体页面: http://localhost:3000/media');
  }, 1000);
});

killProcess.on('error', (error) => {
  console.log('⚠️ 没有找到运行中的服务器，直接启动新服务器...');
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  devProcess.on('error', (error) => {
    console.error('❌ 启动服务器失败:', error.message);
  });

  console.log('✅ 开发服务器正在启动...');
  console.log('🌐 请访问 http://localhost:3000');
  console.log('📱 媒体页面: http://localhost:3000/media');
});