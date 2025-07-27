'use client'

import { useEffect } from 'react'
import { ADSENSE_CONFIG, isAdsEnabled } from '@/lib/adsense-config'

interface AdSenseProps {
  adSlot: string
  adFormat?: string
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export function AdSense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = ''
}: AdSenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle && isAdsEnabled()) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  // 如果广告被禁用，不渲染广告
  if (!isAdsEnabled()) {
    return null
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={ADSENSE_CONFIG.CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  )
}

// 预定义的广告组件
export function HeaderAd() {
  return (
    <div className="my-4 text-center">
      <AdSense
        adSlot={ADSENSE_CONFIG.AD_SLOTS.HEADER}
        adFormat={ADSENSE_CONFIG.FORMATS.HORIZONTAL}
        style={{ display: 'block', ...ADSENSE_CONFIG.SIZES.LEADERBOARD }}
      />
    </div>
  )
}

export function SidebarAd() {
  return (
    <div className="my-4">
      <AdSense
        adSlot={ADSENSE_CONFIG.AD_SLOTS.SIDEBAR}
        adFormat={ADSENSE_CONFIG.FORMATS.RECTANGLE}
        style={{ display: 'block', ...ADSENSE_CONFIG.SIZES.RECTANGLE }}
      />
    </div>
  )
}

export function ArticleAd() {
  return (
    <div className="my-6 text-center">
      <AdSense
        adSlot={ADSENSE_CONFIG.AD_SLOTS.ARTICLE}
        adFormat={ADSENSE_CONFIG.FORMATS.FLUID}
        style={{ display: 'block' }}
      />
    </div>
  )
}

export function ResponsiveAd() {
  return (
    <div className="my-4">
      <AdSense
        adSlot={ADSENSE_CONFIG.AD_SLOTS.FOOTER}
        adFormat={ADSENSE_CONFIG.FORMATS.AUTO}
        style={{ display: 'block' }}
      />
    </div>
  )
}

export function MobileBannerAd() {
  return (
    <div className="my-4 md:hidden">
      <AdSense
        adSlot={ADSENSE_CONFIG.AD_SLOTS.MOBILE_BANNER}
        adFormat={ADSENSE_CONFIG.FORMATS.HORIZONTAL}
        style={{ display: 'block', ...ADSENSE_CONFIG.SIZES.MOBILE_BANNER }}
      />
    </div>
  )
}