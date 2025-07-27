/**
 * Google AdSense Configuration
 */

export const ADSENSE_CONFIG = {
  // 你的AdSense发布商ID
  CLIENT_ID: 'ca-pub-1093223025550160',
  
  // 广告位配置 - 请替换为你在AdSense后台创建的实际广告位ID
  AD_SLOTS: {
    HEADER: '1234567890',        // 页面顶部横幅广告
    SIDEBAR: '0987654321',       // 侧边栏广告
    ARTICLE: '1122334455',       // 文章内广告
    FOOTER: '5566778899',        // 页面底部广告
    MOBILE_BANNER: '9988776655', // 移动端横幅
    IN_FEED: '4433221100',       // 信息流广告
  },
  
  // 广告格式配置
  FORMATS: {
    AUTO: 'auto',
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    RECTANGLE: 'rectangle',
    FLUID: 'fluid',
  },
  
  // 常用广告尺寸
  SIZES: {
    LEADERBOARD: { width: '728px', height: '90px' },      // 728x90
    BANNER: { width: '468px', height: '60px' },           // 468x60
    RECTANGLE: { width: '300px', height: '250px' },       // 300x250
    LARGE_RECTANGLE: { width: '336px', height: '280px' }, // 336x280
    SKYSCRAPER: { width: '160px', height: '600px' },      // 160x600
    MOBILE_BANNER: { width: '320px', height: '50px' },    // 320x50
  }
}

/**
 * 检查是否启用广告
 * 在开发环境中可以禁用广告
 */
export function isAdsEnabled(): boolean {
  // 在生产环境中启用广告
  if (process.env.NODE_ENV === 'production') {
    return true
  }
  
  // 在开发环境中，可以通过环境变量控制
  return process.env.NEXT_PUBLIC_ENABLE_ADS === 'true'
}

/**
 * 获取广告脚本URL
 */
export function getAdSenseScriptUrl(): string {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.CLIENT_ID}`
}