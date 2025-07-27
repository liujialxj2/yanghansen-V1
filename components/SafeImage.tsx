'use client'

import Image from 'next/image'
import { useState, useCallback, useEffect } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  priority?: boolean
  width?: number
  height?: number
  fallbackSrc?: string
  onError?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager'
  retryCount?: number
  showLoadingState?: boolean
}

/**
 * Safe image component that automatically handles image loading errors and domain configuration issues
 * Enhanced with retry mechanism, loading states, and better error handling
 */
export function SafeImage({ 
  src, 
  alt, 
  fill, 
  className, 
  priority, 
  width, 
  height,
  fallbackSrc = 'https://images.unsplash.com/photo-1552657140-4d5a2b8b8d4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  onError,
  onLoad,
  loading = 'lazy',
  retryCount = 1,
  showLoadingState = false
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [retryAttempts, setRetryAttempts] = useState(0)

  // Reset state when src changes
  useEffect(() => {
    setImgSrc(src)
    setHasError(false)
    setIsLoading(true)
    setRetryAttempts(0)
  }, [src])

  const handleError = useCallback(() => {
    console.warn(`Image loading failed: ${imgSrc}`)
    
    // Try to retry if we haven't exceeded retry count
    if (retryAttempts < retryCount && !hasError) {
      console.log(`Retrying image load (attempt ${retryAttempts + 1}/${retryCount})`);
      setRetryAttempts(prev => prev + 1);
      // Force reload by adding timestamp
      setImgSrc(`${src}?retry=${Date.now()}`);
      return;
    }

    // Use fallback after retries exhausted
    if (!hasError) {
      console.warn(`Using fallback image after ${retryAttempts} retries: ${fallbackSrc}`);
      setHasError(true);
      setImgSrc(fallbackSrc);
      setIsLoading(false);
      onError?.();
    }
  }, [imgSrc, hasError, retryAttempts, retryCount, src, fallbackSrc, onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  // Validate URL format
  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Sanitize YouTube thumbnail URLs
  const sanitizeYouTubeUrl = useCallback((url: string): string => {
    if (url.includes('youtube.com') || url.includes('ytimg.com')) {
      // Ensure HTTPS for YouTube thumbnails
      return url.replace(/^http:/, 'https:');
    }
    return url;
  }, []);

  // Process the image source
  const processedSrc = useCallback(() => {
    if (!isValidUrl(imgSrc)) {
      console.warn(`Invalid URL detected: ${imgSrc}, using fallback`);
      return fallbackSrc;
    }
    return sanitizeYouTubeUrl(imgSrc);
  }, [imgSrc, isValidUrl, sanitizeYouTubeUrl, fallbackSrc]);

  const finalSrc = processedSrc();

  const imageProps = {
    src: finalSrc,
    alt: alt || "Image",
    className: `transition-opacity duration-300 ${className || ''}`,
    priority,
    onError: handleError,
    onLoad: handleLoad,
    ...(fill ? { 
      fill: true,
      sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    } : { 
      width: width || 800, 
      height: height || 600 
    })
  };

  // Show loading state if requested
  if (showLoadingState && isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className || ''}`}>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return <Image {...imageProps} />
}

// 默认导出
export default SafeImage

// Export a pre-configured component for news
export function NewsImage({ 
  src, 
  alt, 
  className = "object-cover",
  ...props 
}: SafeImageProps) {
  return (
    <SafeImage
      src={src}
      alt={alt}
      className={className}
      fallbackSrc="https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      {...props}
    />
  )
}

// Export a pre-configured component for video thumbnails
export function VideoThumbnail({ 
  src, 
  alt, 
  className = "object-cover",
  ...props 
}: SafeImageProps) {
  return (
    <SafeImage
      src={src}
      alt={alt}
      className={className}
      fallbackSrc="/images/video-placeholder.svg"
      retryCount={2}
      showLoadingState={false}
      loading="lazy"
      {...props}
    />
  )
}