const NewsAPIService = require('./newsapi-service');
const RelevanceValidator = require('./relevance-validator');

/**
 * Yang Hansen专用{tNav("news")}搜索器
 * 使用多种搜索策略获取最相关的{tNav("news")}
 */
class YangHansenNewsSearcher {
  constructor() {
    this.newsService = new NewsAPIService();
    this.relevanceValidator = new RelevanceValidator();
    
    // 搜索策略配置
    this.searchStrategies = [
      {
        name: 'primary',
        query: 'Yang Hansen basketball',
        language: 'en',
        weight: 1.0
      },
      {
        name: 'nba_draft',
        query: 'Yang Hansen NBA draft',
        language: 'en',
        weight: 0.9
      },
      {
        name: 'blazers',
        query: 'Yang Hansen Portland Blazers',
        language: 'en',
        weight: 0.9
      },
      {
        name: 'chinese_jokic',
        query: '"Chinese Jokic" Yang Hansen',
        language: 'en',
        weight: 0.8
      },
      {
        name: 'center_china',
        query: 'Yang Hansen center China basketball',
        language: 'en',
        weight: 0.7
      },
      {
        name: 'summer_league',
        query: 'Yang Hansen Summer League',
        language: 'en',
        weight: 0.6
      }
    ];
  }

  /**
   * 执行多策略搜索
   */
  async searchWithMultipleStrategies(options = {}) {
    const defaultOptions = {
      maxArticlesPerStrategy: 10,
      totalMaxArticles: 50,
      relevanceThreshold: 0.3,
      timeRange: 30 // 天数
    };

    const searchOptions = { ...defaultOptions, ...options };
    const allArticles = [];
    const searchResults = [];

    console.log('开始多策略Yang Hansen{tNav("news")}搜索...');

    for (const strategy of this.searchStrategies) {
      try {
        console.log(`\n执行搜索策略: ${strategy.name}`);
        console.log(`查询: "${strategy.query}"`);

        const apiOptions = {
          q: strategy.query,
          language: strategy.language,
          pageSize: searchOptions.maxArticlesPerStrategy,
          sortBy: 'relevancy',
          from: this.getDateDaysAgo(searchOptions.timeRange)
        };

        const result = await this.newsService.searchYangHansenNews(apiOptions);
        
        if (result.success && result.articles.length > 0) {
          console.log(`✓ 找到 ${result.articles.length} 篇文章`);
          
          // 为每篇文章添加策略权重
          const weightedArticles = result.articles.map(article => ({
            ...article,
            searchStrategy: strategy.name,
            strategyWeight: strategy.weight
          }));

          allArticles.push(...weightedArticles);
          
          searchResults.push({
            strategy: strategy.name,
            query: strategy.query,
            found: result.articles.length,
            total: result.totalResults
          });
        } else {
          console.log(`✗ 未找到文章`);
          searchResults.push({
            strategy: strategy.name,
            query: strategy.query,
            found: 0,
            total: 0,
            error: result.error
          });
        }

        // 避免API限制
        await this.delay(500);

      } catch (error) {
        console.error(`策略 ${strategy.name} 执行失败:`, error.message);
        searchResults.push({
          strategy: strategy.name,
          query: strategy.query,
          found: 0,
          total: 0,
          error: error.message
        });
      }
    }

    console.log(`\n总获取到 ${allArticles.length} 篇文章`);

    // 去重和相关性过滤
    const processedResult = await this.processSearchResults(allArticles, searchOptions);

    return {
      searchResults,
      processedArticles: processedResult.articles,
      statistics: {
        totalFound: allArticles.length,
        afterDeduplication: processedResult.afterDeduplication,
        afterRelevanceFilter: processedResult.articles.length,
        relevanceThreshold: searchOptions.relevanceThreshold,
        apiUsage: this.newsService.getUsageStats()
      }
    };
  }

  /**
   * 处理搜索Result
   */
  async processSearchResults(articles, options) {
    console.log('\n开始处理搜索Result...');

    // 1. 基础去重（基于URL）
    const uniqueArticles = this.removeDuplicatesByUrl(articles);
    console.log(`去重后剩余: ${uniqueArticles.length} 篇`);

    // 2. 相关性验证
    console.log('进行相关性验证...');
    const relevantArticles = [];
    
    for (const article of uniqueArticles) {
      const validation = this.relevanceValidator.validateArticle(article, options.relevanceThreshold);
      
      if (validation.isRelevant) {
        relevantArticles.push({
          ...article,
          relevanceScore: validation.score,
          relevanceDetails: validation.details
        });
      }
    }

    console.log(`相关性过滤后剩余: ${relevantArticles.length} 篇`);

    // 3. 按相关性和策略权重排序
    relevantArticles.sort((a, b) => {
      const scoreA = a.relevanceScore * (a.strategyWeight || 1);
      const scoreB = b.relevanceScore * (b.strategyWeight || 1);
      return scoreB - scoreA;
    });

    // 4. 限制最终数量
    const finalArticles = relevantArticles.slice(0, options.totalMaxArticles);

    return {
      articles: finalArticles,
      afterDeduplication: uniqueArticles.length,
      relevanceStats: this.calculateRelevanceStats(relevantArticles)
    };
  }

  /**
   * 基于URL去重
   */
  removeDuplicatesByUrl(articles) {
    const seenUrls = new Set();
    const uniqueArticles = [];

    for (const article of articles) {
      if (article.url && !seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        uniqueArticles.push(article);
      }
    }

    return uniqueArticles;
  }

  /**
   * 计算相关性统计
   */
  calculateRelevanceStats(articles) {
    if (articles.length === 0) return null;

    const scores = articles.map(a => a.relevanceScore);
    return {
      average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      max: Math.max(...scores),
      min: Math.min(...scores),
      high: scores.filter(s => s >= 0.8).length,
      medium: scores.filter(s => s >= 0.5 && s < 0.8).length,
      low: scores.filter(s => s < 0.5).length
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
   * 搜索最新的Yang Hansen{tNav("news")}
   */
  async searchLatestNews(count = 10) {
    console.log(`搜索最新的 ${count} 篇Yang Hansen{tNav("news")}...`);

    const result = await this.searchWithMultipleStrategies({
      maxArticlesPerStrategy: 5,
      totalMaxArticles: count,
      relevanceThreshold: 0.4,
      timeRange: 7 // 最近一周
    });

    return result;
  }

  /**
   * 搜索特定类型的{tNav("news")}
   */
  async searchByCategory(category, count = 5) {
    const categoryQueries = {
      draft: 'Yang Hansen NBA draft',
      summer_league: 'Yang Hansen Summer League',
      blazers: 'Yang Hansen Portland Blazers',
      china: 'Yang Hansen China basketball',
      performance: 'Yang Hansen stats performance'
    };

    const query = categoryQueries[category];
    if (!query) {
      throw new Error(`未知的{tNav("news")}类别: ${category}`);
    }

    console.log(`搜索 ${category} 类别的Yang Hansen{tNav("news")}...`);

    const result = await this.newsService.searchYangHansenNews({
      q: query,
      language: 'en',
      pageSize: count * 2, // 多获取一些以便过滤
      sortBy: 'relevancy'
    });

    if (!result.success) {
      return { articles: [], error: result.error };
    }

    // 相关性过滤
    const relevantArticles = [];
    for (const article of result.articles) {
      const validation = this.relevanceValidator.validateArticle(article, 0.3);
      if (validation.isRelevant) {
        relevantArticles.push({
          ...article,
          relevanceScore: validation.score,
          category
        });
      }
    }

    return {
      articles: relevantArticles.slice(0, count),
      category,
      total: relevantArticles.length
    };
  }

  /**
   * 获取搜索统计信息
   */
  getSearchStats() {
    return {
      apiUsage: this.newsService.getUsageStats(),
      strategies: this.searchStrategies.map(s => ({
        name: s.name,
        query: s.query,
        weight: s.weight
      }))
    };
  }
}

module.exports = YangHansenNewsSearcher;