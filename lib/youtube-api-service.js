const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

/**
 * YouTube API服务类
 * 负责与YouTube Data API v3进行交互，获取Yang Hansen相关{tNav("videos")}
 */
class YouTubeAPIService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    console.log('YouTube API密钥:', this.apiKey ? '已设置' : '未设置');
    
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.apiKey
    });
    
    // 配额管理
    this.quotaUsed = 0;
    this.quotaLimit = 10000; // YouTube API免费层每10,000配额单位
    this.lastResetTime = new Date().toDateString();
    
    // 请求成本配置
    this.requestCosts = {
      'search': 100,      // search.list
      'videos': 1,        // videos.list
      'channels': 1,      // channels.list
      'playlists': 1,     // playlists.list
      'playlistItems': 1  // playlistItems.list
    };
  }

  /**
   * 验证API密钥是否有效
   */
  async validateApiKey() {
    try {
      const response = await this.youtube.search.list({
        part: 'snippet',
        q: 'test',
        type: 'video',
        maxResults: 1
      });
      
      console.log('YouTube API密钥验证成功');
      return true;
    } catch (error) {
      console.error('YouTube API密钥验证失败:', error.message);
      return false;
    }
  }

  /**
   * 检查API配额
   */
  checkQuota(operation = 'search') {
    const today = new Date().toDateString();
    
    // 如果是新的一天，重置配额
    if (today !== this.lastResetTime) {
      this.quotaUsed = 0;
      this.lastResetTime = today;
      console.log('YouTube API配额已重置');
    }
    
    const requestCost = this.requestCosts[operation] || 1;
    const available = (this.quotaUsed + requestCost) <= this.quotaLimit;
    
    if (!available) {
      console.warn(`YouTube API配额不足: ${this.quotaUsed}/${this.quotaLimit}, 需要: ${requestCost}`);
    }
    
    return available;
  }

  /**
   * 记录API使用次数
   */
  recordUsage(operation = 'search') {
    const cost = this.requestCosts[operation] || 1;
    this.quotaUsed += cost;
    console.log(`YouTube API使用: +${cost}, 总计: ${this.quotaUsed}/${this.quotaLimit}`);
  }

  /**
   * 搜索{tNav("videos")}
   */
  async searchVideos(query, options = {}) {
    if (!this.checkQuota('search')) {
      throw new Error('YouTube API配额已用完，请明天再试');
    }

    const defaultOptions = {
      part: 'snippet',
      q: query,
      type: 'video',
      order: 'relevance',
      maxResults: 25,
      publishedAfter: this.getDateDaysAgo(30), // 最近30天
      regionCode: 'US',
      relevanceLanguage: 'en'
    };

    const searchOptions = { ...defaultOptions, ...options };

    try {
      console.log(`正在搜索YouTube{tNav("videos")}: "${query}"`);
      console.log('搜索参数:', searchOptions);

      const response = await this.youtube.search.list(searchOptions);
      this.recordUsage('search');

      if (response.data && response.data.items) {
        console.log(`找到 ${response.data.items.length} 个{tNav("videos")}Result`);
        
        // 获取{tNav("videos")}详细信息
        const videoIds = response.data.items.map(item => item.id.videoId);
        const detailedVideos = await this.getVideoDetails(videoIds);
        
        return {
          success: true,
          items: detailedVideos,
          totalResults: response.data.pageInfo.totalResults,
          resultsPerPage: response.data.pageInfo.resultsPerPage,
          nextPageToken: response.data.nextPageToken
        };
      } else {
        throw new Error('YouTube API返回无效响应');
      }
    } catch (error) {
      console.error('搜索YouTube{tNav("videos")}失败:', error.message);
      return {
        success: false,
        error: error.message,
        items: []
      };
    }
  }

  /**
   * 获取{tNav("videos")}详细信息
   */
  async getVideoDetails(videoIds) {
    if (!videoIds || videoIds.length === 0) {
      return [];
    }

    if (!this.checkQuota('videos')) {
      console.warn('配额不足，跳过获取{tNav("videos")}详细信息');
      return [];
    }

    try {
      const response = await this.youtube.videos.list({
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(',')
      });
      
      this.recordUsage('videos');

      if (response.data && response.data.items) {
        return response.data.items.map(video => this.formatVideoData(video));
      }
      
      return [];
    } catch (error) {
      console.error('获取{tNav("videos")}详细信息失败:', error.message);
      return [];
    }
  }

  /**
   * 获取频道{tNav("videos")}
   */
  async getChannelVideos(channelId, options = {}) {
    if (!this.checkQuota('search')) {
      throw new Error('YouTube API配额已用完');
    }

    const defaultOptions = {
      part: 'snippet',
      channelId: channelId,
      type: 'video',
      order: 'date',
      maxResults: 25
    };

    const searchOptions = { ...defaultOptions, ...options };

    try {
      console.log(`获取频道{tNav("videos")}: ${channelId}`);
      
      const response = await this.youtube.search.list(searchOptions);
      this.recordUsage('search');

      if (response.data && response.data.items) {
        const videoIds = response.data.items.map(item => item.id.videoId);
        const detailedVideos = await this.getVideoDetails(videoIds);
        
        return {
          success: true,
          items: detailedVideos,
          totalResults: response.data.pageInfo.totalResults,
          nextPageToken: response.data.nextPageToken
        };
      }
      
      return { success: true, items: [] };
    } catch (error) {
      console.error('获取频道{tNav("videos")}失败:', error.message);
      return {
        success: false,
        error: error.message,
        items: []
      };
    }
  }

  /**
   * 格式化{tNav("videos")}{tNav("stats")}
   */
  formatVideoData(video) {
    const snippet = video.snippet || {};
    const statistics = video.statistics || {};
    const contentDetails = video.contentDetails || {};

    return {
      id: video.id,
      title: snippet.title || '',
      description: snippet.description || '',
      thumbnails: snippet.thumbnails || {},
      publishedAt: snippet.publishedAt,
      channelId: snippet.channelId,
      channelTitle: snippet.channelTitle || '',
      duration: contentDetails.duration || '',
      viewCount: parseInt(statistics.viewCount) || 0,
      likeCount: parseInt(statistics.likeCount) || 0,
      commentCount: parseInt(statistics.commentCount) || 0,
      tags: snippet.tags || [],
      categoryId: snippet.categoryId || '',
      defaultLanguage: snippet.defaultLanguage,
      defaultAudioLanguage: snippet.defaultAudioLanguage,
      liveBroadcastContent: snippet.liveBroadcastContent || 'none',
      embedUrl: `https://www.youtube.com/embed/${video.id}`,
      watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnailUrl: this.getBestThumbnail(snippet.thumbnails)
    };
  }

  /**
   * 获取最佳缩略图URL
   */
  getBestThumbnail(thumbnails) {
    if (!thumbnails) return '';
    
    // 优先级：maxres > high > medium > default
    if (thumbnails.maxres) return thumbnails.maxres.url;
    if (thumbnails.high) return thumbnails.high.url;
    if (thumbnails.medium) return thumbnails.medium.url;
    if (thumbnails.default) return thumbnails.default.url;
    
    return '';
  }

  /**
   * 解析{tNav("videos")}时长
   */
  parseDuration(duration) {
    if (!duration) return 0;
    
    // YouTube duration format: PT4M13S
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * 格式化时长为可读格式
   */
  formatDuration(duration) {
    const totalSeconds = this.parseDuration(duration);
    
    if (totalSeconds < 60) {
      return `${totalSeconds} sec`;
    } else if (totalSeconds < 3600) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * 获取指定天数前的期
   */
  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  }

  /**
   * 带{tCommon("retry")}机制的API调用
   */
  async callWithRetry(apiCall, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        console.error(`YouTube API调用失败 (尝试 ${attempt}/${maxRetries}):`, error.message);
        
        // 检查是否是可{tCommon("retry")}的错误
        if (this.isRetryableError(error) && attempt < maxRetries) {
          const waitTime = delay * Math.pow(2, attempt - 1); // 指数退避
          console.log(`等待 ${waitTime}ms 后{tCommon("retry")}...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        throw error;
      }
    }
  }

  /**
   * 判断是否是可{tCommon("retry")}的错误
   */
  isRetryableError(error) {
    const retryableErrors = [
      'quotaExceeded',
      'rateLimitExceeded',
      'backendError',
      'internalServerError',
      'serviceUnavailable'
    ];
    
    return retryableErrors.some(errorType => 
      error.message.toLowerCase().includes(errorType.toLowerCase())
    ) || (error.code && error.code >= 500);
  }

  /**
   * 获取API使用统计
   */
  getUsageStats() {
    return {
      used: this.quotaUsed,
      limit: this.quotaLimit,
      remaining: this.quotaLimit - this.quotaUsed,
      resetTime: this.lastResetTime,
      utilizationRate: (this.quotaUsed / this.quotaLimit * 100).toFixed(2) + '%'
    };
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      const isValid = await this.validateApiKey();
      const stats = this.getUsageStats();
      
      return {
        status: isValid ? 'healthy' : 'unhealthy',
        apiKeyValid: isValid,
        quotaStats: stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = YouTubeAPIService;