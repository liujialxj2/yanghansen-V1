import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User, Share2, ExternalLink, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import NewsImageSimple from '@/components/NewsImageSimple'
import newsData from '@/data/news.json'
import { notFound } from 'next/navigation'

interface NewsDetailPageProps {
  params: {
    slug: string
  }
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  // 查找对应的{tNav("news")}文章
  const article = [...newsData.articles, newsData.featured].find(
    (item) => item.slug === params.slug || item.id.toString() === params.slug
  )

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/news" className="inline-flex items-center text-blazers-red hover:text-blazers-red/80 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Article Header */}
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

        {/* Article Image */}
        <div className="mb-8">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
            <NewsImageSimple
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* News Summary and Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">News Summary</h2>
          
          {/* Description */}
          {article.summary && (
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed text-base">
                {article.summary}
              </p>
            </div>
          )}
          
          {/* Content Fragment */}
          {article.content && article.content !== article.summary && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Content Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {article.content.substring(0, 200)}...
                </p>
                {article.content.length > 200 && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    ...read more in the original article
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Read Full Article Button */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span>Source: {article.source?.name || article.author}</span>
              </div>
              <Link 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blazers-red text-white px-6 py-3 rounded-lg hover:bg-blazers-red/90 transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Read Full Article
              </Link>
            </div>
          </div>
        </div>

        {/* Article Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <ExternalLink className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">About This Article</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                This is a real news report from <strong>{article.source?.name || article.author}</strong>.
                The content above is a summary and preview. Click "Read Full Article" to view the complete content on the original website.
              </p>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Share this article:</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                WeChat
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Weibo
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Copy Link
              </Button>
            </div>
          </div>
        </div>



        {/* Related Articles */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h3>
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
                    <NewsImageSimple
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