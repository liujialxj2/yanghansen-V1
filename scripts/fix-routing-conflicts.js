#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 修复路由冲突...')

// 需要删除的旧路由文件和目录
const filesToRemove = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/about',
  'app/news',
  'app/videos', 
  'app/stats',
  'app/media',
  'app/test-news',
  'app/debug-media'
]

// 删除冲突的路由文件
filesToRemove.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath)
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath)
    
    if (stats.isDirectory()) {
      console.log(`📁 删除目录: ${filePath}`)
      fs.rmSync(fullPath, { recursive: true, force: true })
    } else {
      console.log(`📄 删除文件: ${filePath}`)
      fs.unlinkSync(fullPath)
    }
  }
})

console.log('✅ 路由冲突修复完成')
console.log('📝 现在只保留多语言路由结构 app/[locale]/')