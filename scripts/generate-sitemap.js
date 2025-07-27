const fs = require('fs')
const path = require('path')

const locales = ['zh', 'en']
const pages = ['', 'about', 'stats', 'videos', 'news']
const baseUrl = 'https://yang-hansen.vercel.app'

function generateSitemap() {
  const urls = []
  
  locales.forEach(locale => {
    pages.forEach(page => {
      const url = `${baseUrl}/${locale}${page ? `/${page}` : ''}`
      
      urls.push(`
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`)
    })
  })
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`
  
  fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap)
  console.log('✓ Sitemap generated successfully!')
}

generateSitemap()