#!/usr/bin/env node

/**
 * 验证水合错误修复是否正确应用
 */

const fs = require('fs')

console.log('🔍 验证水合错误修复...')

let allGood = true

// 检查LanguageSwitcher组件
console.log('\n📁 检查 LanguageSwitcher.tsx...')
const languageSwitcherPath = 'components/LanguageSwitcher.tsx'
if (fs.existsSync(languageSwitcherPath)) {
  const content = fs.readFileSync(languageSwitcherPath, 'utf8')
  
  const checks = [
    { pattern: /useState\(false\)/, name: 'mounted状态初始化' },
    { pattern: /useEffect.*setMounted\(true\)/, name: 'useEffect设置mounted' },
    { pattern: /if \(!mounted\)/, name: '挂载检查' },
    { pattern: /typeof window !== 'undefined'/, name: 'window检查' },
    { pattern: /disabled/, name: '占位符按钮' }
  ]
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`)
    } else {
      console.log(`❌ ${check.name}`)
      allGood = false
    }
  })
} else {
  console.log('❌ LanguageSwitcher.tsx 不存在')
  allGood = false
}

// 检查Footer组件
console.log('\n📁 检查 Footer.tsx...')
const footerPath = 'components/Footer.tsx'
if (fs.existsSync(footerPath)) {
  const content = fs.readFileSync(footerPath, 'utf8')
  
  if (content.includes('{ locale = \'zh\' }')) {
    console.log('✅ Footer接收locale参数')
  } else {
    console.log('❌ Footer缺少locale参数')
    allGood = false
  }
  
  if (!content.includes('\'use client\'')) {
    console.log('✅ Footer是服务端组件')
  } else {
    console.log('⚠️  Footer是客户端组件（可能不是最优）')
  }
} else {
  console.log('❌ Footer.tsx 不存在')
  allGood = false
}

// 检查Layout组件
console.log('\n📁 检查 Layout.tsx...')
const layoutPath = 'app/[locale]/layout.tsx'
if (fs.existsSync(layoutPath)) {
  const content = fs.readFileSync(layoutPath, 'utf8')
  
  if (content.includes('<Footer locale={params.locale}')) {
    console.log('✅ Layout传递locale给Footer')
  } else {
    console.log('❌ Layout没有传递locale给Footer')
    allGood = false
  }
} else {
  console.log('❌ Layout.tsx 不存在')
  allGood = false
}

// 检查Next.js配置
console.log('\n📁 检查 next.config.js...')
const nextConfigPath = 'next.config.js'
if (fs.existsSync(nextConfigPath)) {
  const content = fs.readFileSync(nextConfigPath, 'utf8')
  
  if (content.includes('reactStrictMode')) {
    console.log('✅ 启用了React严格模式')
  } else {
    console.log('⚠️  建议启用React严格模式')
  }
} else {
  console.log('❌ next.config.js 不存在')
  allGood = false
}

// 总结
console.log('\n' + '='.repeat(50))
if (allGood) {
  console.log('🎉 所有水合错误修复都已正确应用！')
  console.log('\n下一步：')
  console.log('1. 运行: npm run dev')
  console.log('2. 访问: http://localhost:3000/zh')
  console.log('3. 检查浏览器控制台是否还有错误')
} else {
  console.log('⚠️  发现一些问题，请检查上述错误')
  console.log('\n建议：')
  console.log('1. 重新运行修复脚本: node scripts/fix-hydration-error.js')
  console.log('2. 手动检查有问题的文件')
}

console.log('\n📋 如果问题持续存在：')
console.log('1. 清除浏览器缓存')
console.log('2. 删除.next目录: rm -rf .next')
console.log('3. 重启开发服务器')
console.log('4. 检查具体的错误信息')