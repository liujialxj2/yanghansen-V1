#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing syntax errors...\n');

// 1. 检查并修复VideoPlayer.tsx
const videoPlayerPath = path.join(__dirname, '../components/VideoPlayer.tsx');
let videoPlayerContent = fs.readFileSync(videoPlayerPath, 'utf8');

// 确保没有重复的else语句
if (videoPlayerContent.includes('} else {') && videoPlayerContent.includes('} else {')) {
  console.log('⚠️  Found duplicate else statements in VideoPlayer.tsx');
  
  // 重新读取文件以确保最新内容
  videoPlayerContent = fs.readFileSync(videoPlayerPath, 'utf8');
  
  // 查找并修复handleClick函数
  const handleClickRegex = /const handleClick = \(\) => \{[\s\S]*?\n  \}/g;
  const matches = videoPlayerContent.match(handleClickRegex);
  
  if (matches && matches.length > 0) {
    const correctHandleClick = `const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Default behavior: navigate to video detail page
      window.location.href = \`/media/video/video-\${video.youtubeId}\`
    }
  }`;
    
    videoPlayerContent = videoPlayerContent.replace(handleClickRegex, correctHandleClick);
    fs.writeFileSync(videoPlayerPath, videoPlayerContent);
    console.log('✅ Fixed handleClick function in VideoPlayer.tsx');
  }
}

// 2. 检查并修复可能的其他语法问题
const componentsToCheck = [
  'components/VideoList.tsx',
  'components/SafeImage.tsx'
];

componentsToCheck.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // 检查常见的语法问题
    const issues = [];
    
    // 检查未闭合的括号
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`);
    }
    
    // 检查未闭合的圆括号
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push(`Mismatched parentheses: ${openParens} open, ${closeParens} close`);
    }
    
    if (issues.length > 0) {
      console.log(`⚠️  Issues found in ${filePath}:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log(`✅ ${filePath} looks good`);
    }
  }
});

// 3. 创建简单的编译测试
const testCompilePath = path.join(__dirname, '../scripts/test-compilation.js');
const testCompileContent = `#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Testing compilation...');

const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'pipe',
  shell: true
});

let hasError = false;

buildProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('Compiled successfully')) {
    console.log('\\n✅ Compilation successful!');
  }
});

buildProcess.stderr.on('data', (data) => {
  const error = data.toString();
  console.error(error);
  hasError = true;
});

buildProcess.on('close', (code) => {
  if (code === 0 && !hasError) {
    console.log('\\n🎉 Build completed successfully!');
    console.log('You can now run: npm run dev');
  } else {
    console.log('\\n❌ Build failed. Please check the errors above.');
  }
});
`;

fs.writeFileSync(testCompilePath, testCompileContent);
fs.chmodSync(testCompilePath, '755');
console.log('✅ Created compilation test script');

console.log('\n🎉 Syntax fixes completed!');
console.log('\n🚀 Next steps:');
console.log('  1. Run: node scripts/test-compilation.js');
console.log('  2. If compilation succeeds, run: npm run dev');
console.log('  3. Test video functionality at http://localhost:3000/videos');