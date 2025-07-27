#!/usr/bin/env node

/**
 * 重启开发服务器并测试水合错误修复
 */

const { spawn, exec } = require('child_process')
const fs = require('fs')

console.log('🔄 重启开发服务器并测试水合错误修复...')

// 1. 首先运行测试验证
console.log('1️⃣ 运行修复验证测试...')
exec('node scripts/test-hydration-fix.js', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ 测试失败:', error)
    return
  }
  
  console.log(stdout)
  
  // 2. 清理可能的缓存
  console.log('2️⃣ 清理Next.js缓存...')
  exec('rm -rf .next', (error) => {
    if (error) {
      console.log('⚠️  无法清理.next目录，继续...')
    } else {
      console.log('✅ 已清理.next缓存目录')
    }
    
    // 3. 启动开发服务器
    console.log('3️⃣ 启动开发服务器...')
    console.log('🚀 正在启动 npm run dev...')
    
    const devServer = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    })
    
    // 处理进程退出
    process.on('SIGINT', () => {
      console.log('\n🛑 正在停止开发服务器...')
      devServer.kill('SIGINT')
      process.exit(0)
    })
    
    devServer.on('close', (code) => {
      console.log(`\n🛑 开发服务器已停止 (退出码: ${code})`)
    })
  })
})

// 显示测试指南
setTimeout(() => {
  console.log('\n📋 测试指南:')
  console.log('1. 等待服务器启动完成')
  console.log('2. 打开浏览器访问:')
  console.log('   - http://localhost:3000/zh (中文版)')
  console.log('   - http://localhost:3000/en (英文版)')
  console.log('3. 打开浏览器开发者工具')
  console.log('4. 检查控制台是否还有Hydration错误')
  console.log('5. 测试语言切换功能')
  console.log('6. 测试页面导航')
  console.log('\n按 Ctrl+C 停止服务器')
}, 2000)