/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'library.sportingnews.com',
      'nbcsports.brightspotcdn.com',
      'sportshub.cbsistatic.com',
      'static.toiimg.com'
    ],
    unoptimized: false,
  },
  // 静态导出配置（可选）
  trailingSlash: true,
}

module.exports = nextConfig