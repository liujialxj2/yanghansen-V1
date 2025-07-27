import { rateLimit, validateOrigin, safeErrorResponse } from '../../lib/api-security'

const allowedOrigins = [
  'https://your-domain.vercel.app',
  'https://your-custom-domain.com',
  'http://localhost:3000'
]

export default async function handler(req, res) {
  try {
    // 1. 只允许GET请求
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }
    
    // 2. 验证请求来源
    if (!validateOrigin(req, allowedOrigins)) {
      return res.status(403).json({ error: 'Forbidden origin' })
    }
    
    // 3. 限流检查
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    if (!rateLimit(clientIP, 50, 60000)) { // 每分钟50次请求
      return res.status(429).json({ error: 'Too many requests' })
    }
    
    // 4. 调用内部API服务
    const NewsAPIService = require('../../lib/newsapi-service')
    const newsService = new NewsAPIService()
    
    const news = await newsService.searchYangHansenNews({
      pageSize: 10,
      sortBy: 'publishedAt'
    })
    
    // 5. 返回安全的响应
    res.status(200).json({
      success: true,
      data: news,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('API Error:', error)
    const isDev = process.env.NODE_ENV === 'development'
    res.status(500).json(safeErrorResponse(error, isDev))
  }
}