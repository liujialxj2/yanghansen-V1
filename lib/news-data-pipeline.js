const YangHansenNewsSearcher = require('./yang-hansen-news-searcher');
const EnhancedRelevanceValidator = require('./enhanced-relevance-validator');
const DeduplicationProcessor = require('./deduplication-processor');
const NewsContentEnhancer = require('./news-content-enhancer');
const fs = require('fs').promises;
const path = require('path');

/**
 * {tNav("news")}{tNav("stats")}处理管道
 * 整合搜索、验证、去重、格式化等功能
 */
class NewsDataPipeline {
  constructor(options = {}) {
    this.searcher = new YangHansenNewsSearcher();
    this.validator = new EnhancedRelevanceValidator();
    this.deduplicator = new DeduplicationProcessor();
    this.contentEnhancer = new NewsContentEnhancer();
    
    // 配置选项
    this.config = {
      relevanceThreshold: options.relevanceThreshold || 0.4,
      maxArticles: options.maxArticles || 20,
      timeRange: options.timeRange || 30,
      outputPath: options.outputPath || 'data/news.json',
      backupPath: options.backupPath || 'data/backups',
      ...options
    };
    
    this.processingStats = {
      startTime: null,
      endTime: null,
      totalProcessed: 0,
      relevant: 0,
      duplicatesRemoved: 0,
      errors: []
    };
  }

  /**
   * 执行完整的{tNav("news")}{tNav("stats")}处理流程
   */
  async processNews(options = {}) {
    const processOptions = { ...this.config, ...options };
    this.processingStats.startTime = new Date();
    
    console.log('=== 开始{tNav("news")}{tNav("stats")}处理流程 ===');
    console.log(`配置: 相关性阈值=${processOptions.relevanceThreshold}, 最大文章数=${processOptions.maxArticles}`);
    
    try {
      // 1. 搜索{tNav("news")}
      console.log('\n1. 搜索Yang Hansen相关{tNav("news")}...');
      const searchResult = await this.searcher.searchWithMultipleStrategies({
        maxArticlesPerStrategy: 5,
        totalMaxArticles: processOptions.maxArticles * 2, // 多获取一些用于过滤
        relevanceThreshold: 0.1, // 搜索阶段使用低阈值
        timeRange: processOptions.timeRange
      });

      this.processingStats.totalProcessed = searchResult.processedArticles.length;
      console.log(`✓ 搜索完成，获得 ${searchResult.processedArticles.length} 篇文章`);

      // 2. 增强相关性验证
      console.log('\n2. 进行增强相关性验证...');
      const validationResult = this.validator.validateArticles(
        searchResult.processedArticles, 
        processOptions.relevanceThreshold
      );

      this.processingStats.relevant = validationResult.relevant;
      console.log(`✓ 验证完成，${validationResult.relevant} 篇文章通过相关性验证`);

      // 3. 高级去重处理
      console.log('\n3. 进行高级去重处理...');
      const deduplicationResult = this.deduplicator.removeDuplicates(
        validationResult.relevantArticles,
        0.7 // 相似度阈值
      );

      this.processingStats.duplicatesRemoved = deduplicationResult.removedCount;
      console.log(`✓ 去重完成，移除 ${deduplicationResult.removedCount} 篇重复文章`);

      // 4. {tNav("stats")}标准化和增强
      console.log('\n4. {tNav("stats")}标准化和增强...');
      const enhancedArticles = await this.enhanceArticles(deduplicationResult.uniqueArticles);
      console.log(`✓ {tNav("stats")}增强完成，处理 ${enhancedArticles.length} 篇文章`);

      // 5. 内容增强（生成完整正文）
      let contentEnhancedArticles = enhancedArticles;
      if (this.contentEnhancer) {
        console.log('\n5. 内容增强（生成完整正文）...');
        contentEnhancedArticles = this.contentEnhancer.enhanceMultipleNews(enhancedArticles);
        console.log(`✓ 内容增强完成，为 ${contentEnhancedArticles.length} 篇文章生成了完整正文`);
      } else {
        console.log('\n5. 跳过内容增强，保留真实内容...');
        console.log(`✓ 保留 ${enhancedArticles.length} 篇文章的真实内容`);
      }

      // 6. 生成最终{tNav("stats")}结构
      console.log('\n6. 生成最终{tNav("stats")}结构...');
      const finalData = await this.generateFinalDataStructure(
        contentEnhancedArticles,
        searchResult,
        validationResult,
        deduplicationResult
      );

      // 7. 保存{tNav("stats")}
      console.log('\n7. 保存{tNav("stats")}到文件...');
      await this.saveData(finalData, processOptions.outputPath);
      console.log(`✓ {tNav("stats")}已保存到 ${processOptions.outputPath}`);

      // 8. 生成处理报告
      this.processingStats.endTime = new Date();
      const report = this.generateProcessingReport(finalData);
      
      console.log('\n=== 处理流程完成 ===');
      console.log(report.summary);

      return {
        success: true,
        data: finalData,
        stats: this.processingStats,
        report
      };

    } catch (error) {
      this.processingStats.errors.push(error.message);
      console.error('✗ 处理流程失败:', error.message);
      
      return {
        success: false,
        error: error.message,
        stats: this.processingStats
      };
    }
  }

  /**
   * 增强文章{tNav("stats")}
   */
  async enhanceArticles(articles) {
    const enhancedArticles = [];

    for (const article of articles) {
      try {
        const enhanced = {
          // 基础信息
          id: this.generateArticleId(article),
          title: article.title,
          summary: this.generateSummary(article),
          content: article.description || article.content || '',
          url: article.url,
          
          // 媒体信息
          imageUrl: this.extractImageUrl(article),
          
          // MIN信息
          publishedAt: article.publishedAt,
          processedAt: new Date().toISOString(),
          
          // 来源信息
          source: {
            name: article.source?.name || 'Unknown',
            url: article.source?.url || '',
            type: 'news'
          },
          
          // 分类和标签
          category: this.categorizeArticle(article),
          tags: this.generateTags(article),
          
          // 相关性信息
          relevanceScore: article.relevanceScore || 0,
          relevanceDetails: article.relevanceDetails || {},
          
          // 搜索信息
          searchStrategy: article.searchStrategy || 'unknown',
          strategyWeight: article.strategyWeight || 1.0,
          
          // 阅读信息
          readTime: this.estimateReadTime(article.description || article.content || ''),
          language: 'en', // 默认英文
          
          // SEO信息
          slug: this.generateSlug(article.title),
          metaDescription: this.generateMetaDescription(article)
        };

        enhancedArticles.push(enhanced);
      } catch (error) {
        console.warn(`文章增强失败: ${article.title}`, error.message);
        this.processingStats.errors.push(`文章增强失败: ${error.message}`);
      }
    }

    return enhancedArticles;
  }

  /**
   * 生成文章ID
   */
  generateArticleId(article) {
    const timestamp = new Date(article.publishedAt || Date.now()).getTime();
    const hash = require('crypto')
      .createHash('md5')
      .update(article.url || article.title || '')
      .digest('hex')
      .substring(0, 8);
    return `yang-hansen-${timestamp}-${hash}`;
  }

  /**
   * 生成摘要
   */
  generateSummary(article) {
    const content = article.description || article.content || '';
    if (content.length <= 150) return content;
    
    // 截取前150个字符，在最后一个完整单词处截断
    const truncated = content.substring(0, 150);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 100 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }

  /**
   * 提取图片URL
   */
  extractImageUrl(article) {
    // 尝试从文章中提取图片
    if (article.urlToImage) return article.urlToImage;
    
    // 默认图片基于分类
    const defaultImages = {
      draft: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      performance: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      training: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      interview: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      general: 'https://images.unsplash.com/photo-1552657140-4d5a2b8b8d4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };

    const category = this.categorizeArticle(article);
    return defaultImages[category] || defaultImages.general;
  }

  /**
   * 文章分类
   */
  categorizeArticle(article) {
    const text = (article.title + ' ' + (article.description || '')).toLowerCase();
    
    if (text.includes('draft') || text.includes('selected') || text.includes('pick')) {
      return 'draft';
    }
    if (text.includes('summer league') || text.includes('game') || text.includes('performance')) {
      return 'performance';
    }
    if (text.includes('training') || text.includes('practice') || text.includes('workout')) {
      return 'training';
    }
    if (text.includes('interview') || text.includes('says') || text.includes('talks')) {
      return 'interview';
    }
    if (text.includes('blazers') || text.includes('portland') || text.includes('team')) {
      return 'team';
    }
    
    return 'general';
  }

  /**
   * 生成标签
   */
  generateTags(article) {
    const text = (article.title + ' ' + (article.description || '')).toLowerCase();
    const tags = [];
    
    // 基础标签
    tags.push('Yang Hansen', 'basketball');
    
    // 条件标签
    if (text.includes('nba')) tags.push('NBA');
    if (text.includes('draft')) tags.push('draft');
    if (text.includes('blazers') || text.includes('portland')) tags.push('Portland Blazers');
    if (text.includes('chinese') || text.includes('china')) tags.push('China');
    if (text.includes('rookie')) tags.push('rookie');
    if (text.includes('center')) tags.push('center');
    if (text.includes('summer league')) tags.push('Summer League');
    if (text.includes('jokic')) tags.push('Chinese Jokic');
    
    return [...new Set(tags)]; // 去重
  }

  /**
   * 估算阅读MIN
   */
  estimateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min`;
  }

  /**
   * 生成URL slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }

  /**
   * 生成meta描述
   */
  generateMetaDescription(article) {
    const content = article.description || article.content || '';
    return content.length > 160 ? content.substring(0, 157) + '...' : content;
  }

  /**
   * 生成最终{tNav("stats")}结构
   */
  async generateFinalDataStructure(articles, searchResult, validationResult, deduplicationResult) {
    // 按相关性分数排序
    const sortedArticles = articles.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // 选择头条{tNav("news")}（最高相关性分数）
    const featured = sortedArticles[0] || null;
    
    // 其余文章
    const regularArticles = sortedArticles.slice(1);
    
    // 生成{tNews("trendingTopics")}
    const trending = this.generateTrendingTopics(articles);
    
    // 按类别分组
    const categories = this.groupByCategory(articles);

    return {
      lastUpdated: new Date().toISOString(),
      featured,
      articles: regularArticles,
      trending,
      categories,
      statistics: {
        total: articles.length,
        byCategory: Object.keys(categories).reduce((acc, cat) => {
          acc[cat] = categories[cat].length;
          return acc;
        }, {}),
        averageRelevance: articles.reduce((sum, a) => sum + a.relevanceScore, 0) / articles.length,
        sources: [...new Set(articles.map(a => a.source.name))],
        timeRange: {
          oldest: articles.reduce((oldest, a) => 
            new Date(a.publishedAt) < new Date(oldest.publishedAt) ? a : oldest
          ).publishedAt,
          newest: articles.reduce((newest, a) => 
            new Date(a.publishedAt) > new Date(newest.publishedAt) ? a : newest
          ).publishedAt
        }
      },
      processing: {
        processedAt: new Date().toISOString(),
        searchStrategies: searchResult.searchResults.length,
        totalFound: this.processingStats.totalProcessed,
        relevantFound: this.processingStats.relevant,
        duplicatesRemoved: this.processingStats.duplicatesRemoved,
        finalCount: articles.length
      }
    };
  }

  /**
   * 生成{tNews("trendingTopics")}
   */
  generateTrendingTopics(articles) {
    const topicCounts = {};
    
    articles.forEach(article => {
      article.tags.forEach(tag => {
        topicCounts[tag] = (topicCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([topic]) => topic);
  }

  /**
   * 按类别分组
   */
  groupByCategory(articles) {
    const categories = {};
    
    articles.forEach(article => {
      const category = article.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(article);
    });
    
    return categories;
  }

  /**
   * 保存{tNav("stats")}
   */
  async saveData(data, outputPath) {
    try {
      // 确保目录存在
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });
      
      // 备份现有文件
      await this.backupExistingFile(outputPath);
      
      // 保存新{tNav("stats")}
      await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf8');
      
      console.log(`✓ {tNav("stats")}已保存到 ${outputPath}`);
    } catch (error) {
      throw new Error(`保存{tNav("stats")}失败: ${error.message}`);
    }
  }

  /**
   * 备份现有文件
   */
  async backupExistingFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        const backupDir = this.config.backupPath;
        await fs.mkdir(backupDir, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `news-${timestamp}.json`);
        
        await fs.copyFile(filePath, backupPath);
        console.log(`✓ 已备份现有文件到 ${backupPath}`);
      }
    } catch (error) {
      // 文件不存在或其他错误，继续执行
      console.log('无需备份（文件不存在或无法访问）');
    }
  }

  /**
   * 生成处理报告
   */
  generateProcessingReport(data) {
    const duration = this.processingStats.endTime - this.processingStats.startTime;
    const durationMinutes = Math.round(duration / 1000 / 60 * 100) / 100;
    
    const summary = `
处理完成报告:
- 处理MIN: ${durationMinutes}  min
- 总搜索Result: ${this.processingStats.totalProcessed} 篇
- 相关文章: ${this.processingStats.relevant} 篇
- 去重移除: ${this.processingStats.duplicatesRemoved} 篇
- 最终文章: ${data.articles.length + (data.featured ? 1 : 0)} 篇
- 平均相关性: ${data.statistics.averageRelevance.toFixed(3)}
- 错误数量: ${this.processingStats.errors.length}
    `.trim();

    return {
      summary,
      detailed: {
        duration: durationMinutes,
        stats: this.processingStats,
        dataStats: data.statistics,
        categories: data.categories,
        trending: data.trending
      }
    };
  }

  /**
   * 获取处理统计
   */
  getProcessingStats() {
    return this.processingStats;
  }
}

module.exports = NewsDataPipeline;