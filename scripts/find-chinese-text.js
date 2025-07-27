#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 严格检查所有中文字符...\n');

// 中文字符正则表达式
const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g;

function findChineseInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const matches = [];
    
    lines.forEach((line, index) => {
      const chineseMatches = line.match(chineseRegex);
      if (chineseMatches) {
        matches.push({
          line: index + 1,
          content: line.trim(),
          chinese: chineseMatches
        });
      }
    });
    
    return matches;
  } catch (error) {
    return [];
  }
}

function scanDirectory(dir, extensions = ['.tsx', '.ts', '.js', '.json']) {
  const results = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 跳过 node_modules, .next, .git 等目录
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
          scan(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          const matches = findChineseInFile(fullPath);
          if (matches.length > 0) {
            results.push({
              file: fullPath,
              matches: matches
            });
          }
        }
      }
    });
  }
  
  scan(dir);
  return results;
}

// 扫描关键目录
const dirsToScan = ['app', 'components', 'lib', 'data'];
let totalChineseFound = 0;

dirsToScan.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 扫描 ${dir}/ 目录:`);
    const results = scanDirectory(dir);
    
    if (results.length === 0) {
      console.log(`   ✅ 未发现中文字符`);
    } else {
      results.forEach(result => {
        console.log(`\n   ❌ ${result.file}:`);
        result.matches.forEach(match => {
          console.log(`      第${match.line}行: ${match.content}`);
          console.log(`      中文字符: ${match.chinese.join(', ')}`);
          totalChineseFound += match.chinese.length;
        });
      });
    }
    console.log('');
  }
});

console.log(`\n📊 总计发现 ${totalChineseFound} 个中文字符需要处理`);

if (totalChineseFound > 0) {
  console.log('\n🚨 严重警告: 英文模式下仍有中文字符显示！');
  console.log('📋 需要处理的问题:');
  console.log('   1. 将所有硬编码中文替换为翻译函数调用');
  console.log('   2. 在翻译文件中添加对应的英文翻译');
  console.log('   3. 确保数据文件支持多语言');
  process.exit(1);
} else {
  console.log('\n🎉 恭喜！未发现中文字符，国际化检查通过！');
}