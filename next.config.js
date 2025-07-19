/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com', 
      'via.placeholder.com',
      'sportshub.cbsistatic.com',
      'a.espncdn.com',
      'cdn.nba.com',
      'media.cnn.com',
      'static01.nyt.com',
      'www.si.com',
      'cdn.vox-cdn.com',
      'img.bleacherreport.net',
      'pixabay.com',
      'cdn.pixabay.com'
    ],
    unoptimized: false,
  },
  // 静态导出配置（可选）
  trailingSlash: true,
}

module.exports = nextConfig