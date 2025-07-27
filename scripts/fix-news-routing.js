#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 修复新闻路由问题...\n');

// 1. 确保新闻数据完整
const newsDataPath = path.join(process.cwd(), 'data/news.json');
const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf8'));

// 确保所有文章都有完整的内容
const updatedNewsData = {
  ...newsData,
  featured: {
    ...newsData.featured,
    content: newsData.featured.content || newsData.featured.summary
  },
  articles: newsData.articles.map(article => ({
    ...article,
    content: article.content || `详细介绍${article.title}的相关内容...`
  }))
};

fs.writeFileSync(newsDataPath, JSON.stringify(updatedNewsData, null, 2));
console.log('✅ 新闻数据已更新');

// 2. 检查并修复导航组件
const navPath = path.join(process.cwd(), 'components/Navigation.tsx');
if (fs.existsSync(navPath)) {
  let navContent = fs.readFileSync(navPath, 'utf8');
  
  // 确保导航链接使用正确的国际化路由
  if (navContent.includes('href="/news"')) {
    navContent = navContent.replace(/href="\/news"/g, 'href={`/${locale}/news`}');
    fs.writeFileSync(navPath, navContent);
    console.log('✅ 导航组件已更新');
  }
}

// 3. 创建简单的测试页面
const testPageContent = `import Link from 'next/link'

export default function NewsTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">新闻路由测试</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">测试链接:</h2>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li><Link href="/zh/news" className="text-blue-600 hover:underline">中文新闻页面</Link></li>
            <li><Link href="/en/news" className="text-blue-600 hover:underline">英文新闻页面</Link></li>
            <li><Link href="/zh/news/yang-hansen-blazers-summer-league-2025" className="text-blue-600 hover:underline">头条新闻详情</Link></li>
            <li><Link href="/zh/news/yang-hansen-draft-journey-2025" className="text-blue-600 hover:underline">普通文章详情</Link></li>
          </ul>
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold">路由说明:</h2>
          <p className="text-gray-600 mt-2">
            现在所有页面都使用国际化路由结构：
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-sm text-gray-600">
            <li>/zh/news - 中文新闻列表</li>
            <li>/en/news - 英文新闻列表</li>
            <li>/zh/news/[slug] - 中文新闻详情</li>
            <li>/en/news/[slug] - 英文新闻详情</li>
          </ul>
        </div>
      </div>
    </div>
  )
}`;

const testPagePath = path.join(process.cwd(), 'app/test-news/page.tsx');
fs.mkdirSync(path.dirname(testPagePath), { recursive: true });
fs.writeFileSync(testPagePath, testPageContent);
console.log('✅ 测试页面已创建: /test-news');

console.log('\n🚀 修复完成! 请按以下步骤测试:');
console.log('1. 访问测试页面: http://localhost:3000/test-news');
console.log('2. 点击测试链接验证路由');
console.log('3. 或直接访问: http://localhost:3000/zh/news');

console.log('\n📝 注意事项:');
console.log('- 旧的 /news 路由会自动重定向到 /zh/news');
console.log('- 所有新闻链接现在都需要包含语言前缀');
console.log('- 如果仍有404错误，请重启开发服务器');