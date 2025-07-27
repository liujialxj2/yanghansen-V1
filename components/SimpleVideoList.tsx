'use client'

import { useTranslations } from 'next-intl'

interface SimpleVideo {
  id: string
  title: string
  thumbnail: string
  duration: string
  channelTitle: string
  formattedViewCount: string
  category: string
}

interface SimpleVideoListProps {
  videos: SimpleVideo[]
}

export function SimpleVideoList({ videos }: SimpleVideoListProps) {
  const tVideo = useTranslations('VideoPage')
  
  console.log('SimpleVideoList - videos count:', videos?.length || 0)
  
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{tVideo('noVideos')}</h3>
        <p className="text-gray-500">Video data is empty or failed to load</p>
        <div className="mt-4 text-sm text-gray-400">
          <p>Debug info:</p>
          <p>videos: {videos ? 'exists' : 'null/undefined'}</p>
          <p>length: {videos?.length || 0}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        Showing {videos.length} videos
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-video">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image loading failed:', video.thumbnail)
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'
                }}
              />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                {video.title}
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Channel: {video.channelTitle}</div>
                <div>Views: {video.formattedViewCount}</div>
                <div>Category: {video.category}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}