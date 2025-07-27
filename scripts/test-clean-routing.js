#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🧪 测试清理后的路由结构...');

// 检查目录结构
console.log('\n📁 当前app目录结构:');
function listDirectory(dir, prefix = '') {
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = `${dir}/${item}`;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        console.log(`${prefix}📁 ${item}/`);
        if (prefix.length < 6) {
          listDirectory(fullPath, prefix + '  ');
        }
      } else {
        console.log(`${prefix}📄 ${item}`);
      }
    });
  } catch (error) {
    console.log(`${prefix}❌ 无法读取目录: ${error.message}`);
  }
}

listDirectory('app');

console.log('\n🔍 检查关键文件是否存在:');
const keyFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/about/page.tsx',
  'app/stats/page.tsx',
  'app/news/page.tsx',
  'app/videos/page.tsx',
  'components/Navigation.tsx'
];

keyFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n🚀 启动开发服务器...');

// 启动开发服务器
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  detached: false
});

console.log('\n🌐 测试URL:');
console.log('   - http://localhost:3000 (首页)');
console.log('   - http://localhost:3000/about (关于页面)');
console.log('   - http://localhost:3000/stats (数据页面)');
console.log('   - http://localhost:3000/news (新闻页面)');
console.log('   - http://localhost:3000/videos (视频页面)');

console.log('\n✅ 应该不再有水合错误和404问题了！');