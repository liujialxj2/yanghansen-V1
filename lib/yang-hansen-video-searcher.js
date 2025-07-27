const YouTubeAPIService = require('./youtube-api-service');

/**
 * Yang Hansen专用{tNav("videos")}搜索器
 * 使用多种搜索策略获取最相关的YouTube{tNav("videos")}
 */
class YangHansenVideoSearcher {
  constructor() {
    this.youtubeService = new YouTubeAPIService();
    
    // 搜索策略配置
    this.searchStrategies = [
      {
        name: 'primary',
        query: 'Yang Hansen basketball',
        weight: 1.0,
        options: { 
          order: 'relevance', 
          maxResults: 25,
          videoDuration: 'medium' // 4-20 min的{tNav("videos")}
        }
      },
      {
        name: 'nba_draft',
        query: 'Yang Hansen NBA draft 2024',
        weight: 0.95,
        options: { 
          order: 'date', 
          maxResults: 20,
          publishedAfter: '2024-06-01T00:00:00Z' // 选秀季开始
        }
      },
      {
        name: 'blazers',
        query: 'Yang Hansen Portland Blazers',
        weight: 0.9,
        options: { 
          order: 'relevance', 
          maxResults: 20 
        }
      },
      {
        name: 'summer_league',
        query: 'Yang Hansen Summer League highlights',
        weight: 0.85,
        options: { 
          order: 'viewCount', 
          maxResults: 15,
          publishedAfter: '2024-07-01T00:00:00Z' // 夏季联赛开始
        }
      },
      {
        name: 'chinese_jokic',
        query: '"Chinese Jokic" Yang Hansen',
        weight: 0.8,
        options: { 
          order: 'relevance', 
          maxResults: 15 
        }
      },
      {
        name: 'highlights',
        query: 'Yang Hansen highlights basketball',
        weight: 0.75,
        options: { 
          order: 'viewCount', 
          maxResults: 15,
          videoDuration: 'short' // 4 min以下的集锦
        }
      },
      {
        name: 'chinese_keywords',
        query: '杨瀚森 篮球',
        weight: 0.7,
        options: { 
          order: 'date', 
          maxResults: 10,
          regionCode: 'CN',
          relevanceLanguage: 'zh'
        }
      },
      {
        name: 'center_position',
        query: 'Yang Hansen center basketball China',
        weight: 0.65,
        options: { 
          order: 'relevance', 
          maxResults: 10 
        }
      }
    ];

    // 权威频道列表（优先展示这些频道的{tNav("videos")}）
    this.authorityChannels = [
      'NBA', // NBA官方
      'ESPN', // ESPN
      'Bleacher Report', // Bleacher Report
      'The Athletic', // The Athletic
      'Portland Trail Blazers', // 开拓者队官方
      'House of Highlights', // House of Highlights
      'NBA on TNT', // TNT
      'NBA on ESPN' // ESPN NBA
    ];
  }

  /**
   * 执行多策略搜索
   */
  async searchWithMultipleStrategies(options = {}) {
    const defaultOptions = {
      maxVideosPerStrategy: 15,
      totalMaxVideos: 50,
      timeRange: 60, // 天数
      includeAllStrategies: true
    };

    const searchOptions = { ...defaultOptions, ...options };
    const allVideos = [];
    const searchResults = [];

    console.log('开始多策略Yang Hansen{tNav("videos")}搜索...');

    // 选择要执行的策略
    const strategiesToRun = searchOptions.includeAllStrategies 
      ? this.searchStrategies 
      : this.searchStrategies.slice(0, 4); // 只执行前4个主要策略

    for (const strategy of strategiesToRun) {
      try {
        console.log(`\n执行搜索策略: ${strategy.name}`);
        console.log(`查询: "${strategy.query}"`);

        // 合并策略选项和全局选项
        const apiOptions = {
          ...strategy.options,
          maxResults: Math.min(strategy.options.maxResults, searchOptions.maxVideosPerStrategy),
          publishedAfter: strategy.options.publishedAfter || this.getDateDaysAgo(searchOptions.timeRange)
        };

        const result = await this.youtubeService.searchVideos(strategy.query, apiOptions);
        
        if (result.success && result.items.length > 0) {
          console.log(`✓ 找到 ${result.items.length} 个{tNav("videos")}`);
          
          // 为每个{tNav("videos")}添加策略权重和元信息
          const weightedVideos = result.items.map(video => ({
            ...video,
            searchStrategy: strategy.name,
            strategyWeight: strategy.weight,
            searchQuery: strategy.query,
            foundAt: new Date().toISOString()
          }));

          allVideos.push(...weightedVideos);
          
          searchResults.push({
            strategy: strategy.name,
            query: strategy.query,
            found: result.items.length,
            total: result.totalResults,
            weight: strategy.weight
          });
        } else {
          console.log(`✗ 未找到{tNav("videos")}`);
          searchResults.push({
            strategy: strategy.name,
            query: strategy.query,
            found: 0,
            total: 0,
            weight: strategy.weight,
            error: result.error
          });
        }

        // 避免API限制，策略间添加延迟
        await this.delay(800);

      } catch (error) {
        console.error(`策略 ${strategy.name} 执行失败:`, error.message);
        searchResults.push({
          strategy: strategy.name,
          query: strategy.query,
          found: 0,
          total: 0,
          weight: strategy.weight,
          error: error.message
        });
      }
    }

    console.log(`\n总获取到 ${allVideos.length} 个{tNav("videos")}`);

    // 处理搜索Result
    const processedResult = await this.processSearchResults(allVideos, searchOptions);

    return {
      searchResults,
      processedVideos: processedResult.videos,
      statistics: {
        totalFound: allVideos.length,
        afterDeduplication: processedResult.afterDeduplication,
        finalCount: processedResult.videos.length,
        strategiesUsed: searchResults.length,
        successfulStrategies: searchResults.filter(r => r.found > 0).length,
        apiUsage: this.youtubeService.getUsageStats()
      }
    };
  }

  /**
   * 处理搜索Result
   */
  async processSearchResults(videos, options) {
    console.log('\n开始处理搜索Result...');

    // 1. 基础去重（基于{tNav("videos")}ID）
    const uniqueVideos = this.removeDuplicatesByVideoId(videos);
    console.log(`去重后剩余: ${uniqueVideos.length} 个{tNav("videos")}`);

    // 2. 增强{tNav("videos")}信息
    const enhancedVideos = uniqueVideos.map(video => this.enhanceVideoInfo(video));

    // 3. 按综合评分排序
    enhancedVideos.sort((a, b) => {
      const scoreA = this.calculateVideoScore(a);
      const scoreB = this.calculateVideoScore(b);
      return scoreB - scoreA;
    });

    // 4. 限制最终数量
    const finalVideos = enhancedVideos.slice(0, options.totalMaxVideos);

    console.log(`最终处理完成: ${finalVideos.length} 个{tNav("videos")}`);

    return {
      videos: finalVideos,
      afterDeduplication: uniqueVideos.length,
      qualityStats: this.calculateQualityStats(finalVideos)
    };
  }

  /**
   * 基于{tNav("videos")}ID去重
   */
  removeDuplicatesByVideoId(videos) {
    const seenIds = new Set();
    const uniqueVideos = [];

    for (const video of videos) {
      if (video.id && !seenIds.has(video.id)) {
        seenIds.add(video.id);
        uniqueVideos.push(video);
      }
    }

    return uniqueVideos;
  }

  /**
   * 增强{tNav("videos")}信息
   */
  enhanceVideoInfo(video) {
    return {
      ...video,
      // 添加频道权威性评分
      channelAuthority: this.calculateChannelAuthority(video.channelTitle),
      
      // 添加{tNav("videos")}质量评分
      qualityScore: this.calculateVideoQuality(video),
      
      // 添加相关性评分
      relevanceScore: this.calculateRelevanceScore(video),
      
      // 添加分类
      category: this.categorizeVideo(video),
      
      // 添加标签
      enhancedTags: this.generateEnhancedTags(video),
      
      // 格式化时长
      formattedDuration: this.youtubeService.formatDuration(video.duration),
      
      // 格式化观看数
      formattedViewCount: this.formatViewCount(video.viewCount),
      
      // 添加处理MIN戳
      processedAt: new Date().toISOString()
    };
  }

  /**
   * 计算频道权威性
   */
  calculateChannelAuthority(channelTitle) {
    if (!channelTitle) return 0;
    
    const title = channelTitle.toLowerCase();
    
    // 官方频道最高权威性
    if (title.includes('nba') && title.includes('official')) return 1.0;
    if (title.includes('portland trail blazers')) return 0.95;
    
    // 知名体育媒体
    const authorityKeywords = [
      { keyword: 'espn', score: 0.9 },
      { keyword: 'bleacher report', score: 0.85 },
      { keyword: 'the athletic', score: 0.8 },
      { keyword: 'house of highlights', score: 0.75 },
      { keyword: 'nba on tnt', score: 0.8 },
      { keyword: 'sports center', score: 0.75 }
    ];

    for (const { keyword, score } of authorityKeywords) {
      if (title.includes(keyword)) {
        return score;
      }
    }

    // 包含NBA相关的频道
    if (title.includes('nba') || title.includes('basketball')) {
      return 0.6;
    }

    return 0.3; // 默认权威性
  }

  /**
   * 计算{tNav("videos")}质量评分
   */
  calculateVideoQuality(video) {
    let score = 0;
    
    // 观看数评分 (30%)
    const viewScore = Math.min(video.viewCount / 100000, 1.0); // 10万观看为满分
    score += viewScore * 0.3;
    
    // 点赞数评分 (20%)
    const likeScore = Math.min(video.likeCount / 1000, 1.0); // 1000点赞为满分
    score += likeScore * 0.2;
    
    // 时长评分 (20%)
    const durationSeconds = this.youtubeService.parseDuration(video.duration);
    let durationScore = 0;
    if (durationSeconds >= 60 && durationSeconds <= 1200) { // 1-20 min为最佳
      durationScore = 1.0;
    } else if (durationSeconds >= 30 && durationSeconds <= 1800) { // 30 sec-30 min为良好
      durationScore = 0.7;
    } else {
      durationScore = 0.3;
    }
    score += durationScore * 0.2;
    
    // 发布MIN评分 (15%)
    const publishedDate = new Date(video.publishedAt);
    const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    let recencyScore = 0;
    if (daysSincePublished <= 7) {
      recencyScore = 1.0; // 一周内最新
    } else if (daysSincePublished <= 30) {
      recencyScore = 0.8; // 一/内较新
    } else if (daysSincePublished <= 90) {
      recencyScore = 0.6; // 三/内一般
    } else {
      recencyScore = 0.3; // 较旧
    }
    score += recencyScore * 0.15;
    
    // 缩略图质量评分 (15%)
    const thumbnailScore = video.thumbnails && video.thumbnails.high ? 1.0 : 0.5;
    score += thumbnailScore * 0.15;
    
    return Math.min(score, 1.0);
  }

  /**
   * 计算相关性评分
   */
  calculateRelevanceScore(video) {
    let score = 0;
    
    const title = video.title.toLowerCase();
    const description = video.description.toLowerCase();
    
    // 核心关键词匹配 (50%)
    const coreKeywords = [
      { term: 'yang hansen', weight: 1.0 },
      { term: '杨瀚森', weight: 1.0 },
      { term: 'hansen yang', weight: 0.9 },
      { term: 'chinese jokic', weight: 0.8 }
    ];
    
    let keywordScore = 0;
    for (const { term, weight } of coreKeywords) {
      if (title.includes(term)) {
        keywordScore = Math.max(keywordScore, weight);
      } else if (description.includes(term)) {
        keywordScore = Math.max(keywordScore, weight * 0.7);
      }
    }
    score += keywordScore * 0.5;
    
    // 篮球相关词汇 (25%)
    const basketballTerms = ['basketball', 'nba', 'draft', 'blazers', 'center', 'highlights'];
    const basketballScore = basketballTerms.filter(term => 
      title.includes(term) || description.includes(term)
    ).length / basketballTerms.length;
    score += basketballScore * 0.25;
    
    // 策略权重 (25%)
    score += (video.strategyWeight || 0.5) * 0.25;
    
    return Math.min(score, 1.0);
  }

  /**
   * {tNav("videos")}分类
   */
  categorizeVideo(video) {
    const title = video.title.toLowerCase();
    const description = video.description.toLowerCase();
    
    if (this.containsKeywords(title, ['highlight', 'best plays', 'top plays', 'amazing'])) {
      return 'highlights';
    }
    if (this.containsKeywords(title, ['draft', 'selected', 'pick', 'drafted'])) {
      return 'draft';
    }
    if (this.containsKeywords(title, ['summer league', 'vegas', 'las vegas'])) {
      return 'summer_league';
    }
    if (this.containsKeywords(title, ['interview', 'talks', 'speaks', 'says'])) {
      return 'interview';
    }
    if (this.containsKeywords(title, ['training', 'workout', 'practice'])) {
      return 'training';
    }
    if (this.containsKeywords(title, ['skills', 'moves', 'technique'])) {
      return 'skills';
    }
    
    return 'news'; // 默认分类
  }

  /**
   * 生成增强标签
   */
  generateEnhancedTags(video) {
    const tags = new Set();
    
    // 基础标签
    tags.add('Yang Hansen');
    tags.add('basketball');
    
    const title = video.title.toLowerCase();
    const description = video.description.toLowerCase();
    
    // 基于内容的标签
    if (title.includes('nba') || description.includes('nba')) tags.add('NBA');
    if (title.includes('blazers') || description.includes('blazers')) tags.add('Portland Blazers');
    if (title.includes('center') || description.includes('center')) tags.add('center');
    if (title.includes('china') || description.includes('china')) tags.add('China');
    if (title.includes('draft') || description.includes('draft')) tags.add('draft');
    if (title.includes('rookie') || description.includes('rookie')) tags.add('rookie');
    if (title.includes('highlight') || description.includes('highlight')) tags.add('highlights');
    
    // 添加原有标签
    if (video.tags) {
      video.tags.forEach(tag => tags.add(tag));
    }
    
    return Array.from(tags);
  }

  /**
   * 计算{tNav("videos")}综合评分
   */
  calculateVideoScore(video) {
    const relevance = video.relevanceScore || 0;
    const quality = video.qualityScore || 0;
    const authority = video.channelAuthority || 0;
    const strategy = video.strategyWeight || 0;
    
    // 综合评分权重
    return (
      relevance * 0.4 +      // 相关性 40%
      quality * 0.3 +        // 质量 30%
      authority * 0.2 +      // 权威性 20%
      strategy * 0.1         // 策略权重 10%
    );
  }

  /**
   * 检查关键词包含
   */
  containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * 格式化观看数
   */
  formatViewCount(count) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  /**
   * 计算质量统计
   */
  calculateQualityStats(videos) {
    if (videos.length === 0) return null;

    const relevanceScores = videos.map(v => v.relevanceScore || 0);
    const qualityScores = videos.map(v => v.qualityScore || 0);
    const authorityScores = videos.map(v => v.channelAuthority || 0);

    return {
      averageRelevance: relevanceScores.reduce((sum, score) => sum + score, 0) / relevanceScores.length,
      averageQuality: qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length,
      averageAuthority: authorityScores.reduce((sum, score) => sum + score, 0) / authorityScores.length,
      highQualityCount: videos.filter(v => (v.qualityScore || 0) >= 0.7).length,
      highRelevanceCount: videos.filter(v => (v.relevanceScore || 0) >= 0.7).length,
      authorityChannelCount: videos.filter(v => (v.channelAuthority || 0) >= 0.7).length
    };
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
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 搜索最新{tNav("videos")}
   */
  async searchLatestVideos(count = 10) {
    console.log(`搜索最新的 ${count} 个Yang Hansen{tNav("videos")}...`);

    const result = await this.searchWithMultipleStrategies({
      maxVideosPerStrategy: 5,
      totalMaxVideos: count,
      timeRange: 7, // 最近一周
      includeAllStrategies: false // 只使用主要策略
    });

    return result;
  }

  /**
   * 按分类搜索{tNav("videos")}
   */
  async searchByCategory(category, count = 10) {
    const categoryQueries = {
      highlights: 'Yang Hansen highlights basketball',
      draft: 'Yang Hansen NBA draft 2024',
      summer_league: 'Yang Hansen Summer League',
      blazers: 'Yang Hansen Portland Blazers',
      training: 'Yang Hansen training workout',
      interview: 'Yang Hansen interview'
    };

    const query = categoryQueries[category];
    if (!query) {
      throw new Error(`未知的{tNav("videos")}分类: ${category}`);
    }

    console.log(`搜索 ${category} 类别的Yang Hansen{tNav("videos")}...`);

    const result = await this.youtubeService.searchVideos(query, {
      order: 'relevance',
      maxResults: count * 2, // 多获取一些以便过滤
      videoDuration: category === 'highlights' ? 'short' : 'medium'
    });

    if (!result.success) {
      return { videos: [], error: result.error };
    }

    // 增强和过滤{tNav("videos")}
    const enhancedVideos = result.items.map(video => this.enhanceVideoInfo({
      ...video,
      searchStrategy: category,
      strategyWeight: 0.8
    }));

    // 按相关性排序并限制数量
    enhancedVideos.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      videos: enhancedVideos.slice(0, count),
      category,
      total: enhancedVideos.length
    };
  }

  /**
   * 获取搜索统计信息
   */
  getSearchStats() {
    return {
      apiUsage: this.youtubeService.getUsageStats(),
      strategies: this.searchStrategies.map(s => ({
        name: s.name,
        query: s.query,
        weight: s.weight
      })),
      authorityChannels: this.authorityChannels
    };
  }
}

module.exports = YangHansenVideoSearcher;