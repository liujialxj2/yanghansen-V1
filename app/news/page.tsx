'use client'

import Link from 'next/link'
import { Calendar, Clock, ExternalLink, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import NewsImageSimple from '@/components/NewsImageSimple'
import newsData from '@/data/news.json'
import statsData from '@/data/stats.json'
import { useTranslations } from 'next-intl'
import { useSafeData } from '@/hooks/useSafeData'
import { ChineseDetector } from '@/components/ChineseDetector'

export default function NewsPage() {
  const t = useTranslations('NewsPage')
  const tStats = useTranslations('Stats')
  
  // 使用安全{t("stats")}过滤
  const safeNewsData = useSafeData(newsData)
  const safeStatsData = useSafeData(statsData)
  const { featured, articles, trending } = safeNewsData
  const { currentSeason } = safeStatsData

  return (
    <ChineseDetector>
      <div className="min-h-screen py-8">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-blazers-red to-blazers-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Article */}
            <Link href={`/news/${featured.slug || featured.id}`}>
              <article className="bg-white rounded-lg shadow-lg overflow-hidden mb-12 cursor-pointer hover:shadow-xl transition-shadow">
                <div className="relative h-64 md:h-80">
                  <NewsImageSimple
                    src={featured.image}
                    alt={featured.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blazers-red text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {t('featuredNews')}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">{featured.category}</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(featured.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{featured.readTime}</span>
                    </div>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 hover:text-blazers-red transition-colors">
                    {featured.title}
                  </h1>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {featured.summary}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="text-sm text-gray-500">
                      {t('source')}: {featured.author}
                    </div>
                    <div className="text-blazers-red font-medium">
                      {t('clickDetails')} →
                    </div>
                  </div>
                </div>
              </article>
            </Link>

            {/* Other Articles */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {t('moreNews')}
              </h2>
              {articles.map((article) => (
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
                            {t('source')}: {article.author}
                          </div>
                          <div className="text-blazers-red font-medium">
                            {t('readFull')} →
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="blazers" size="lg">
{t('loadMore')}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trending Topics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blazers-red" />
                <h3 className="text-lg font-bold text-gray-800">{t('trendingTopics')}</h3>
              </div>
              <div className="space-y-3">
                {trending.map((topic, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <div className="w-6 h-6 bg-blazers-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 hover:text-blazers-red transition-colors">
                      {topic}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">{t('seasonStats')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{tStats('ppg')}</span>
                  <span className="text-blazers-red font-bold">{currentSeason.averages.points}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{tStats('rpg')}</span>
                  <span className="text-blazers-red font-bold">{currentSeason.averages.rebounds}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{tStats('bpg')}</span>
                  <span className="text-blazers-red font-bold">{currentSeason.averages.blocks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{tStats('fgPercent')}</span>
                  <span className="text-blazers-red font-bold">
                    {(currentSeason.shooting.fieldGoalPercentage * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/stats">{tStats('viewAll')}</Link>
                </Button>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-blazers-red text-white rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">{t('subscribe')}</h3>
              <p className="text-gray-200 text-sm mb-4">
                {t('subscribeDesc')}
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2 rounded-lg text-gray-800 placeholder-gray-500"
                />
                <Button variant="outline" className="w-full text-blazers-red border-white bg-white hover:bg-gray-100">
                  {t('subscribe')}
                </Button>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">{t('followSocial')}</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                  <span className="text-gray-700">Official Twitter</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">I</span>
                  </div>
                  <span className="text-gray-700">Instagram Updates</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">W</span>
                  </div>
                  <span className="text-gray-700">Official Weibo</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ChineseDetector>
  )
}