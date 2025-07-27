/**
 * API安全工具类
 */

// 1. API Key验证
export function validateApiKey(providedKey, expectedKey) {
  return providedKey === expectedKey
}

// 2. 请求限流（简单实现）
const requestCounts = new Map()

export function rateLimit(identifier, limit = 100, windowMs = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  if (!requestCounts.has(identifier)) {
    requestCounts.set(identifier, [])
  }
  
  const requests = requestCounts.get(identifier)
  // 清理过期请求
  const validRequests = requests.filter(time => time > windowStart)
  
  if (validRequests.length >= limit) {
    return false // 超出限制
  }
  
  validRequests.push(now)
  requestCounts.set(identifier, validRequests)
  return true // 允许请求
}

// 3. 请求来源验证
export function validateOrigin(request, allowedOrigins) {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  if (!origin && !referer) return false
  
  const requestOrigin = origin || new URL(referer).origin
  return allowedOrigins.includes(requestOrigin)
}

// 4. 敏感信息过滤
export function sanitizeResponse(data) {
  if (typeof data !== 'object') return data
  
  const sensitiveKeys = ['apiKey', 'token', 'password', 'secret']
  const sanitized = { ...data }
  
  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      delete sanitized[key]
    }
  }
  
  return sanitized
}

// 5. 错误信息安全处理
export function safeErrorResponse(error, isDevelopment = false) {
  if (isDevelopment) {
    return {
      error: error.message,
      stack: error.stack
    }
  }
  
  // 生产环境只返回通用错误信息
  return {
    error: 'Internal server error'
  }
}