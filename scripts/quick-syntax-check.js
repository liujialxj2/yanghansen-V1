#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🔍 Quick syntax check...\n');

// 运行TypeScript编译检查
const tscProcess = spawn('npx', ['tsc', '--noEmit'], {
  stdio: 'pipe',
  shell: true
});

let hasError = false;

tscProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
});

tscProcess.stderr.on('data', (data) => {
  const error = data.toString();
  console.error(error);
  hasError = true;
});

tscProcess.on('close', (code) => {
  if (code === 0 && !hasError) {
    console.log('✅ TypeScript syntax check passed!');
    console.log('\n🚀 Now trying to start dev server...\n');
    
    // 如果TypeScript检查通过，启动开发服务器
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });
    
    // 清理函数
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping development server...');
      devProcess.kill();
      process.exit(0);
    });
    
  } else {
    console.log('❌ TypeScript syntax check failed.');
    console.log('Please fix the errors above before proceeding.');
  }
});