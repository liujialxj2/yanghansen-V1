#!/usr/bin/env node

/**
 * Google重新索引提交脚本
 * 生成需要在Google Search Console中提交的URL列表
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Google Search Console 重新索引提交清单\n')

const baseUrl = 'https://yanghansen.blog'
const urlsToSubmit = [
  '/',
  '/about',
  '/news', 
  '/videos',
  '/stats',
  '/privacy',
  '/terms'
]

console.log('📋 需要在Google Search Console中逐个提交的URL:\n')

urlsToSubmit.forEach((url, index) => {
  const fullUrl = baseUrl + url
  console.log(`${index + 1}. ${fullUrl}`)
})

console.log('\n🚀 提交步骤:')
console.log('1. 访问: https://search.google.com/search-console')
console.log('2. 选择你的网站资源')
console.log('3. 点击左侧菜单中的"网址检查"')
console.log('4. 逐个输入上述URL')
console.log('5. 对每个URL点击"请求编入索引"\n')

console.log('⚡ 重要提示:')
console.log('• 每天有索引请求限制，优先提交主要页面')
console.log('• 首页和About页面最重要，优先提交')
console.log('• 提交后等待1-3天查看效果')
console.log('• 在GSC中监控"覆盖率"报告\n')

// 生成sitemap验证
console.log('📄 Sitemap验证:')
console.log(`• Sitemap URL: ${baseUrl}/sitemap.xml`)
console.log('• 在GSC中的"站点地图"部分提交此URL\n')

// 生成robots.txt验证
console.log('🤖 Robots.txt验证:')
console.log(`• Robots.txt URL: ${baseUrl}/robots.txt`)
console.log('• 确保文件可访问且内容正确\n')

console.log('✅ 当前网站状态检查:')
console.log('• 网站标题: Yang Hansen | NBA Portland Trail Blazers')
console.log('• 网站描述: Yang Hansen Official Website - Portland Trail Blazers Center, Rising Chinese NBA Star')
console.log('• 主要内容: 个人简介、统计数据、视频、新闻')
console.log('• 这些信息应该替换掉"Parking Page"描述\n')

console.log('🎯 预期结果:')
console.log('• 3-7天内Google搜索结果应该更新')
console.log('• 新的搜索结果将显示正确的网站标题和描述')
console.log('• "Parking Page"信息将被替换\n')

console.log('📞 如果问题持续:')
console.log('• 在GSC中使用"反馈"功能报告问题')
console.log('• 说明网站内容已更新，请求重新评估')
console.log('• 可以联系Google支持团队\n')

console.log('🚀 现在就开始提交这些URL到Google Search Console！')

// 保存URL列表到文件
const urlList = urlsToSubmit.map(url => baseUrl + url).join('\n')
fs.writeFileSync('google-reindex-urls.txt', urlList)
console.log('\n📝 URL列表已保存到: google-reindex-urls.txt')