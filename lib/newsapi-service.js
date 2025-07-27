const NewsAPI = require('newsapi');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

/**
 * NewsAPI服务类
 * 负责与NewsAPI.org进行交互，获取Yang Hansen相关{tNav("news")}
 */
class NewsAPIService {
  constructor() {
    this.apiKey = process.env.NEWSAPI_KEY || 'ccceb5ffa6b24b21848646cf5e4ad721';
    console.log('使用API密钥:', this.apiKey ? '已设置' : '未设置');
    this.newsapi = new NewsAPI(this.apiKey);
    this.quotaUsed = 0;
    this.quotaLimit = 1000; // NewsAPI免费层每1000次请求
    this.lastResetTime = new Date().toDateString();
  }

  /**
   * 验证API密钥是否有效
   */
  async validateApiKey() {
    try {
      const response = await this.newsapi.v2.topHeadlines({
        country: 'us',
        pageSize: 1
      });
      return response.status === 'ok';
    } catch (error) {
      console.error('NewsAPI密钥验证失败:', error.message);
      return false;
    }
  }

  /**
   * 检查API配额
   */
  checkQuota() {
    const today = new Date().toDateString();
    
    // 如果是新的一天，重置配额
    if (today !== this.lastResetTime) {
      this.quotaUsed = 0;
      this.lastResetTime = today;
    }
    
    return this.quotaUsed < this.quotaLimit;
  }

  /**
   * 记录API使用次数
   */
  recordUsage() {
    this.quotaUsed++;
    console.log(`NewsAPI使用次数: ${this.quotaUsed}/${this.quotaLimit}`);
  }

  /**
   * 搜索Yang Hansen相关{tNav("news")}
   */
  async searchYangHansenNews(options = {}) {
    if (!this.checkQuota()) {
      throw new Error('NewsAPI配额已用完，请明天再试');
    }

    const defaultOptions = {
      q: 'Yang Hansen OR "杨瀚森" OR "Hansen Yang"',
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 20,
      from: this.getDateDaysAgo(30), // 最近30天
      to: new Date().toISOString()
    };

    const searchOptions = { ...defaultOptions, ...options };

    try {
      console.log('正在搜索Yang Hansen相关{tNav("news")}...');
      console.log('搜索参数:', searchOptions);

      const response = await this.newsapi.v2.everything(searchOptions);
      this.recordUsage();

      if (response.status === 'ok') {
        console.log(`找到 ${response.articles.length} 篇相关{tNav("news")}`);
        return {
          success: true,
          articles: response.articles,
          totalResults: response.totalResults
        };
      } else {
        throw new Error(`NewsAPI返回错误: ${response.message}`);
      }
    } catch (error) {
      console.error('搜索{tNav("news")}失败:', error.message);
      return {
        success: false,
        error: error.message,
        articles: []
      };
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
        console.error(`API调用失败 (尝试 ${attempt}/${maxRetries}):`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 等待后{tCommon("retry")}
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  /**
   * 获取API使用统计
   */
  getUsageStats() {
    return {
      used: this.quotaUsed,
      limit: this.quotaLimit,
      remaining: this.quotaLimit - this.quotaUsed,
      resetTime: this.lastResetTime
    };
  }
}

module.exports = NewsAPIService;