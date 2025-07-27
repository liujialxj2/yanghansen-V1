#!/usr/bin/env node

/**
 * 测试水合错误修复的脚本
 */

console.log('🧪 测试水合错误修复...')

const fs = require('fs')

// 检查关键文件是否存在
const filesToCheck = [
  'components/LanguageSwitcher.tsx',
  'components/Navigation.tsx',
  'app/[locale]/layout.tsx',
  'app/[locale]/page.tsx'
]

console.log('📁 检查关键文件...')
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} 存在`)
  } else {
    console.log(`❌ ${file} 不存在`)
  }
})

// 检查LanguageSwitcher是否包含防水合错误的代码
const languageSwitcherPath = 'components/LanguageSwitcher.tsx'
if (fs.existsSync(languageSwitcherPath)) {
  const content = fs.readFileSync(languageSwitcherPath, 'utf8')
  
  if (content.includes('useEffect') && content.includes('setMounted')) {
    console.log('✅ LanguageSwitcher包含防水合错误的代码')
  } else {
    console.log('⚠️  LanguageSwitcher可能缺少防水合错误的代码')
  }
  
  if (content.includes('typeof window !== \'undefined\'')) {
    console.log('✅ LanguageSwitcher正确处理了localStorage')
  } else {
    console.log('⚠️  LanguageSwitcher可能没有正确处理localStorage')
  }
}

// 检查next.config.js是否包含reactStrictMode
const nextConfigPath = 'next.config.js'
if (fs.existsSync(nextConfigPath)) {
  const content = fs.readFileSync(nextConfigPath, 'utf8')
  
  if (content.includes('reactStrictMode: true')) {
    console.log('✅ Next.js配置启用了严格模式')
  } else {
    console.log('⚠️  建议在next.config.js中启用reactStrictMode')
  }
}

console.log('')
console.log('🎉 水合错误修复测试完成')
console.log('')
console.log('建议的下一步：')
console.log('1. 重启开发服务器：npm run dev')
console.log('2. 清除浏览器缓存')
console.log('3. 检查浏览器控制台是否还有水合错误')
console.log('4. 如果问题持续，请检查具体的错误信息')