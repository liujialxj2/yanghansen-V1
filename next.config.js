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
      'i.ytimg.com',
      'www.deseret.com',
      'nypost.com',
      'cdn.vox-cdn.com',
      'media.zenfs.com',
      'imageio.forbes.com',
      'www.si.com',
      'static01.nyt.com',
      'www.washingtonpost.com',
      'cdn.theathletic.com',
      'www.nbcsports.com',
      'www.espn.com',
      'espncdn.com',
      'a.espncdn.com',
      'a1.espncdn.com',
      'a2.espncdn.com',
      'a4.espncdn.com',
      'www.bostonherald.com',
      'i.insider.com',
      'media.cnn.com',
      'dam.mediacorp.sg',
      'media.nbcsportsboston.com',
      's.yimg.com',
      'www.rollingstone.com'
    ],
    unoptimized: false,
  },
  // 静态导出配置（可选）
  trailingSlash: true,
}

module.exports = nextConfig