import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Play, Calendar, Eye, ThumbsUp, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import mediaData from '@/data/media.json'

interface VideoDetailPageProps {
  params: {
    slug: string
  }
}

export default function VideoDetailPage({ params }: VideoDetailPageProps) {
  // 查找对应的视频
  const video = mediaData.videos.find(
    (item) => item.slug === params.slug || item.id.toString() === params.slug
  )

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">视频未找到</h1>
          <p className="text-gray-600 mb-6">抱歉，您访问的视频不存在或已被删除。</p>
          <Link href="/media">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回媒体中心
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/media" className="inline-flex items-center text-blazers-red hover:text-blazers-red/80 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回媒体中心
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2">
            {/* 视频播放器 */}
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
                    播放视频
                  </Button>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </div>
              </div>
            </div>

            {/* 视频信息 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {video.title}
              </h1>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {video.views} 次观看
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(video.date)}
                  </div>
                  <span className="bg-blazers-red text-white px-2 py-1 rounded text-xs font-medium">
                    {video.category}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    点赞
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    分享
                  </Button>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {video.description}
              </p>
            </div>

            {/* 评论区域 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">评论 (23)</h3>
              
              {/* 评论输入 */}
              <div className="mb-6">
                <textarea
                  placeholder="写下你的评论..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blazers-red focus:border-transparent"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm">发表评论</Button>
                </div>
              </div>

              {/* 示例评论 */}
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    user: "篮球迷小王",
                    time: "2小时前",
                    content: "杨瀚森真的太厉害了！期待他在NBA的表现！",
                    likes: 12
                  },
                  {
                    id: 2,
                    user: "体育爱好者",
                    time: "5小时前", 
                    content: "这个训练强度真的很高，难怪能有这样的成绩。",
                    likes: 8
                  },
                  {
                    id: 3,
                    user: "青年联赛观众",
                    time: "1天前",
                    content: "从小就关注杨瀚森，看着他一步步成长真的很感动。",
                    likes: 15
                  }
                ].map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blazers-red rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {comment.user[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.user}</span>
                        <span className="text-xs text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <button className="flex items-center gap-1 hover:text-blazers-red">
                          <ThumbsUp className="w-3 h-3" />
                          {comment.likes}
                        </button>
                        <button className="hover:text-blazers-red">回复</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            {/* 相关视频 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">相关视频</h3>
              <div className="space-y-4">
                {mediaData.videos
                  .filter(item => item.id !== video.id)
                  .slice(0, 6)
                  .map((relatedVideo) => (
                    <Link
                      key={relatedVideo.id}
                      href={`/media/video/${relatedVideo.slug || relatedVideo.id}`}
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
                          <span>{relatedVideo.views} 观看</span>
                          <span>•</span>
                          <span>{formatDate(relatedVideo.date)}</span>
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
    slug: video.slug || video.id.toString(),
  }))
}