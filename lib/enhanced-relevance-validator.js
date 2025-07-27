/**
 * 增强版相关性验证器
 * 基于实际测试Result优化的Yang Hansen{tNav("news")}相关性验证
 */
class EnhancedRelevanceValidator {
  constructor() {
    // Yang Hansen精确匹配关键词 (最高权重)
    this.exactYangHansenKeywords = [
      'Yang Hansen',
      '杨瀚森',
      'Hansen Yang',
      'Yang Hanson', // 常见拼写错误
      'Hansen, Yang'
    ];

    // Yang Hansen相关描述词
    this.yangHansenDescriptors = [
      'Chinese Jokic',
      'Chinese center',
      'Portland Blazers rookie',
      'Blazers center',
      '16th pick',
      'NBA draft pick',
      'Chinese basketball player'
    ];

    // 篮球专业术语 (高权重)
    this.basketballTerms = [
      'basketball', 'NBA', 'center', 'draft', 'rookie', 'player',
      'game', 'season', 'team', 'league', 'court', 'coach'
    ];

    // 篮球统计术语
    this.basketballStats = [
      'points', 'rebounds', 'assists', 'blocks', 'steals',
      'shooting', 'field goal', 'three-point', 'free throw',
      'minutes', 'efficiency', 'performance'
    ];

    // 波特兰开拓者相关
    this.blazersKeywords = [
      'Portland', 'Blazers', 'Trail Blazers', 'Oregon'
    ];

    // NBA选秀相关
    this.draftKeywords = [
      'draft', 'drafted', 'pick', 'selection', 'selected',
      'prospect', 'scouting', 'combine'
    ];

    // 夏季联赛相关
    this.summerLeagueKeywords = [
      'Summer League', 'Las Vegas', 'rookie showcase',
      'development', 'preseason'
    ];

    // 中国篮球相关
    this.chinaBasketballKeywords = [
      'China', 'Chinese', 'Beijing', 'CBA',
      '中国', '中国篮球', '北京', '青 联赛'
    ];

    // 权威体育媒体 (影响可信度)
    this.authoritativeSources = [
      'espn', 'nba.com', 'bleacherreport', 'cbssports',
      'nbcsports', 'yahoo sports', 'si.com', 'cnn',
      'new york post', 'usa today', 'athletic'
    ];

    // 负面关键词 (降低相关性)
    this.negativeKeywords = [
      'obituary', 'death', 'died', 'funeral',
      'unrelated', 'different person', 'not the player'
    ];
  }

  /**
   * 计算增强的相关性分数
   */
  calculateEnhancedRelevanceScore(article) {
    const title = (article.title || '').toLowerCase();
    const content = (article.description || article.content || '').toLowerCase();
    const source = (article.source?.name || '').toLowerCase();
    const url = (article.url || '').toLowerCase();
    
    let score = 0;
    const details = {
      exactMatch: 0,
      descriptorMatch: 0,
      basketballRelevance: 0,
      blazersConnection: 0,
      sourceCredibility: 0,
      negativePenalty: 0,
      contextBonus: 0
    };

    // 1. 精确匹配Yang Hansen (最重要 - 50%)
    const exactMatch = this.checkExactMatch(title, content);
    details.exactMatch = exactMatch;
    score += exactMatch * 0.5;

    // 如果没有精确匹配，大幅降低分数
    if (exactMatch === 0) {
      score *= 0.1; // 严重惩罚
    }

    // 2. Yang Hansen描述词匹配 (20%)
    const descriptorMatch = this.checkDescriptorMatch(title, content);
    details.descriptorMatch = descriptorMatch;
    score += descriptorMatch * 0.2;

    // 3. 篮球相关性 (15%)
    const basketballRelevance = this.checkBasketballRelevance(title, content);
    details.basketballRelevance = basketballRelevance;
    score += basketballRelevance * 0.15;

    // 4. 开拓者队连接 (10%)
    const blazersConnection = this.checkBlazersConnection(title, content);
    details.blazersConnection = blazersConnection;
    score += blazersConnection * 0.1;

    // 5. 来源可信度 (5%)
    const sourceCredibility = this.checkSourceCredibility(source, url);
    details.sourceCredibility = sourceCredibility;
    score += sourceCredibility * 0.05;

    // 6. 负面内容惩罚
    const negativePenalty = this.checkNegativeContent(title, content);
    details.negativePenalty = negativePenalty;
    score -= negativePenalty * 0.3;

    // 7. 上下文奖励
    const contextBonus = this.calculateContextBonus(title, content, article);
    details.contextBonus = contextBonus;
    score += contextBonus * 0.1;

    return {
      score: Math.max(0, Math.min(1, score)),
      details,
      explanation: this.generateExplanation(details, article)
    };
  }

  /**
   * 检查精确匹配
   */
  checkExactMatch(title, content) {
    const text = title + ' ' + content;
    
    for (const keyword of this.exactYangHansenKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        // 标题中出现给更高分
        if (title.includes(keyword.toLowerCase())) {
          return 1.0;
        }
        // 内容中出现给中等分
        return 0.8;
      }
    }
    
    return 0;
  }

  /**
   * 检查描述词匹配
   */
  checkDescriptorMatch(title, content) {
    const text = title + ' ' + content;
    let matches = 0;
    
    for (const descriptor of this.yangHansenDescriptors) {
      if (text.includes(descriptor.toLowerCase())) {
        matches++;
      }
    }
    
    return Math.min(matches * 0.3, 1.0);
  }

  /**
   * 检查篮球相关性
   */
  checkBasketballRelevance(title, content) {
    const text = title + ' ' + content;
    let relevanceScore = 0;
    
    // 基础篮球术语
    const basketballMatches = this.basketballTerms.filter(term => 
      text.includes(term.toLowerCase())
    ).length;
    relevanceScore += Math.min(basketballMatches * 0.1, 0.5);
    
    // 统计术语
    const statsMatches = this.basketballStats.filter(stat => 
      text.includes(stat.toLowerCase())
    ).length;
    relevanceScore += Math.min(statsMatches * 0.05, 0.3);
    
    // 选秀相关
    const draftMatches = this.draftKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).length;
    relevanceScore += Math.min(draftMatches * 0.1, 0.4);
    
    // 夏季联赛相关
    const summerLeagueMatches = this.summerLeagueKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).length;
    relevanceScore += Math.min(summerLeagueMatches * 0.1, 0.3);
    
    return Math.min(relevanceScore, 1.0);
  }

  /**
   * 检查开拓者队连接
   */
  checkBlazersConnection(title, content) {
    const text = title + ' ' + content;
    let connectionScore = 0;
    
    for (const keyword of this.blazersKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        connectionScore += 0.3;
      }
    }
    
    return Math.min(connectionScore, 1.0);
  }

  /**
   * 检查来源可信度
   */
  checkSourceCredibility(source, url) {
    const sourceText = source + ' ' + url;
    
    for (const authSource of this.authoritativeSources) {
      if (sourceText.includes(authSource.toLowerCase())) {
        return 1.0;
      }
    }
    
    // 检查是否包含体育相关域名
    if (sourceText.includes('sport') || sourceText.includes('basketball')) {
      return 0.7;
    }
    
    return 0.3;
  }

  /**
   * 检查负面内容
   */
  checkNegativeContent(title, content) {
    const text = title + ' ' + content;
    let penalty = 0;
    
    for (const negative of this.negativeKeywords) {
      if (text.includes(negative.toLowerCase())) {
        penalty += 0.5;
      }
    }
    
    return Math.min(penalty, 1.0);
  }

  /**
   * 计算上下文奖励
   */
  calculateContextBonus(title, content, article) {
    let bonus = 0;
    const text = title + ' ' + content;
    
    // 时效性奖励
    if (article.publishedAt) {
      const publishDate = new Date(article.publishedAt);
      const now = new Date();
      const daysDiff = (now - publishDate) / (1000 * 60 * 60 * 24);
      
      if (daysDiff <= 7) bonus += 0.3;      // 一周内
      else if (daysDiff <= 30) bonus += 0.2; // 一/内
      else if (daysDiff <= 90) bonus += 0.1; // 三/内
    }
    
    // 中国篮球背景奖励
    const chinaMatches = this.chinaBasketballKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).length;
    bonus += Math.min(chinaMatches * 0.1, 0.3);
    
    // 内容长度奖励 (更详细的文章)
    if (content.length > 200) bonus += 0.1;
    if (content.length > 500) bonus += 0.1;
    
    return Math.min(bonus, 1.0);
  }

  /**
   * 生成解释说明
   */
  generateExplanation(details, article) {
    const explanations = [];
    
    if (details.exactMatch > 0.8) {
      explanations.push('✓ 标题直接提及Yang Hansen');
    } else if (details.exactMatch > 0) {
      explanations.push('✓ 内容提及Yang Hansen');
    } else {
      explanations.push('✗ 未直接提及Yang Hansen');
    }
    
    if (details.descriptorMatch > 0) {
      explanations.push(`✓ 包含相关描述词 (${details.descriptorMatch.toFixed(2)})`);
    }
    
    if (details.basketballRelevance > 0.5) {
      explanations.push('✓ 高篮球相关性');
    } else if (details.basketballRelevance > 0) {
      explanations.push('△ 中等篮球相关性');
    }
    
    if (details.blazersConnection > 0) {
      explanations.push('✓ 与开拓者队相关');
    }
    
    if (details.sourceCredibility > 0.8) {
      explanations.push('✓ 权威媒体来源');
    }
    
    if (details.negativePenalty > 0) {
      explanations.push('✗ 包含负面内容');
    }
    
    if (details.contextBonus > 0.2) {
      explanations.push('✓ 上下文相关性高');
    }
    
    return explanations.join('; ');
  }

  /**
   * 验证文章相关性 (兼容原接口)
   */
  validateArticle(article, threshold = 0.5) {
    const result = this.calculateEnhancedRelevanceScore(article);
    
    return {
      isRelevant: result.score >= threshold,
      score: result.score,
      threshold,
      details: result.details,
      explanation: result.explanation,
      article: {
        title: article.title,
        source: article.source?.name,
        publishedAt: article.publishedAt,
        url: article.url
      }
    };
  }

  /**
   * 批量验证文章
   */
  validateArticles(articles, threshold = 0.5) {
    const results = articles.map(article => ({
      article,
      validation: this.validateArticle(article, threshold)
    }));

    const relevant = results.filter(r => r.validation.isRelevant);
    const irrelevant = results.filter(r => !r.validation.isRelevant);

    return {
      total: articles.length,
      relevant: relevant.length,
      irrelevant: irrelevant.length,
      relevantArticles: relevant.map(r => r.article),
      irrelevantArticles: irrelevant.map(r => r.article),
      validationResults: results,
      statistics: this.calculateValidationStatistics(results)
    };
  }

  /**
   * 计算验证统计信息
   */
  calculateValidationStatistics(results) {
    const scores = results.map(r => r.validation.score);
    const details = results.map(r => r.validation.details);
    
    return {
      scoreStats: {
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        max: Math.max(...scores),
        min: Math.min(...scores),
        median: this.calculateMedian(scores)
      },
      categoryStats: {
        highRelevance: scores.filter(s => s >= 0.8).length,
        mediumRelevance: scores.filter(s => s >= 0.5 && s < 0.8).length,
        lowRelevance: scores.filter(s => s < 0.5).length
      },
      detailStats: {
        exactMatches: details.filter(d => d.exactMatch > 0).length,
        descriptorMatches: details.filter(d => d.descriptorMatch > 0).length,
        basketballRelevant: details.filter(d => d.basketballRelevance > 0.3).length,
        blazersConnected: details.filter(d => d.blazersConnection > 0).length,
        authoritativeSources: details.filter(d => d.sourceCredibility > 0.8).length
      }
    };
  }

  /**
   * 计算中位数
   */
  calculateMedian(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  /**
   * 获取推荐的阈值
   */
  getRecommendedThreshold(articles) {
    const results = articles.map(article => this.validateArticle(article, 0));
    const scores = results.map(r => r.score);
    const stats = this.calculateValidationStatistics(results.map(r => ({ validation: r })));
    
    // 基于分数分布推荐阈值
    if (stats.scoreStats.average > 0.7) {
      return 0.6; // 高质量文章，可以设置较高阈值
    } else if (stats.scoreStats.average > 0.4) {
      return 0.4; // 中等质量，中等阈值
    } else {
      return 0.3; // 低质量，较低阈值
    }
  }
}

module.exports = EnhancedRelevanceValidator;