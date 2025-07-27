'use client'

import VideoList from '@/components/VideoList'
import videosData from '@/data/videos.json'
import { useTranslations, useLocale } from 'next-intl'
import { useSafeData } from '@/hooks/useSafeData'
import { ChineseDetector } from '@/components/ChineseDetector'
import { VideoPageErrorBoundary } from '@/components/VideoErrorBoundary'
import { formatDateConsistent } from '@/lib/date-utils'
import { sanitizeVideoData } from '@/lib/video-data-sanitizer'

export default function VideosPage() {
  const tVideo = useTranslations('VideoPage')
  const locale = useLocale()
  
  // Use safe data filtering
  const safeVideosData = useSafeData(videosData)
  
  // Extract all videos from safe data
  const allVideos = []
  
  // Add featured videos
  if (safeVideosData.featured) {
    allVideos.push(safeVideosData.featured)
  }
  
  // Add category videos
  if (safeVideosData.categories) {
    Object.values(safeVideosData.categories).forEach(categoryVideos => {
      if (Array.isArray(categoryVideos)) {
        allVideos.push(...categoryVideos)
      }
    })
  }
  
  // Remove duplicates (based on youtubeId)
  const uniqueVideos = allVideos.filter((video, index, self) => 
    index === self.findIndex(v => v.youtubeId === video.youtubeId)
  )
  
  // Sanitize video data for current locale
  const sanitizedVideos = sanitizeVideoData(uniqueVideos, locale)
  
  // Sanitize categories data as well
  const sanitizedCategories = safeVideosData.categories ? 
    Object.fromEntries(
      Object.entries(safeVideosData.categories).map(([key, videos]) => [
        key, 
        sanitizeVideoData(Array.isArray(videos) ? videos : [], locale)
      ])
    ) : undefined
  
  // Format last updated date consistently
  const lastUpdatedDate = safeVideosData.lastUpdated 
    ? formatDateConsistent(safeVideosData.lastUpdated, { 
        locale: locale === 'zh' ? 'zh-CN' : 'en-US',
        format: 'short'
      })
    : formatDateConsistent(new Date(), { 
        locale: locale === 'zh' ? 'zh-CN' : 'en-US',
        format: 'short'
      })
  
  // Debug info (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Videos page - total videos:', sanitizedVideos.length)
  }

  return (
    <ChineseDetector>
      <VideoPageErrorBoundary>
        <div className="min-h-screen py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 text-gray-800">
                {tVideo('title')}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Watch Yang Hansen's exciting game highlights and training videos
              </p>
              <div className="mt-4 text-sm text-gray-500">
                {sanitizedVideos.length} videos • Last updated: {lastUpdatedDate}
              </div>
            </div>
            
            <VideoList 
              videos={sanitizedVideos}
              categories={sanitizedCategories}
              showFilters={true}
              itemsPerPage={12}
            />
          </div>
        </div>
      </VideoPageErrorBoundary>
    </ChineseDetector>
  )
}