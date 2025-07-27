import { NextResponse } from 'next/server'

export function middleware(request) {
  // API路由保护
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // 1. 限制请求来源
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'https://your-domain.vercel.app',
      'https://your-custom-domain.com',
      'http://localhost:3000' // 开发环境
    ]
    
    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // 2. 简单的限流
    const ip = request.ip || request.headers.get('x-forwarded-for')
    // 这里可以实现基于IP的限流逻辑
    
    // 3. 检查User-Agent
    const userAgent = request.headers.get('user-agent')
    if (!userAgent || userAgent.includes('bot')) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}