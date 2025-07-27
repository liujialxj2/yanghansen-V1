'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import NewsImageSimple from '@/components/NewsImageSimple'
import LoadMoreNews from '@/components/LoadMoreNews'

interface NewsArticle {
  id: string
  title: string
  summary: string
  image: string
  date: string
  category: string
  readTime: string
  author: string
  slug: string
}

interface NewsListProps {
  articles: NewsArticle[]
  itemsPerPage?: number
}

export default function NewsList({ articles, itemsPerPage = 4 }: NewsListProps) {
  const [displayCount, setDisplayCount] = useState(itemsPerPage)
  const [loading, setLoading] = useState(false)
  const tCommon = useTranslations('Common')
  const tNews = useTranslations('NewsPage')

  const displayedArticles = articles.slice(0, displayCount)
  const hasMore = displayCount < articles.length

  const handleLoadMore = async () => {
    setLoading(true)
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    setDisplayCount(prev => Math.min(prev + itemsPerPage, articles.length))
    setLoading(false)
  }

  return (
    <div>
      {/* Articles List */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
{tNews('moreNews')}
        </h2>
        {displayedArticles.map((article) => (
          <Link key={article.id} href={`/news/${article.slug || article.id}`}>
            <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <div className="relative h-48 md:h-full">
                    <NewsImageSimple
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">{article.category}</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(article.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-blazers-red transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {tNews("source")}: {article.author}
                    </div>
                    <div className="text-blazers-red font-medium">
                      {tNews("readFull")} →
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      <LoadMoreNews 
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loading={loading}
      />

      {/* Statistics */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Showing {displayedArticles.length} / {articles.length} articles
      </div>
    </div>
  )
}