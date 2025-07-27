'use client'

import React from 'react'
import Image from 'next/image'

interface NewsImageSimpleProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
}

export default function NewsImageSimple({ 
  src, 
  alt, 
  className = '',
  width = 400,
  height = 200,
  fill = false,
  priority = false
}: NewsImageSimpleProps) {
  const [imageError, setImageError] = React.useState(false)

  if (imageError || !src) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">No Image</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      {...(fill ? { fill: true } : { width, height })}
      className={className}
      onError={() => setImageError(true)}
      priority={priority}
      unoptimized
    />
  )
}