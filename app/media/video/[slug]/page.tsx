import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Play, Calendar, Eye, ThumbsUp, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import mediaData from '@/data/media.json'
import { notFound } from 'next/navigation'

interface VideoDetailPageProps {
  params: {
    slug: string
  }
}

export default function VideoDetailPage({ params }: VideoDetailPageProps) {
  // 查找对应的{tNav("videos")}
  const video = mediaData.videos.find(
    (item) => item.id.toString() === params.slug
  )

  if (!video) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/videos" className="inline-flex items-center text-blazers-red hover:text-blazers-red/80 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Videos
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="relative aspect-video bg-black">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/50">
                    <Play className="w-8 h-8 mr-2" />
                    Play Video
                  </Button>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {video.title}
              </h1>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {video.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(video.publishedAt || '')}
                  </div>
                  <span className="bg-blazers-red text-white px-2 py-1 rounded text-xs font-medium">
                    {video.category}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Like
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {video.description}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Videos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Related Videos</h3>
              <div className="space-y-4">
                {mediaData.videos
                  .filter(item => item.id !== video.id)
                  .slice(0, 6)
                  .map((relatedVideo) => (
                    <Link
                      key={relatedVideo.id}
                      href={`/media/video/${relatedVideo.id}`}
                      className="flex gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                        <Image
                          src={relatedVideo.thumbnail}
                          alt={relatedVideo.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 text-xs rounded">
                          {relatedVideo.duration}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-2 text-sm mb-1">
                          {relatedVideo.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{relatedVideo.views} views</span>
                          <span>•</span>
                          <span>{formatDate(relatedVideo.publishedAt || '')}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 生成静态路径
export async function generateStaticParams() {
  return mediaData.videos.map((video) => ({
    slug: video.id.toString(),
  }))
}