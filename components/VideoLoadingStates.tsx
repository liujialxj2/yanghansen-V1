'use client'

import { Play, Clock, Eye } from 'lucide-react'

/**
 * Loading skeleton for video cards
 */
export function VideoCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="relative aspect-video bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-8 h-8 text-gray-300" />
        </div>
        <div className="absolute bottom-2 right-2 bg-gray-300 rounded px-2 py-1">
          <div className="w-8 h-3 bg-gray-400 rounded"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        <div className="mt-3 space-y-1">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="flex items-center space-x-3">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Loading skeleton for video grid
 */
export function VideoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Loading skeleton for video list view
 */
export function VideoListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="md:flex">
            <div className="md:w-1/3">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-300" />
              </div>
            </div>
            <div className="md:w-2/3 p-4">
              <div className="space-y-2 mb-3">
                <div className="h-5 bg-gray-200 rounded w-full"></div>
                <div className="h-5 bg-gray-200 rounded w-4/5"></div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Empty state component for no videos
 */
export function VideoEmptyState({ 
  title = "No videos found",
  description = "No video content available at the moment.",
  showRetry = false,
  onRetry
}: {
  title?: string
  description?: string
  showRetry?: boolean
  onRetry?: () => void
}) {
  return (
    <div className="text-center py-16">
      <div className="mb-6">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Play className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {description}
        </p>
      </div>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="bg-blazers-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

/**
 * Loading indicator for image loading
 */
export function ImageLoadingIndicator() {
  return (
    <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )
}

/**
 * Video stats loading skeleton
 */
export function VideoStatsSkeleton() {
  return (
    <div className="flex items-center justify-between text-sm animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  )
}

/**
 * Search loading indicator
 */
export function SearchLoadingIndicator() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blazers-red rounded-full animate-spin"></div>
        <span>Searching videos...</span>
      </div>
    </div>
  )
}

/**
 * Video page loading state
 */
export function VideoPageLoading() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
        </div>
        
        {/* Filters skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div>
          </div>
        </div>
        
        {/* Video grid skeleton */}
        <VideoGridSkeleton />
      </div>
    </div>
  )
}

/**
 * Pagination loading skeleton
 */
export function PaginationSkeleton() {
  return (
    <div className="flex justify-center items-center space-x-2 mt-8 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-20"></div>
      <div className="flex space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="w-10 h-10 bg-gray-200 rounded"></div>
        ))}
      </div>
      <div className="h-10 bg-gray-200 rounded w-16"></div>
    </div>
  )
}

export default {
  VideoCardSkeleton,
  VideoGridSkeleton,
  VideoListSkeleton,
  VideoEmptyState,
  ImageLoadingIndicator,
  VideoStatsSkeleton,
  SearchLoadingIndicator,
  VideoPageLoading,
  PaginationSkeleton
}