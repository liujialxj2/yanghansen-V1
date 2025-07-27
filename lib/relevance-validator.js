/**
 * 相关性验证器
 * 用于验证{tNav("news")}内容与Yang Hansen的相关性
 */
class RelevanceValidator {
  constructor() {
    // Yang Hansen相关关键词
    this.yangHansenKeywords = [
      'Yang Hansen', '杨瀚森', 'Hansen Yang', 'Yang Hanson',
      'Yang Han Sen', '杨 瀚森', 'Hansen, Yang'
    ];

    // 篮球相关关键词
    this.basketballKeywords = [
      'basketball', 'NBA', 'CBA', 'center', 'player', 'game', 'team',
      'score', 'points', 'rebounds', 'assists', 'blocks', 'draft',
      '篮球', '球员', '中锋', '比赛', 'PTS', 'REB', 'AST', 'BLK'
    ];

    // 中国篮球相关关键词
    this.chinaBasketballKeywords = [
      'China basketball', 'Chinese player', 'Beijing', 'Chinese center',
      '中国篮球', '中国球员', '北京', '青 联赛', '国青队'
    ];

    // 权威体育媒体来源
    this.authoritativeSources = [
      'espn.com', 'nba.com', 'bleacherreport.com', 'sports.yahoo.com',
      'cbssports.com', 'si.com', 'nbcsports.com', 'fox sports',
      'sina.com.cn', 'qq.com', 'sohu.com', 'hupu.com'
    ];
  }

  /**
   * 计算{tNav("news")}与Yang Hansen的相关性分数
   * @param {Object} article - {tNav("news")}文章对象
   * @returns {number} 相关性分数 (0-1)
   */
  calculateRelevanceScore(article) {
    let score = 0;

    // 标题相关性 (40%)
    const titleScore = this.analyzeTitle(article.title || '');
    score += titleScore * 0.4;

    // 内容相关性 (35%)
    const contentScore = this.analyzeContent(article.description || article.content || '');
    score += contentScore * 0.35;

    // 来源权威性 (15%)
    const sourceScore = this.analyzeSource(article.source?.name || '', article.url || '');
    score += sourceScore * 0.15;

    // 时效性 (10%)
    const timelinessScore = this.analyzeTimeliness(article.publishedAt);
    score += timelinessScore * 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * 分析标题相关性
   */
  analyzeTitle(title) {
    if (!title) return 0;

    const titleLower = title.toLowerCase();
    let score = 0;

    // Yang Hansen关键词匹配 (最重要)
    for (const keyword of this.yangHansenKeywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        score += 0.8; // 直接提及Yang Hansen得高分
        break;
      }
    }

    // 篮球相关词汇
    const basketballMatches = this.basketballKeywords.filter(keyword => 
      titleLower.includes(keyword.toLowerCase())
    ).length;
    score += Math.min(basketballMatches * 0.1, 0.3);

    // 中国篮球相关
    const chinaMatches = this.chinaBasketballKeywords.filter(keyword => 
      titleLower.includes(keyword.toLowerCase())
    ).length;
    score += Math.min(chinaMatches * 0.15, 0.2);

    return Math.min(score, 1.0);
  }

  /**
   * 分析内容相关性
   */
  analyzeContent(content) {
    if (!content) return 0;

    const contentLower = content.toLowerCase();
    let score = 0;

    // Yang Hansen关键词匹配
    for (const keyword of this.yangHansenKeywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        score += 0.7;
        break;
      }
    }

    // 篮球术语密度
    const basketballMatches = this.basketballKeywords.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    ).length;
    const basketballDensity = basketballMatches / Math.max(content.split(' ').length / 100, 1);
    score += Math.min(basketballDensity, 0.4);

    // 中国篮球相关内容
    const chinaMatches = this.chinaBasketballKeywords.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    ).length;
    score += Math.min(chinaMatches * 0.1, 0.2);

    return Math.min(score, 1.0);
  }

  /**
   * 分析{tNav("news")}来源权威性
   */
  analyzeSource(sourceName, url) {
    if (!sourceName && !url) return 0.3; // 默认分数

    const sourceText = (sourceName + ' ' + url).toLowerCase();
    
    // 检查是否为权威体育媒体
    for (const source of this.authoritativeSources) {
      if (sourceText.includes(source.toLowerCase())) {
        return 1.0; // 权威来源得满分
      }
    }

    // 检查是否包含体育相关域名
    const sportsDomains = ['sport', 'basketball', 'nba', 'athletic'];
    for (const domain of sportsDomains) {
      if (sourceText.includes(domain)) {
        return 0.7;
      }
    }

    return 0.3; // 普通来源
  }

  /**
   * 分析时效性
   */
  analyzeTimeliness(publishedAt) {
    if (!publishedAt) return 0.5;

    const publishDate = new Date(publishedAt);
    const now = new Date();
    const daysDiff = (now - publishDate) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) return 1.0;      // 1天内
    if (daysDiff <= 7) return 0.8;      // 1周内
    if (daysDiff <= 30) return 0.6;     // 1/内
    if (daysDiff <= 90) return 0.4;     // 3/内
    return 0.2;                         // 更早
  }

  /**
   * 验证文章是否与Yang Hansen相关
   * @param {Object} article - {tNav("news")}文章
   * @param {number} threshold - 相关性阈值 (默认0.5)
   * @returns {Object} 验证Result
   */
  validateArticle(article, threshold = 0.5) {
    const score = this.calculateRelevanceScore(article);
    const isRelevant = score >= threshold;

    return {
      isRelevant,
      score,
      threshold,
      details: {
        title: article.title,
        source: article.source?.name,
        publishedAt: article.publishedAt,
        url: article.url
      }
    };
  }

  /**
   * 批量验证文章相关性
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
      validationResults: results
    };
  }

  /**
   * 获取验证统计信息
   */
  getValidationStats(validationResults) {
    const scores = validationResults.map(r => r.validation.score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    return {
      averageScore: avgScore,
      maxScore,
      minScore,
      totalArticles: validationResults.length,
      highRelevance: scores.filter(s => s >= 0.8).length,
      mediumRelevance: scores.filter(s => s >= 0.5 && s < 0.8).length,
      lowRelevance: scores.filter(s => s < 0.5).length
    };
  }
}

module.exports = RelevanceValidator;