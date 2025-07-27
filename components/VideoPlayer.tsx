'use client'

import { useState } from 'react'
import { Play, Clock, Eye, ThumbsUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { VideoThumbnail } from './SafeImage'
import { formatVideoDate } from '@/lib/date-utils'
import { SanitizedVideoData } from '@/lib/video-data-sanitizer'

interface VideoPlayerProps {
  video: {
    id: string
    youtubeId: string
    title: string
    description: string
    thumbnail: string
    duration: string
    viewCount: number
    formattedViewCount: string
    likeCount: number
    channelTitle: string
    publishedAt: string
    embedUrl: string
    watchUrl: string
    category: string
    tags: string[]
  }
  autoplay?: boolean
  showDetails?: boolean
}

export default function VideoPlayer({ video, autoplay = false, showDetails = true }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const tCommon = useTranslations('Common')

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Video playback area */}
      <div className="relative aspect-video bg-gray-900">
        {!isPlaying ? (
          // Thumbnail and play button
          <div className="relative w-full h-full group cursor-pointer" onClick={handlePlay}>
            <VideoThumbnail
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300" />
            
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors duration-300 shadow-lg">
                <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
              </div>
            </div>
            
            {/* Duration label */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-sm px-2 py-1 rounded">
              {video.duration}
            </div>
          </div>
        ) : (
          // YouTube embedded player
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>

      {/* Video information */}
      {showDetails && (
        <div className="p-6">
          {/* Title and basic information */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
              {video.title}
            </h3>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{video.formattedViewCount} views</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{video.likeCount.toLocaleString()} likes</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(video.publishedAt)}</span>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              Channel: <span className="font-medium">{video.channelTitle}</span>
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div className="mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {showFullDescription 
                  ? video.description 
                  : truncateDescription(video.description)
                }
              </p>
              
              {video.description.length > 150 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-blazers-red text-sm font-medium mt-2 hover:underline"
                >
                  {showFullDescription ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {video.tags.slice(0, 5).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {video.tags.length > 5 && (
                  <span className="text-gray-500 text-xs px-2 py-1">
                    +{video.tags.length - 5} {tCommon("more")}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3">
            {!isPlaying && (
              <button
                onClick={handlePlay}
                className="flex items-center space-x-2 bg-blazers-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                <Play className="w-4 h-4" />
                <span>Play Video</span>
              </button>
            )}
            
            {isPlaying && (
              <div className="text-sm text-gray-600 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Now Playing</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Simplified video card component
export function VideoCard({ 
  video, 
  onClick,
  locale = 'en-US'
}: { 
  video: SanitizedVideoData
  onClick?: () => void
  locale?: string
}) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Default behavior: navigate to video detail page
      window.location.href = `/media/video/video-${video.youtubeId}`
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video">
        <VideoThumbnail
          src={video.validThumbnail}
          alt={video.sanitizedTitle}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-red-600 bg-opacity-0 hover:bg-opacity-90 rounded-full flex items-center justify-center transition-all duration-300">
            <Play className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition-opacity duration-300" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Video information */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2">
          {video.sanitizedTitle}
        </h4>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div>{video.channelTitle}</div>
          <div className="flex items-center space-x-3">
            <span>{video.formattedViewCount} views</span>
            <span>{formatVideoDate(video.normalizedDate, locale)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}