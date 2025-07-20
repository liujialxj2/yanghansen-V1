/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'library.sportingnews.com',
      'nbcsports.brightspotcdn.com',
      'sportshub.cbsistatic.com',
      'static.toiimg.com',
      'nypost.com',
      'cdn.cbssports.com',
      'www.cbssports.com',
      'pbs.twimg.com',
      'img.youtube.com',
      'i.ytimg.com', // YouTube缩略图域名
      'nbc-sports-production-nbc-sports.s3.us-east-1.amazonaws.com'
    ],
    unoptimized: false,
  },
  // 静态导出配置（可选）
  trailingSlash: true,
}

module.exports = nextConfig