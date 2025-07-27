#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 更严格的中文字符检测正则表达式
const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g;

// 需要扫描的目录
const dirsToScan = ['app', 'components', 'data'];

// 需要忽略的文件
const ignoreFiles = [
  'messages/zh.json',
  'messages/en.json',
  '.git',
  'node_modules',
  'scripts',
  'docs',
  '.next',
  'build'
];

// 需要检查的文件扩展名
const extensionsToCheck = ['.tsx', '.jsx', '.js', '.ts', '.json'];

const results = [];

function shouldIgnoreFile(filePath) {
  return ignoreFiles.some(ignorePath => filePath.includes(ignorePath));
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    
    if (shouldIgnoreFile(filePath)) {
      continue;
    }
    
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      scanDirectory(filePath);
    } else if (extensionsToCheck.includes(path.extname(filePath))) {
      checkFileForChineseText(filePath);
    }
  }
}

function checkFileForChineseText(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let hasChineseText = false;
    const chineseLines = [];
    
    lines.forEach((line, index) => {
      // 跳过注释行和特殊情况
      if (line.trim().startsWith('//') || 
          line.trim().startsWith('/*') || 
          line.includes('useTranslations') ||
          line.includes('ConditionalContent') ||
          line.includes('next-intl') ||
          line.includes('locale')) {
        return;
      }
      
      const matches = line.match(chineseRegex);
      if (matches && matches.length > 0) {
        hasChineseText = true;
        chineseLines.push({
          lineNumber: index + 1,
          content: line.trim(),
          matches: matches
        });
      }
    });
    
    if (hasChineseText) {
      results.push({
        file: filePath,
        lines: chineseLines,
        totalMatches: chineseLines.reduce((sum, line) => sum + line.matches.length, 0)
      });
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

console.log('🔍 严格扫描中文字符...');
console.log('📋 扫描范围:', dirsToScan.join(', '));

dirsToScan.forEach(dir => {
  scanDirectory(dir);
});

if (results.length === 0) {
  console.log('✅ 未发现任何中文字符！');
} else {
  console.log(`❌ 发现 ${results.length} 个文件包含中文字符:`);
  
  let totalChineseChars = 0;
  
  results.forEach(result => {
    console.log(`\n📄 ${result.file} (${result.totalMatches} 个中文字符):`);
    result.lines.forEach(line => {
      console.log(`   第 ${line.lineNumber} 行: ${line.content}`);
      console.log(`   中文字符: ${line.matches.join(', ')}`);
    });
    totalChineseChars += result.totalMatches;
  });
  
  console.log(`\n📊 总计发现 ${totalChineseChars} 个中文字符需要处理`);
  console.log('\n⚠️  这些文本必须移动到翻译文件或使用 ConditionalContent 组件处理');
  
  // 生成修复建议
  console.log('\n🔧 修复建议:');
  results.forEach(result => {
    console.log(`\n${result.file}:`);
    console.log('  1. 将中文文本添加到 messages/zh.json');
    console.log('  2. 添加对应的英文翻译到 messages/en.json');
    console.log('  3. 使用 useTranslations 或 ConditionalContent 替换硬编码文本');
  });
}

// 返回非零退出码如果发现中文字符
process.exit(results.length > 0 ? 1 : 0);