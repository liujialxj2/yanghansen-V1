import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import newsData from '@/data/news.json'

interface NewsDetailPageProps {
  params: {
    slug: string
  }
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  // 查找对应的新闻文章
  const article = [...newsData.articles, newsData.featured].find(
    (item) => item.slug === params.slug || item.id.toString() === params.slug
  )

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">文章未找到</h1>
          <p className="text-gray-600 mb-6">抱歉，您访问的文章不存在或已被删除。</p>
          <Link href="/news">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回新闻列表
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/news" className="inline-flex items-center text-blazers-red hover:text-blazers-red/80 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回新闻列表
          </Link>
        </div>
      </div>

      {/* 文章内容 */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 文章头部 */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span className="bg-blazers-red text-white px-2 py-1 rounded text-xs font-medium">
              {article.category}
            </span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(article.date)}
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {article.author}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            {article.summary}
          </p>
        </header>

        {/* 文章图片 */}
        <div className="mb-8">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* 分享按钮 */}
        <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">分享这篇文章：</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                微信
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                微博
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                复制链接
              </Button>
            </div>
          </div>
        </div>

        {/* 文章正文 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6 text-gray-800 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* 相关文章 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">相关文章</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {newsData.articles
              .filter(item => item.id !== article.id)
              .slice(0, 4)
              .map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  href={`/news/${relatedArticle.slug || relatedArticle.id}`}
                  className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                    <Image
                      src={relatedArticle.image}
                      alt={relatedArticle.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
                      {relatedArticle.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{relatedArticle.category}</span>
                      <span>•</span>
                      <span>{formatDate(relatedArticle.date)}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </div>
  )
}

// 生成静态路径
export async function generateStaticParams() {
  const allArticles = [...newsData.articles, newsData.featured]
  
  return allArticles.map((article) => ({
    slug: article.slug || article.id.toString(),
  }))
}