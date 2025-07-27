#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 完全移除多语言功能，回到单语言结构...');

// 1. 删除多语言路由目录
const i18nPaths = [
  'app/[locale]',
  'locales',
  'lib/i18n.ts',
  'lib/data-i18n.ts', 
  'lib/translation-utils.ts',
  'lib/metadata.ts',
  'components/LanguageSwitcher.tsx',
  'middleware.ts'
];

console.log('\n🗑️  删除多语言相关文件和目录:');
i18nPaths.forEach(pathToDelete => {
  const fullPath = path.join(process.cwd(), pathToDelete);
  
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ 删除: ${pathToDelete}`);
    
    if (fs.statSync(fullPath).isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
  } else {
    console.log(`   ⚠️  不存在: ${pathToDelete}`);
  }
});

// 2. 删除多语言相关的脚本和报告
const i18nScripts = [
  'scripts/test-i18n-functionality.js',
  'scripts/test-i18n-setup.js', 
  'scripts/validate-translations.js',
  'scripts/fix-hydration-error.js',
  'scripts/test-simple-i18n.js',
  'HYDRATION_ERROR_FIX_REPORT.md',
  'I18N_FIX_REPORT.md',
  'MULTILINGUAL_COMPLETION_REPORT.md',
  '.kiro/specs/multilingual-internationalization'
];

console.log('\n🗑️  删除多语言相关脚本和文档:');
i18nScripts.forEach(scriptPath => {
  const fullPath = path.join(process.cwd(), scriptPath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ 删除: ${scriptPath}`);
    
    if (fs.statSync(fullPath).isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
  }
});

// 3. 检查并修复Navigation组件
console.log('\n🔧 修复Navigation组件...');
const navigationPath = 'components/Navigation.tsx';
if (fs.existsSync(navigationPath)) {
  const navigationContent = `'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: '/', label: '首页', en: 'Home' },
    { href: '/about', label: '关于', en: 'About' },
    { href: '/stats', label: '数据', en: 'Stats' },
    { href: '/videos', label: '视频', en: 'Videos' },
    { href: '/news', label: '新闻', en: 'News' },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blazers-red rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">YH</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-blazers-red">杨瀚森</div>
              <div className="text-sm text-gray-600">Yang Hansen</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blazers-red transition-colors duration-200 font-medium"
              >
                <span className="block">{item.label}</span>
                <span className="block text-xs text-gray-500">{item.en}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-blazers-red hover:bg-gray-50 rounded-md transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-sm text-gray-500 ml-2">{item.en}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}`;

  fs.writeFileSync(navigationPath, navigationContent);
  console.log('   ✅ Navigation组件已修复');
}

// 4. 检查app目录结构
console.log('\n📁 当前app目录结构:');
function listAppDirectory(dir, prefix = '') {
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        console.log(`${prefix}📁 ${item}/`);
        if (prefix.length < 6) {
          listAppDirectory(fullPath, prefix + '  ');
        }
      } else {
        console.log(`${prefix}📄 ${item}`);
      }
    });
  } catch (error) {
    console.log(`${prefix}❌ 无法读取目录: ${error.message}`);
  }
}

listAppDirectory('app');

console.log('\n✅ 多语言功能已完全移除！');
console.log('\n📋 现在的路由结构:');
console.log('   - / (首页)');
console.log('   - /about (关于页面)');
console.log('   - /stats (数据页面)');
console.log('   - /news (新闻页面)');
console.log('   - /videos (视频页面)');
console.log('\n🚀 可以重启开发服务器测试了！');