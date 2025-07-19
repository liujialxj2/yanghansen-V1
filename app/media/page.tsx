'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Download, Eye, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import mediaData from '@/data/media.json'

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState('videos')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const tabs = [
    { id: 'videos', label: '视频集锦', en: 'Videos' },
    { id: 'photos', label: '照片画廊', en: 'Photos' },
    { id: 'wallpapers', label: '壁纸下载', en: 'Wallpapers' }
  ]

  const videoCategories = [
    { id: 'all', label: '全部' },
    { id: 'highlights', label: '比赛集锦' },
    { id: 'training', label: '训练日常' },
    { id: 'interview', label: '采访专访' }
  ]

  const photoCategories = [
    { id: 'all', label: '全部' },
    { id: 'game', label: '比赛照片' },
    { id: 'training', label: '训练照片' },
    { id: 'team', label: '团队合影' },
    { id: 'portrait', label: '个人写真' },
    { id: 'celebration', label: '庆祝时刻' },
    { id: 'award', label: '颁奖典礼' }
  ]

  const filteredVideos = selectedCategory === 'all' 
    ? mediaData.videos 
    : mediaData.videos.filter(video => video.category === selectedCategory)

  const filteredPhotos = selectedCategory === 'all' 
    ? mediaData.photos 
    : mediaData.photos.filter(photo => photo.category === selectedCategory)

  return (
    <div className="min-h-screen py-8">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-blazers-red to-blazers-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            媒体中心 <span className="block text-2xl font-normal text-gray-200 mt-2">Media Center</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            观看杨瀚森的精彩比赛集锦，浏览高清照片，下载专属壁纸
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSelectedCategory('all')
                  }}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blazers-red text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="block">{tab.label}</span>
                  <span className="block text-xs opacity-75">{tab.en}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div>
              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {videoCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blazers-red text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Videos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVideos.map((video) => (
                  <Link key={video.id} href={`/media/video/${video.slug || video.id}`}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="relative group">
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          width={400}
                          height={225}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 bg-blazers-red rounded-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blazers-red transition-colors">{video.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{video.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{video.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{video.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div>
              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {photoCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blazers-red text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPhotos.map((photo) => (
                  <div key={photo.id} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square">
                      <Image
                        src={photo.url}
                        alt={photo.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="blazers" size="sm">
                            查看大图
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1">{photo.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{photo.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{photo.category}</span>
                        <span>{photo.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wallpapers Tab */}
          {activeTab === 'wallpapers' && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">杨瀚森专属壁纸</h2>
                <p className="text-gray-600">高清壁纸免费下载，支持多种分辨率</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mediaData.wallpapers.map((wallpaper) => (
                  <div key={wallpaper.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video">
                      <Image
                        src={wallpaper.preview}
                        alt={wallpaper.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{wallpaper.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{wallpaper.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-500">
                          <Download className="w-4 h-4 inline mr-1" />
                          {wallpaper.downloads} 次下载
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700 mb-2">可用分辨率：</div>
                        <div className="flex flex-wrap gap-2">
                          {wallpaper.sizes.map((size) => (
                            <Button key={size} variant="outline" size="sm">
                              <Download className="w-3 h-3 mr-1" />
                              {size}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}