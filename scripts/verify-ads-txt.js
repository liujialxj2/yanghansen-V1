#!/usr/bin/env node

/**
 * 验证 Google AdSense 配置是否正确
 * 包括 ads.txt 文件和 meta 标签
 */

const fs = require('fs')
const path = require('path')

const ADS_TXT_PATH = path.join(__dirname, '../public/ads.txt')
const LAYOUT_PATH = path.join(__dirname, '../app/layout.tsx')
const EXPECTED_ADS_TXT = 'google.com, pub-1093223025550160, DIRECT, f08c47fec0942fa0'
const EXPECTED_META_TAG = '<meta name="google-adsense-account" content="ca-pub-1093223025550160" />'

console.log('🔍 验证 Google AdSense 配置...\n')

let hasErrors = false
let layoutContent = ''

try {
  // 1. 验证 ads.txt 文件
  console.log('📄 检查 ads.txt 文件...')
  
  if (!fs.existsSync(ADS_TXT_PATH)) {
    console.error('❌ ads.txt 文件不存在！')
    console.log('📍 预期位置:', ADS_TXT_PATH)
    hasErrors = true
  } else {
    const adsContent = fs.readFileSync(ADS_TXT_PATH, 'utf8').trim()
    
    if (adsContent === EXPECTED_ADS_TXT) {
      console.log('✅ ads.txt 文件配置正确！')
      console.log(`   内容: "${adsContent}"`)
    } else {
      console.error('❌ ads.txt 文件内容不正确！')
      console.log('📋 预期内容:', EXPECTED_ADS_TXT)
      console.log('📋 实际内容:', adsContent)
      hasErrors = true
    }
  }

  console.log()

  // 2. 验证 layout.tsx 中的 meta 标签
  console.log('🏷️ 检查 AdSense meta 标签...')
  
  if (!fs.existsSync(LAYOUT_PATH)) {
    console.error('❌ layout.tsx 文件不存在！')
    console.log('📍 预期位置:', LAYOUT_PATH)
    hasErrors = true
  } else {
    layoutContent = fs.readFileSync(LAYOUT_PATH, 'utf8')
    
    if (layoutContent.includes('name="google-adsense-account"') && 
        layoutContent.includes('content="ca-pub-1093223025550160"')) {
      console.log('✅ AdSense meta 标签配置正确！')
      console.log('   标签: <meta name="google-adsense-account" content="ca-pub-1093223025550160" />')
    } else {
      console.error('❌ layout.tsx 中缺少 AdSense meta 标签！')
      console.log('📋 预期标签:', EXPECTED_META_TAG)
      hasErrors = true
    }
  }

  console.log()

  // 3. 验证 AdSense 脚本
  console.log('📜 检查 AdSense 脚本...')
  
  if (layoutContent && layoutContent.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) {
    console.log('✅ AdSense 脚本配置正确！')
    console.log('   脚本: adsbygoogle.js')
  } else {
    console.error('❌ layout.tsx 中缺少 AdSense 脚本！')
    hasErrors = true
  }

} catch (error) {
  console.error('❌ 验证过程中出错:', error.message)
  hasErrors = true
}

console.log()

if (hasErrors) {
  console.error('❌ AdSense 配置验证失败！请修复上述问题。')
  process.exit(1)
} else {
  console.log('🎉 Google AdSense 配置验证完成！')
  console.log()
  console.log('📋 配置摘要:')
  console.log('✅ ads.txt 文件已正确配置')
  console.log('✅ AdSense meta 标签已添加')
  console.log('✅ AdSense 脚本已加载')
  console.log()
  console.log('🌐 部署后访问地址:')
  console.log('- https://yanghansen.blog/ads.txt')
  console.log('- https://yang-hansen.vercel.app/ads.txt')
  console.log()
  console.log('🚀 现在可以等待 Google AdSense 审核通过！')
}