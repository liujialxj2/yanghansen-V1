'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, Play, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSafeData } from '@/hooks/useSafeData'
import { ChineseDetector } from '@/components/ChineseDetector'

interface HomePageClientProps {
  basicInfo: any
  biography: any
  currentSeason: any
  recentGames: any[]
}

export function HomePageClient({ basicInfo, biography, currentSeason, recentGames }: HomePageClientProps) {
  const t = useTranslations('HomePage')
  const tCommon = useTranslations('Common')
  
  // 使用安全数据，自动过滤中文
  const safeBasicInfo = useSafeData(basicInfo)
  const safeBiography = useSafeData(biography)
  const safeCurrentSeason = useSafeData(currentSeason)
  const safeRecentGames = useSafeData(recentGames)

  return (
    <ChineseDetector>
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                {t('heroTitle')}
                <span className="block text-2xl lg:text-3xl font-normal text-gray-200 mt-2">
                  {safeBasicInfo.englishName}
                </span>
              </h1>
              <div className="text-xl lg:text-2xl mb-6 text-gray-200">
                {safeBasicInfo.team} • {safeBasicInfo.position} • {safeBasicInfo.height}
              </div>
              <p className="text-lg mb-8 leading-relaxed max-w-2xl">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild variant="blazers" size="lg">
                  <Link href="/about">{t('aboutMe')}</Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="text-white border-2 border-white hover:bg-white hover:text-blazers-red">
                  <Link href="/stats">{t('viewStats')}</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt={`${safeBasicInfo.name} - ${safeBasicInfo.englishName}`}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white text-blazers-red rounded-full p-4 shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">#{safeBasicInfo.jerseyNumber}</div>
                    <div className="text-sm">{safeBasicInfo.position}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('youthLeagueStats')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-blazers-red mb-2">
                {safeCurrentSeason.averages.points}
              </div>
              <div className="text-gray-600">{t('ppg')}</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-blazers-red mb-2">
                {safeCurrentSeason.averages.rebounds}
              </div>
              <div className="text-gray-600">{t('rpg')}</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-blazers-red mb-2">
                {safeCurrentSeason.averages.blocks}
              </div>
              <div className="text-gray-600">{t('bpg')}</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-blazers-red mb-2">
                {(safeCurrentSeason.shooting.fieldGoalPercentage * 100).toFixed(1)}%
              </div>
              <div className="text-gray-600">{t('fgPercent')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Games */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              {t('recentGames')}
            </h2>
            <Button asChild variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
              <Link href="/stats">{tCommon('viewAll')}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeRecentGames.slice(0, 3).map((game, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-semibold text-gray-800">{game.opponent}</div>
                    <div className="text-sm text-gray-600">{game.date}</div>
                  </div>
                  <div className={`font-bold ${game.result.startsWith('W') ? 'text-green-600' : 'text-red-600'}`}>
                    {game.result}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blazers-red">{game.stats.points}</div>
                    <div className="text-xs text-gray-600">{t('points')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blazers-red">{game.stats.rebounds}</div>
                    <div className="text-xs text-gray-600">{t('rebounds')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blazers-red">{game.stats.blocks}</div>
                    <div className="text-xs text-gray-600">{t('blocks')}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 italic">
                  {game.highlights}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t('exploreMore')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/about" className="group">
              <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-blazers-red rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blazers-red/90 transition-colors">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{t('personalProfile')}</h3>
                <p className="text-gray-600 text-sm">{t('personalProfileDesc')}</p>
              </div>
            </Link>
            
            <Link href="/stats" className="group">
              <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-blazers-red rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blazers-red/90 transition-colors">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{t('dataStats')}</h3>
                <p className="text-gray-600 text-sm">{t('dataStatsDesc')}</p>
              </div>
            </Link>
            
            <Link href="/videos" className="group">
              <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-blazers-red rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blazers-red/90 transition-colors">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{t('videos')}</h3>
                <p className="text-gray-600 text-sm">{t('videosDesc')}</p>
              </div>
            </Link>
            
            <Link href="/news" className="group">
              <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-blazers-red rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blazers-red/90 transition-colors">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{t('latestNews')}</h3>
                <p className="text-gray-600 text-sm">{t('latestNewsDesc')}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blazers-red text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('followJourney')}
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            {t('followJourneyDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg" className="text-blazers-red border-white bg-white hover:bg-gray-100">
              <Link href="/news">{t('latestNewsBtn')}</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white border-white border hover:bg-white hover:text-blazers-red">
              <Link href="/videos">{t('watchHighlights')}</Link>
            </Button>
          </div>
        </div>
      </section>
      </div>
    </ChineseDetector>
  )
}