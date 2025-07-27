#!/usr/bin/env node

const { execSync } = require('child_process')

console.log('🧪 测试路由修复...')

// 执行路由冲突修复
console.log('1. 执行路由冲突修复...')
try {
  execSync('node scripts/fix-routing-conflicts.js', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ 路由修复失败:', error.message)
  process.exit(1)
}

// 重启开发服务器
console.log('\n2. 重启开发服务器...')
try {
  // 杀死现有的Next.js进程
  try {
    execSync('pkill -f "next dev"', { stdio: 'ignore' })
    console.log('✅ 已停止现有开发服务器')
  } catch (e) {
    console.log('ℹ️ 没有运行中的开发服务器')
  }

  // 等待一秒
  setTimeout(() => {
    console.log('🚀 启动开发服务器...')
    console.log('请在新终端中运行: npm run dev')
    console.log('\n📋 测试清单:')
    console.log('✅ 访问 http://localhost:3000 (应该重定向到 /zh)')
    console.log('✅ 访问 http://localhost:3000/zh (中文首页)')
    console.log('✅ 访问 http://localhost:3000/en (英文首页)')
    console.log('✅ 访问 http://localhost:3000/zh/about (关于页面)')
    console.log('✅ 访问 http://localhost:3000/zh/stats (数据页面)')
    console.log('✅ 访问 http://localhost:3000/zh/news (新闻页面)')
    console.log('✅ 访问 http://localhost:3000/zh/videos (视频页面)')
    console.log('\n🔍 检查是否还有水合错误')
  }, 1000)

} catch (error) {
  console.error('❌ 重启服务器失败:', error.message)
}

console.log('\n✅ 路由修复完成！')