#!/usr/bin/env node

/**
 * 验证 ads.txt 文件是否正确配置
 */

const fs = require('fs')
const path = require('path')

const ADS_TXT_PATH = path.join(__dirname, '../public/ads.txt')
const EXPECTED_CONTENT = 'google.com, pub-1093223025550160, DIRECT, f08c47fec0942fa0'

console.log('🔍 验证 ads.txt 文件...\n')

try {
  // 检查文件是否存在
  if (!fs.existsSync(ADS_TXT_PATH)) {
    console.error('❌ ads.txt 文件不存在！')
    console.log('📍 预期位置:', ADS_TXT_PATH)
    process.exit(1)
  }

  // 读取文件内容
  const content = fs.readFileSync(ADS_TXT_PATH, 'utf8').trim()
  
  console.log('📄 ads.txt 文件内容:')
  console.log(`"${content}"`)
  console.log()

  // 验证内容是否正确
  if (content === EXPECTED_CONTENT) {
    console.log('✅ ads.txt 文件配置正确！')
    console.log()
    console.log('🌐 部署后可通过以下URL访问:')
    console.log('- https://yanghansen.blog/ads.txt')
    console.log('- https://yang-hansen.vercel.app/ads.txt')
    console.log()
    console.log('📝 文件内容解析:')
    console.log('- google.com: 广告系统域名')
    console.log('- pub-1093223025550160: 你的AdSense发布商ID')
    console.log('- DIRECT: 直接关系')
    console.log('- f08c47fec0942fa0: Google认证ID')
  } else {
    console.error('❌ ads.txt 文件内容不正确！')
    console.log('📋 预期内容:', EXPECTED_CONTENT)
    console.log('📋 实际内容:', content)
    process.exit(1)
  }

} catch (error) {
  console.error('❌ 验证过程中出错:', error.message)
  process.exit(1)
}

console.log('\n🎉 ads.txt 验证完成！')