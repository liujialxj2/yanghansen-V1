import Image from 'next/image'

interface NewsImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  priority?: boolean
  width?: number
  height?: number
}

/**
 * Simplified news image component for server-side rendering
 */
export default function NewsImageSimple({ 
  src, 
  alt, 
  fill, 
  className = "object-cover", 
  priority, 
  width = 800, 
  height = 600 
}: NewsImageProps) {
  // 提供一个默认的备用图片
  const fallbackSrc = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  
  // 检查URL是否有效
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return url.startsWith('http')
    } catch {
      return false
    }
  }

  const imageSrc = isValidUrl(src) ? src : fallbackSrc

  const imageProps = {
    src: imageSrc,
    alt,
    className,
    priority,
    ...(fill ? { 
      fill: true, 
      sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
    } : { width, height })
  }

  return <Image {...imageProps} />
}