#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 测试国际化功能...');

// 1. 检查翻译文件是否存在
console.log('\n📁 检查翻译文件:');
const translationFiles = ['messages/zh.json', 'messages/en.json'];
translationFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} 存在`);
    try {
      const content = JSON.parse(fs.readFileSync(file, 'utf8'));
      console.log(`   📊 包含 ${Object.keys(content).length} 个命名空间`);
    } catch (error) {
      console.log(`   ❌ ${file} JSON 格式错误: ${error.message}`);
    }
  } else {
    console.log(`   ❌ ${file} 不存在`);
  }
});

// 2. 检查配置文件
console.log('\n⚙️  检查配置文件:');
const configFiles = ['next-intl.config.js'];
configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} 存在`);
  } else {
    console.log(`   ❌ ${file} 不存在`);
  }
});

// 3. 检查组件文件
console.log('\n🧩 检查国际化组件:');
const componentFiles = [
  'components/LocaleProvider.tsx',
  'components/LanguageSwitcher.tsx',
  'components/HomePageClient.tsx',
  'lib/locale.ts'
];
componentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} 存在`);
  } else {
    console.log(`   ❌ ${file} 不存在`);
  }
});

// 4. 检查翻译完整性
console.log('\n🔍 检查翻译完整性:');
try {
  const zhContent = JSON.parse(fs.readFileSync('messages/zh.json', 'utf8'));
  const enContent = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
  
  const zhKeys = getAllKeys(zhContent);
  const enKeys = getAllKeys(enContent);
  
  const missingInEn = zhKeys.filter(key => !enKeys.includes(key));
  const missingInZh = enKeys.filter(key => !zhKeys.includes(key));
  
  if (missingInEn.length === 0 && missingInZh.length === 0) {
    console.log('   ✅ 翻译完整性检查通过');
  } else {
    if (missingInEn.length > 0) {
      console.log(`   ⚠️  英文翻译缺失: ${missingInEn.join(', ')}`);
    }
    if (missingInZh.length > 0) {
      console.log(`   ⚠️  中文翻译缺失: ${missingInZh.join(', ')}`);
    }
  }
} catch (error) {
  console.log(`   ❌ 翻译完整性检查失败: ${error.message}`);
}

// 5. 检查 package.json 依赖
console.log('\n📦 检查依赖:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.dependencies && packageJson.dependencies['next-intl']) {
    console.log(`   ✅ next-intl 已安装: ${packageJson.dependencies['next-intl']}`);
  } else {
    console.log('   ❌ next-intl 未安装');
  }
} catch (error) {
  console.log(`   ❌ 无法读取 package.json: ${error.message}`);
}

console.log('\n✅ 国际化功能测试完成！');

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}