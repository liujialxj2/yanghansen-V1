'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { VideoCard } from './VideoPlayer'
import { Search, Filter, Grid, List, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoThumbnail } from './SafeImage'
import { useTranslations, useLocale } from 'next-intl'
import { formatVideoDate } from '@/lib/date-utils'
import { SanitizedVideoData, getCategoryDisplayName } from '@/lib/video-data-sanitizer'
import { VideoGridSkeleton, VideoListSkeleton, VideoEmptyState, SearchLoadingIndicator } from './VideoLoadingStates'
import VideoModal from './VideoModal'

interface VideoListProps {
  videos: SanitizedVideoData[]
  categories?: Record<string, SanitizedVideoData[]>
  onVideoSelect?: (video: SanitizedVideoData) => void
  showFilters?: boolean
  itemsPerPage?: number
  isLoading?: boolean
  error?: string
}

const categoryLabels: Record<string, string> = {
  highlights: 'Highlights',
  draft: 'NBA Draft',
  summer_league: 'Summer League',
  interview: 'Interviews',
  training: 'Training Videos',
  news: 'News Reports',
  skills: 'Skills Showcase'
}

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Date' },
  { value: 'views', label: 'Views' },
  { value: 'quality', label: 'Quality' }
]

export default function VideoList({ 
  videos, 
  categories, 
  onVideoSelect, 
  showFilters = true,
  itemsPerPage = 12,
  isLoading = false,
  error
}: VideoListProps) {
  const locale = useLocale()
  
  // Modal state
  const [selectedVideo, setSelectedVideo] = useState<SanitizedVideoData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  
  // Debounced search to improve performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsSearching(false)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Debug info
  console.log('VideoList Debug:', {
    videosLength: videos?.length || 0,
    categoriesKeys: categories ? Object.keys(categories) : [],
    showFilters,
    itemsPerPage
  })

  // Filter and sort videos
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videos

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(video => video.category === selectedCategory)
    }

    // Search filter (using debounced search term)
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(video =>
        video.sanitizedTitle.toLowerCase().includes(term) ||
        video.sanitizedDescription.toLowerCase().includes(term) ||
        video.channelTitle.toLowerCase().includes(term) ||
        video.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.normalizedDate).getTime() - new Date(a.normalizedDate).getTime()
        case 'views':
          return b.viewCount - a.viewCount
        case 'quality':
          return (b.qualityScore || 0) - (a.qualityScore || 0)
        case 'relevance':
        default:
          return (b.relevanceScore || 0) - (a.relevanceScore || 0)
      }
    })

    return filtered
  }, [videos, selectedCategory, debouncedSearchTerm, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedVideos.length / itemsPerPage)
  const paginatedVideos = filteredAndSortedVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Get category statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = { all: videos.length }
    
    if (categories) {
      Object.entries(categories).forEach(([category, categoryVideos]) => {
        stats[category] = categoryVideos.length
      })
    } else {
      // Calculate category statistics from video data
      videos.forEach(video => {
        const category = video.category || 'news'
        stats[category] = (stats[category] || 0) + 1
      })
    }
    
    return stats
  }, [videos, categories])

  const handleVideoClick = useCallback((video: SanitizedVideoData) => {
    if (onVideoSelect) {
      onVideoSelect(video)
    } else {
      // Default behavior: open video in modal
      setSelectedVideo(video)
      setIsModalOpen(true)
    }
  }, [onVideoSelect])
  
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedVideo(null)
  }, [])
  
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
    setIsSearching(true)
  }, [])
  
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }, [])
  
  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort)
  }, [])
  
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode)
  }, [])
  
  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedCategory('all')
    setCurrentPage(1)
  }, [])

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Search Box */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search video titles, descriptions or tags..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blazers-red focus:border-transparent"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blazers-red focus:border-transparent"
              >
                <option value="all">All Categories ({categoryStats.all})</option>
                {Object.entries(categoryLabels).map(([category, label]) => (
                  categoryStats[category] > 0 && (
                    <option key={category} value={category}>
                      {getCategoryDisplayName(category, locale)} ({categoryStats[category]})
                    </option>
                  )
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blazers-red focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-1 ml-auto">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blazers-red text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blazers-red text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Statistics */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredAndSortedVideos.length} videos
          {searchTerm && ` (Search: "${searchTerm}")`}
          {selectedCategory !== 'all' && ` (Category: ${getCategoryDisplayName(selectedCategory, locale)})`}
        </span>
        
        {totalPages > 1 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Loading and Error States */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <VideoGridSkeleton count={itemsPerPage} />
        ) : (
          <VideoListSkeleton count={Math.ceil(itemsPerPage / 2)} />
        )
      ) : error ? (
        <VideoEmptyState
          title="Error Loading Videos"
          description={error}
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      ) : isSearching ? (
        <SearchLoadingIndicator />
      ) : paginatedVideos.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            // Grid view
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => handleVideoClick(video)}
                  locale={locale === 'zh' ? 'zh-CN' : 'en-US'}
                />
              ))}
            </div>
          ) : (
            // List view
            <div className="space-y-4">
              {paginatedVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="md:flex">
                    <div className="md:w-1/3">
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
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity duration-300" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="md:w-2/3 p-4">
                      <h4 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
                        {video.sanitizedTitle}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {video.sanitizedDescription}
                      </p>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>Channel: {video.channelTitle}</div>
                        <div className="flex items-center space-x-4">
                          <span>{video.formattedViewCount} views</span>
                          <span>{formatVideoDate(video.normalizedDate, locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {getCategoryDisplayName(video.category, locale)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "blazers" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10 h-10 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        // No results state
        <VideoEmptyState
          title="No videos found"
          description={
            searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search terms or selecting a different category' 
              : 'No video content available, please try again later'
          }
          showRetry={!!(searchTerm || selectedCategory !== 'all')}
          onRetry={handleClearFilters}
        />
      )}
      
      {/* Video Modal */}
      <VideoModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}