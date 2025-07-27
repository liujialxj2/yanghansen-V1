'use client'

import { useState, useEffect } from 'react'
import { X, Play, ExternalLink } from 'lucide-react'
import { SanitizedVideoData } from '@/lib/video-data-sanitizer'

interface VideoModalProps {
  video: SanitizedVideoData | null
  isOpen: boolean
  onClose: () => void
}

export default function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Reset playing state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !video) return null

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 line-clamp-1 flex-1 mr-4">
            {video.sanitizedTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-gray-900">
          {!isPlaying ? (
            // Thumbnail with play button
            <div className="relative w-full h-full group cursor-pointer" onClick={handlePlay}>
              <img
                src={video.validThumbnail}
                alt={video.sanitizedTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/video-placeholder.svg'
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300" />
              
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors duration-300 shadow-lg">
                  <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                </div>
              </div>
              
              {/* Duration */}
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 text-white text-sm px-3 py-1 rounded">
                {video.duration}
              </div>
            </div>
          ) : (
            // YouTube iframe
            <iframe
              src={embedUrl}
              title={video.sanitizedTitle}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Video Info */}
        <div className="p-4 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{video.formattedViewCount} views</span>
              <span>{video.channelTitle}</span>
            </div>
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Watch on YouTube</span>
            </a>
          </div>
          
          {video.sanitizedDescription && (
            <p className="text-gray-700 text-sm leading-relaxed">
              {video.sanitizedDescription}
            </p>
          )}
          
          {video.tags && video.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {video.tags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}