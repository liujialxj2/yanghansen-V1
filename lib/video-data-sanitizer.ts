/**
 * Video data sanitization utilities
 * Cleans and validates video data for consistent display across locales
 */

import { isValidDate, normalizeDate } from './date-utils';

export interface VideoData {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  viewCount: number;
  formattedViewCount: string;
  likeCount: number;
  channelTitle: string;
  publishedAt: string;
  embedUrl: string;
  watchUrl: string;
  category: string;
  tags: string[];
}

export interface SanitizedVideoData extends VideoData {
  sanitizedTitle: string;
  sanitizedDescription: string;
  validThumbnail: string;
  normalizedDate: string;
  qualityScore?: number;
  relevanceScore?: number;
}

/**
 * Sanitize video data array for specific locale
 */
export function sanitizeVideoData(
  videos: VideoData[], 
  locale: string = 'en'
): SanitizedVideoData[] {
  if (!Array.isArray(videos)) {
    console.warn('Invalid videos data provided to sanitizeVideoData');
    return [];
  }

  return videos
    .filter(video => isValidVideoData(video))
    .map(video => sanitizeVideoItem(video, locale));
}

/**
 * Sanitize individual video item
 */
function sanitizeVideoItem(video: VideoData, locale: string): SanitizedVideoData {
  return {
    ...video,
    title: sanitizeText(video.title, locale),
    description: sanitizeText(video.description, locale),
    thumbnail: sanitizeThumbnailUrl(video.thumbnail),
    publishedAt: normalizeDate(video.publishedAt),
    embedUrl: sanitizeEmbedUrl(video.embedUrl),
    watchUrl: sanitizeWatchUrl(video.watchUrl),
    tags: sanitizeTags(video.tags, locale),
    sanitizedTitle: sanitizeText(video.title, locale),
    sanitizedDescription: sanitizeText(video.description, locale),
    validThumbnail: sanitizeThumbnailUrl(video.thumbnail),
    normalizedDate: normalizeDate(video.publishedAt),
    qualityScore: (video as any).qualityScore || 0,
    relevanceScore: (video as any).relevanceScore || 0
  };
}

/**
 * Validate video data structure
 */
function isValidVideoData(video: any): video is VideoData {
  if (!video || typeof video !== 'object') {
    return false;
  }

  const requiredFields = ['id', 'title', 'thumbnail', 'publishedAt'];
  const hasRequiredFields = requiredFields.every(field => 
    video[field] && typeof video[field] === 'string'
  );

  if (!hasRequiredFields) {
    console.warn('Video missing required fields:', video);
    return false;
  }

  // Validate date
  if (!isValidDate(video.publishedAt)) {
    console.warn('Video has invalid publishedAt date:', video.publishedAt);
    return false;
  }

  return true;
}

/**
 * Sanitize text content based on locale
 */
function sanitizeText(text: string, locale: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let sanitized = text.trim();

  if (locale === 'en') {
    // Remove Chinese characters in English mode
    sanitized = sanitized.replace(/[\u4e00-\u9fff]/g, '');
    
    // Remove Chinese punctuation
    sanitized = sanitized.replace(/[，。！？；：""''（）【】]/g, '');
    
    // Clean up extra whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    // Remove empty parentheses or brackets left after Chinese removal
    sanitized = sanitized.replace(/\(\s*\)/g, '');
    sanitized = sanitized.replace(/\[\s*\]/g, '');
    sanitized = sanitized.replace(/\{\s*\}/g, '');
  }

  // Remove social media handles and promotional text
  sanitized = sanitized.replace(/微博：[^\n]*\n?/g, '');
  sanitized = sanitized.replace(/B站：[^\n]*\n?/g, '');
  sanitized = sanitized.replace(/微信公众号：[^\n]*\n?/g, '');
  sanitized = sanitized.replace(/WeChat：[^\n]*\n?/g, '');
  sanitized = sanitized.replace(/Weibo：[^\n]*\n?/g, '');

  // Clean up final result
  sanitized = sanitized.replace(/\n+/g, ' ').trim();

  return sanitized || (locale === 'en' ? 'Video Content' : '视频内容');
}

/**
 * Sanitize and validate thumbnail URL
 */
function sanitizeThumbnailUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '/images/video-placeholder.svg';
  }

  // Handle relative URLs (like placeholder images)
  if (url.startsWith('/images/')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    
    // Ensure HTTPS for YouTube thumbnails
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('ytimg.com')) {
      urlObj.protocol = 'https:';
      return urlObj.toString();
    }

    // Validate other domains
    const allowedDomains = [
      'images.unsplash.com',
      'via.placeholder.com',
      'img.youtube.com',
      'i.ytimg.com',
      'i1.ytimg.com',
      'i2.ytimg.com',
      'i3.ytimg.com',
      'i4.ytimg.com'
    ];

    if (allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return urlObj.toString();
    }

    // Silently use fallback for untrusted domains
    return '/images/video-placeholder.svg';
  } catch (error) {
    // Only log if it's not a common placeholder path
    if (!url.includes('placeholder')) {
      console.warn('Invalid thumbnail URL detected:', url, 'using fallback');
    }
    return '/images/video-placeholder.svg';
  }
}

/**
 * Sanitize YouTube embed URL
 */
function sanitizeEmbedUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const urlObj = new URL(url);
    
    // Ensure it's a valid YouTube embed URL
    if (urlObj.hostname === 'www.youtube.com' && urlObj.pathname.startsWith('/embed/')) {
      urlObj.protocol = 'https:';
      return urlObj.toString();
    }

    // Convert watch URLs to embed URLs
    if (urlObj.hostname === 'www.youtube.com' && urlObj.pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    console.warn('Invalid embed URL:', url);
    return '';
  } catch (error) {
    console.warn('Error sanitizing embed URL:', url);
    return '';
  }
}

/**
 * Sanitize YouTube watch URL
 */
function sanitizeWatchUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const urlObj = new URL(url);
    
    // Ensure it's a valid YouTube watch URL
    if (urlObj.hostname === 'www.youtube.com' && urlObj.pathname === '/watch') {
      urlObj.protocol = 'https:';
      return urlObj.toString();
    }

    console.warn('Invalid watch URL:', url);
    return '';
  } catch (error) {
    console.warn('Error sanitizing watch URL:', url);
    return '';
  }
}

/**
 * Sanitize video tags
 */
function sanitizeTags(tags: string[], locale: string): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map(tag => sanitizeText(tag, locale))
    .filter(tag => tag.length > 0)
    .slice(0, 10); // Limit to 10 tags
}

/**
 * Get video category display name
 */
export function getCategoryDisplayName(category: string, locale: string = 'en'): string {
  const categoryMap: Record<string, { en: string; zh: string }> = {
    'highlights': { en: 'Highlights', zh: '精彩集锦' },
    'draft': { en: 'Draft', zh: '选秀' },
    'summer_league': { en: 'Summer League', zh: '夏季联赛' },
    'interview': { en: 'Interview', zh: '采访' },
    'training': { en: 'Training', zh: '训练' },
    'news': { en: 'News', zh: '新闻' },
    'skills': { en: 'Skills', zh: '技巧' }
  };

  const categoryInfo = categoryMap[category];
  if (categoryInfo) {
    return locale === 'zh' ? categoryInfo.zh : categoryInfo.en;
  }

  return locale === 'zh' ? '其他' : 'Other';
}

/**
 * Filter videos by category
 */
export function filterVideosByCategory(
  videos: SanitizedVideoData[], 
  category: string
): SanitizedVideoData[] {
  if (category === 'all') {
    return videos;
  }

  return videos.filter(video => video.category === category);
}

/**
 * Search videos by title and description
 */
export function searchVideos(
  videos: SanitizedVideoData[], 
  searchTerm: string
): SanitizedVideoData[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return videos;
  }

  const term = searchTerm.toLowerCase().trim();
  
  return videos.filter(video => 
    video.sanitizedTitle.toLowerCase().includes(term) ||
    video.sanitizedDescription.toLowerCase().includes(term) ||
    video.tags.some(tag => tag.toLowerCase().includes(term))
  );
}

/**
 * Sort videos by date (newest first)
 */
export function sortVideosByDate(videos: SanitizedVideoData[]): SanitizedVideoData[] {
  return [...videos].sort((a, b) => 
    new Date(b.normalizedDate).getTime() - new Date(a.normalizedDate).getTime()
  );
}

/**
 * Get video statistics summary
 */
export function getVideoStats(videos: SanitizedVideoData[]) {
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, video) => sum + (video.viewCount || 0), 0);
  const totalLikes = videos.reduce((sum, video) => sum + (video.likeCount || 0), 0);
  
  const categories = videos.reduce((acc, video) => {
    acc[video.category] = (acc[video.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalVideos,
    totalViews,
    totalLikes,
    categories,
    averageViews: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0,
    averageLikes: totalVideos > 0 ? Math.round(totalLikes / totalVideos) : 0
  };
}