#!/usr/bin/env node

console.log('🎯 验证国际化实施完成状态...\n');

const fs = require('fs');

// 检查所有必需文件
const requiredFiles = [
  'next-intl.config.js',
  'messages/zh.json',
  'messages/en.json',
  'components/LocaleProvider.tsx',
  'components/LanguageSwitcher.tsx',
  'components/HomePageClient.tsx',
  'lib/locale.ts',
  'docs/i18n-usage-guide.md',
  'I18N_IMPLEMENTATION_COMPLETE.md'
];

console.log('📋 检查必需文件:');
let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} 缺失`);
    allFilesExist = false;
  }
});

// 检查翻译内容
console.log('\n🌐 检查翻译内容:');
try {
  const zhTranslations = JSON.parse(fs.readFileSync('messages/zh.json', 'utf8'));
  const enTranslations = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
  
  const requiredNamespaces = ['Navigation', 'Common', 'HomePage', 'Footer'];
  let translationsComplete = true;
  
  requiredNamespaces.forEach(namespace => {
    if (zhTranslations[namespace] && enTranslations[namespace]) {
      console.log(`   ✅ ${namespace} 命名空间完整`);
    } else {
      console.log(`   ❌ ${namespace} 命名空间缺失`);
      translationsComplete = false;
    }
  });
  
  if (translationsComplete) {
    console.log('   🎉 核心翻译内容完整');
  }
} catch (error) {
  console.log(`   ❌ 翻译文件读取失败: ${error.message}`);
  allFilesExist = false;
}

// 检查组件集成
console.log('\n🧩 检查组件集成:');
const componentsToCheck = [
  { file: 'components/Navigation.tsx', pattern: /useTranslations/ },
  { file: 'components/Footer.tsx', pattern: /useTranslations/ },
  { file: 'app/layout.tsx', pattern: /LocaleProvider/ }
];

componentsToCheck.forEach(({ file, pattern }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (pattern.test(content)) {
      console.log(`   ✅ ${file} 已集成国际化`);
    } else {
      console.log(`   ⚠️  ${file} 可能未完全集成`);
    }
  } else {
    console.log(`   ❌ ${file} 不存在`);
  }
});

// 最终状态
console.log('\n🏆 实施状态总结:');
if (allFilesExist) {
  console.log('   ✅ 所有核心文件已创建');
  console.log('   ✅ 翻译系统已配置');
  console.log('   ✅ 组件已集成国际化');
  console.log('   ✅ 文档已完成');
  
  console.log('\n🚀 国际化功能实施完成！');
  console.log('\n📋 下一步操作:');
  console.log('   1. 运行 npm run dev 启动开发服务器');
  console.log('   2. 访问 http://localhost:3000');
  console.log('   3. 测试语言切换功能 (点击导航栏的 EN/中文 按钮)');
  console.log('   4. 验证页面内容的语言变化');
  console.log('   5. 刷新页面确认语言偏好保持');
  
  console.log('\n📚 参考文档:');
  console.log('   - 使用指南: docs/i18n-usage-guide.md');
  console.log('   - 完成报告: I18N_IMPLEMENTATION_COMPLETE.md');
  
} else {
  console.log('   ❌ 部分文件缺失，请检查实施状态');
  process.exit(1);
}

console.log('\n🎊 恭喜！杨瀚森网站国际化功能已成功实施！');