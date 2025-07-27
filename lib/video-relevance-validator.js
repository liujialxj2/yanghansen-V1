/**
 * {tNav("videos")}相关性验证器
 * 分析YouTube{tNav("videos")}与Yang Hansen的相关性，确保内容质量
 */
class VideoRelevanceValidator {
  constructor() {
    // 核心关键词配置
    this.coreKeywords = [
      { term: 'yang hansen', weight: 1.0, required: true },
      { term: '杨瀚森', weight: 1.0, required: true },
      { term: 'hansen yang', weight: 0.9, required: false },
      { term: 'chinese jokic', weight: 0.8, required: false }
    ];

    // 篮球相关关键词
    this.basketballKeywords = [
      { term: 'basketball', weight: 0.8 },
      { term: 'nba', weight: 0.9 },
      { term: 'draft', weight: 0.7 },
      { term: 'blazers', weight: 0.8 },
      { term: 'portland', weight: 0.7 },
      { term: 'center', weight: 0.6 },
      { term: 'highlights', weight: 0.6 },
      { term: 'summer league', weight: 0.7 },
      { term: '篮球', weight: 0.8 },
      { term: '选秀', weight: 0.7 },
      { term: '开拓者', weight: 0.8 }
    ];

    // 权威频道列表
    this.authorityChannels = [
      { name: 'nba', score: 1.0 },
      { name: 'portland trail blazers', score: 0.95 },
      { name: 'espn', score: 0.9 },
      { name: 'bleacher report', score: 0.85 },
      { name: 'the athletic', score: 0.8 },
      { name: 'house of highlights', score: 0.75 },
      { name: 'nba on tnt', score: 0.8 },
      { name: 'nba on espn', score: 0.8 },
      { name: 'sports center', score: 0.75 }
    ];

    // 负面关键词（降低相关性）
    this.negativeKeywords = [
      'fake', 'clickbait', 'reaction', 'reacts to', 
      '假的', '标题党', '反应', '观看反应'
    ];

    // 质量指标阈值
    this.qualityThresholds = {
      minViewCount: 100,
      minLikeCount: 5,
      minDurationSeconds: 30,
      maxDurationSeconds: 1800, // 30 min
      minRelevanceScore: 0.3
    };
  }

  /**
   * 验证{tNav("videos")}相关性
   * @param {Object} video - YouTube{tNav("videos")}对象
   * @param {number} threshold - 相关性阈值
   * @returns {Object} 验证Result
   */
  validateVideo(video, threshold = 0.5) {
    try {
      const analysis = this.analyzeVideo(video);
      const isRelevant = analysis.overallScore >= threshold;

      return {
        isRelevant,
        score: analysis.overallScore,
        threshold,
        details: analysis,
        recommendation: this.getRecommendation(analysis),
        category: this.categorizeVideo(video, analysis),
        quality: this.assessVideoQuality(video)
      };
    } catch (error) {
      console.error('{tNav("videos")}相关性验证失败:', error.message);
      return {
        isRelevant: false,
        score: 0,
        threshold,
        error: error.message
      };
    }
  }

  /**
   * 分析{tNav("videos")}
   * @param {Object} video - YouTube{tNav("videos")}对象
   * @returns {Object} 分析Result
   */
  analyzeVideo(video) {
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();
    const channelTitle = (video.channelTitle || '').toLowerCase();
    const tags = (video.tags || []).map(tag => tag.toLowerCase());

    // 1. 核心关键词分析 (40%)
    const coreScore = this.analyzeCoreKeywords(title, description, tags);

    // 2. 篮球相关性分析 (25%)
    const basketballScore = this.analyzeBasketballRelevance(title, description, tags);

    // 3. 频道权威性分析 (20%)
    const channelScore = this.analyzeChannelAuthority(channelTitle);

    // 4. 内容质量分析 (15%)
    const qualityScore = this.analyzeContentQuality(video, title, description);

    // 计算综合PTS
    const overallScore = Math.min(
      coreScore.score * 0.4 +
      basketballScore.score * 0.25 +
      channelScore.score * 0.2 +
      qualityScore.score * 0.15,
      1.0
    );

    return {
      overallScore,
      components: {
        core: coreScore,
        basketball: basketballScore,
        channel: channelScore,
        quality: qualityScore
      },
      metadata: {
        title: video.title,
        channelTitle: video.channelTitle,
        duration: video.duration,
        viewCount: video.viewCount,
        publishedAt: video.publishedAt
      }
    };
  }

  /**
   * 分析核心关键词
   */
  analyzeCoreKeywords(title, description, tags) {
    let score = 0;
    let foundRequired = false;
    const matches = [];

    for (const keyword of this.coreKeywords) {
      const found = this.findKeywordInContent(keyword.term, title, description, tags);
      
      if (found.found) {
        score += keyword.weight * found.strength;
        matches.push({
          keyword: keyword.term,
          weight: keyword.weight,
          strength: found.strength,
          locations: found.locations
        });

        if (keyword.required) {
          foundRequired = true;
        }
      }
    }

    // 如果没有找到必需的关键词，大幅降低分数
    if (!foundRequired) {
      score *= 0.1;
    }

    return {
      score: Math.min(score, 1.0),
      foundRequired,
      matches,
      analysis: foundRequired ? 'Found required Yang Hansen keywords' : 'Missing required keywords'
    };
  }

  /**
   * 分析篮球相关性
   */
  analyzeBasketballRelevance(title, description, tags) {
    let score = 0;
    const matches = [];

    for (const keyword of this.basketballKeywords) {
      const found = this.findKeywordInContent(keyword.term, title, description, tags);
      
      if (found.found) {
        score += keyword.weight * found.strength;
        matches.push({
          keyword: keyword.term,
          weight: keyword.weight,
          strength: found.strength
        });
      }
    }

    // 检查负面关键词
    let negativeScore = 0;
    const negativeMatches = [];
    
    for (const negKeyword of this.negativeKeywords) {
      if (title.includes(negKeyword) || description.includes(negKeyword)) {
        negativeScore += 0.2;
        negativeMatches.push(negKeyword);
      }
    }

    const finalScore = Math.max(0, Math.min(score - negativeScore, 1.0));

    return {
      score: finalScore,
      positiveMatches: matches,
      negativeMatches,
      analysis: `Basketball relevance: ${matches.length} positive, ${negativeMatches.length} negative keywords`
    };
  }

  /**
   * 分析频道权威性
   */
  analyzeChannelAuthority(channelTitle) {
    let score = 0.3; // 默认基础分数
    let matchedChannel = null;

    for (const channel of this.authorityChannels) {
      if (channelTitle.includes(channel.name)) {
        score = Math.max(score, channel.score);
        matchedChannel = channel.name;
        break;
      }
    }

    // 检查是否包含NBA或篮球相关词汇
    if (!matchedChannel) {
      if (channelTitle.includes('nba') || channelTitle.includes('basketball')) {
        score = 0.6;
      } else if (channelTitle.includes('sport')) {
        score = 0.5;
      }
    }

    return {
      score,
      matchedChannel,
      analysis: matchedChannel ? 
        `Matched authority channel: ${matchedChannel}` : 
        'No specific authority channel match'
    };
  }

  /**
   * 分析内容质量
   */
  analyzeContentQuality(video, title, description) {
    let score = 0;
    const factors = [];

    // 观看数评分
    const viewCount = video.viewCount || 0;
    if (viewCount >= 100000) {
      score += 0.3;
      factors.push('High view count');
    } else if (viewCount >= 10000) {
      score += 0.2;
      factors.push('Good view count');
    } else if (viewCount >= 1000) {
      score += 0.1;
      factors.push('Moderate view count');
    }

    // 点赞数评分
    const likeCount = video.likeCount || 0;
    if (likeCount >= 1000) {
      score += 0.2;
      factors.push('High engagement');
    } else if (likeCount >= 100) {
      score += 0.1;
      factors.push('Good engagement');
    }

    // 时长评分
    const durationSeconds = this.parseDuration(video.duration);
    if (durationSeconds >= 60 && durationSeconds <= 1200) { // 1-20 min
      score += 0.2;
      factors.push('Appropriate duration');
    } else if (durationSeconds >= 30 && durationSeconds <= 1800) { // 30 sec-30 min
      score += 0.1;
      factors.push('Acceptable duration');
    }

    // 发布MIN评分
    const publishedDate = new Date(video.publishedAt);
    const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished <= 30) {
      score += 0.2;
      factors.push('Recent content');
    } else if (daysSincePublished <= 90) {
      score += 0.1;
      factors.push('Relatively recent');
    }

    // 标题和描述质量
    if (title.length >= 20 && title.length <= 100) {
      score += 0.1;
      factors.push('Good title length');
    }

    return {
      score: Math.min(score, 1.0),
      factors,
      metrics: {
        viewCount,
        likeCount,
        durationSeconds,
        daysSincePublished: Math.round(daysSincePublished)
      }
    };
  }

  /**
   * 在内容中查找关键词
   */
  findKeywordInContent(keyword, title, description, tags) {
    const locations = [];
    let strength = 0;

    // 在标题中查找 (权重最高)
    if (title.includes(keyword)) {
      locations.push('title');
      strength += 1.0;
    }

    // 在描述中查找
    if (description.includes(keyword)) {
      locations.push('description');
      strength += 0.7;
    }

    // 在标签中查找
    if (tags.some(tag => tag.includes(keyword))) {
      locations.push('tags');
      strength += 0.5;
    }

    return {
      found: locations.length > 0,
      strength: Math.min(strength, 1.0),
      locations
    };
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
   * {tNav("videos")}分类
   */
  categorizeVideo(video, analysis) {
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();

    if (this.containsKeywords(title, ['highlight', 'best plays', 'top plays'])) {
      return 'highlights';
    }
    if (this.containsKeywords(title, ['draft', 'selected', 'pick'])) {
      return 'draft';
    }
    if (this.containsKeywords(title, ['summer league', 'vegas'])) {
      return 'summer_league';
    }
    if (this.containsKeywords(title, ['interview', 'talks', 'speaks'])) {
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
   * 评估{tNav("videos")}质量
   */
  assessVideoQuality(video) {
    const metrics = {
      viewCount: video.viewCount || 0,
      likeCount: video.likeCount || 0,
      duration: this.parseDuration(video.duration),
      age: this.getVideoAge(video.publishedAt)
    };

    let qualityScore = 0;
    const issues = [];
    const strengths = [];

    // 检查观看数
    if (metrics.viewCount < this.qualityThresholds.minViewCount) {
      issues.push('Low view count');
    } else if (metrics.viewCount > 50000) {
      strengths.push('High view count');
      qualityScore += 0.3;
    }

    // 检查点赞数
    if (metrics.likeCount < this.qualityThresholds.minLikeCount) {
      issues.push('Low engagement');
    } else if (metrics.likeCount > 500) {
      strengths.push('High engagement');
      qualityScore += 0.2;
    }

    // 检查时长
    if (metrics.duration < this.qualityThresholds.minDurationSeconds) {
      issues.push('Too short');
    } else if (metrics.duration > this.qualityThresholds.maxDurationSeconds) {
      issues.push('Too long');
    } else {
      strengths.push('Appropriate duration');
      qualityScore += 0.2;
    }

    // 检查新鲜度
    if (metrics.age <= 30) {
      strengths.push('Recent content');
      qualityScore += 0.3;
    } else if (metrics.age <= 90) {
      qualityScore += 0.1;
    }

    return {
      score: Math.min(qualityScore, 1.0),
      grade: this.getQualityGrade(qualityScore),
      metrics,
      strengths,
      issues,
      recommendation: issues.length === 0 ? 'Recommended' : 
        issues.length <= 2 ? 'Consider' : 'Not recommended'
    };
  }

  /**
   * 获取{tNav("videos")} 龄（天数）
   */
  getVideoAge(publishedAt) {
    const publishedDate = new Date(publishedAt);
    return Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * 获取质量等级
   */
  getQualityGrade(score) {
    if (score >= 0.8) return 'A';
    if (score >= 0.6) return 'B';
    if (score >= 0.4) return 'C';
    if (score >= 0.2) return 'D';
    return 'F';
  }

  /**
   * 获取推荐建议
   */
  getRecommendation(analysis) {
    const score = analysis.overallScore;
    
    if (score >= 0.8) {
      return {
        level: 'highly_recommended',
        message: 'Highly relevant and high quality content',
        action: 'feature'
      };
    } else if (score >= 0.6) {
      return {
        level: 'recommended',
        message: 'Good relevance and quality',
        action: 'include'
      };
    } else if (score >= 0.4) {
      return {
        level: 'consider',
        message: 'Moderate relevance, review manually',
        action: 'review'
      };
    } else {
      return {
        level: 'not_recommended',
        message: 'Low relevance or quality',
        action: 'exclude'
      };
    }
  }

  /**
   * 检查关键词包含
   */
  containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * 批量验证{tNav("videos")}
   * @param {Array} videos - {tNav("videos")}数组
   * @param {number} threshold - 相关性阈值
   * @returns {Array} 验证Result数组
   */
  validateVideos(videos, threshold = 0.5) {
    console.log(`开始批量验证 ${videos.length} 个{tNav("videos")}...`);
    
    const results = videos.map((video, index) => {
      console.log(`验证进度: ${index + 1}/${videos.length} - ${video.title?.substring(0, 50)}...`);
      
      const validation = this.validateVideo(video, threshold);
      return {
        video,
        validation
      };
    });

    const relevant = results.filter(r => r.validation.isRelevant);
    const irrelevant = results.filter(r => !r.validation.isRelevant);

    console.log(`批量验证完成: ${relevant.length} 个相关, ${irrelevant.length} 个不相关`);

    return {
      all: results,
      relevant: relevant.map(r => ({ ...r.video, ...r.validation })),
      irrelevant: irrelevant.map(r => ({ ...r.video, ...r.validation })),
      statistics: {
        total: videos.length,
        relevant: relevant.length,
        irrelevant: irrelevant.length,
        relevanceRate: (relevant.length / videos.length * 100).toFixed(2) + '%',
        averageScore: results.reduce((sum, r) => sum + r.validation.score, 0) / results.length
      }
    };
  }

  /**
   * 获取验证统计信息
   */
  getValidationStats(results) {
    if (!results || results.length === 0) {
      return null;
    }

    const scores = results.map(r => r.validation?.score || 0);
    const categories = {};
    const qualities = {};

    results.forEach(r => {
      const category = r.validation?.category || 'unknown';
      const quality = r.validation?.quality?.grade || 'F';
      
      categories[category] = (categories[category] || 0) + 1;
      qualities[quality] = (qualities[quality] || 0) + 1;
    });

    return {
      count: results.length,
      scores: {
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        max: Math.max(...scores),
        min: Math.min(...scores),
        distribution: {
          high: scores.filter(s => s >= 0.7).length,
          medium: scores.filter(s => s >= 0.4 && s < 0.7).length,
          low: scores.filter(s => s < 0.4).length
        }
      },
      categories,
      qualities
    };
  }
}

module.exports = VideoRelevanceValidator;