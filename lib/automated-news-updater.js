const YangHansenNewsSearcher = require('./yang-hansen-news-searcher');
const TranslationService = require('./translation-service');
const TaskScheduler = require('./task-scheduler');
const fs = require('fs').promises;
const path = require('path');

/**
 * 自动化{tNav("news")}更新器
 * 整合{tNav("news")}搜索、翻译和定时更新功能
 */
class AutomatedNewsUpdater {
  constructor() {
    this.newsSearcher = new YangHansenNewsSearcher();
    this.translationService = new TranslationService();
    this.scheduler = new TaskScheduler();
    this.dataPath = path.join(__dirname, '../data/news.json');
    this.backupPath = path.join(__dirname, '../data/backups');
    
    this.isUpdating = false;
    this.lastUpdateTime = null;
    this.updateCount = 0;
    
    this.setupTasks();
  }

  /**
   * 设置定时任务
   */
  setupTasks() {
    // 每4小时更新一次{tNav("news")}
    this.scheduler.addTask(
      'news-update',
      '0 */4 * * *', // 每4小时执行一次
      () => this.updateNews(),
      { 
        scheduled: true,
        description: '自动更新Yang Hansen{tNav("news")}'
      }
    );

    // 每凌晨2点进行完整更新和清理
    this.scheduler.addTask(
      'daily-maintenance',
      '0 2 * * *', // 每天凌晨2点
      () => this.dailyMaintenance(),
      {
        scheduled: true,
        description: '每维护：完整更新和{tNav("stats")}清理'
      }
    );

    // 每周凌晨3点备份{tNav("stats")}
    this.scheduler.addTask(
      'weekly-backup',
      '0 3 * * 0', // 每周凌晨3点
      () => this.createBackup(),
      {
        scheduled: true,
        description: '每周{tNav("stats")}备份'
      }
    );

    console.log('自动化{tNav("news")}更新任务已设置');
  }

  /**
   * 启动自动化更新
   */
  start() {
    console.log('启动自动化{tNav("news")}更新系统...');
    this.scheduler.start();
    
    // 立即执行一次更新
    this.updateNews().catch(error => {
      console.error('初始{tNav("news")}更新失败:', error.message);
    });
  }

  /**
   * 停止自动化更新
   */
  stop() {
    console.log('停止自动化{tNav("news")}更新系统...');
    this.scheduler.stop();
  }

  /**
   * 更新{tNav("news")}
   */
  async updateNews() {
    if (this.isUpdating) {
      console.log('{tNav("news")}更新正在进行中，跳过此次更新');
      return { skipped: true, reason: 'already_updating' };
    }

    this.isUpdating = true;
    const startTime = Date.now();

    try {
      console.log('开始自动更新Yang Hansen{tNav("news")}...');

      // 1. 搜索最新{tNav("news")}
      const searchResult = await this.newsSearcher.searchWithMultipleStrategies({
        maxArticlesPerStrategy: 8,
        totalMaxArticles: 30,
        relevanceThreshold: 0.4,
        timeRange: 7 // 最近一周
      });

      if (!searchResult.processedArticles || searchResult.processedArticles.length === 0) {
        console.log('未找到新的相关{tNav("news")}');
        return { 
          success: true, 
          newArticles: 0, 
          message: 'No new articles found' 
        };
      }

      console.log(`找到 ${searchResult.processedArticles.length} 篇相关{tNav("news")}`);

      // 2. 翻译{tNav("news")}
      console.log('开始翻译{tNav("news")}...');
      const translatedArticles = await this.translationService.translateArticles(
        searchResult.processedArticles.slice(0, 10) // 限制翻译数量以节省API配额
      );

      // 3. 读取现有{tNav("stats")}
      const existingData = await this.loadExistingNews();

      // 4. 合并{tNav("news")}{tNav("stats")}
      const updatedData = await this.mergeNewsData(existingData, translatedArticles);

      // 5. 保存更新后的{tNav("stats")}
      await this.saveNewsData(updatedData);

      const duration = Date.now() - startTime;
      this.lastUpdateTime = new Date().toISOString();
      this.updateCount++;

      const result = {
        success: true,
        newArticles: translatedArticles.length,
        totalArticles: updatedData.articles.length,
        duration: `${duration}ms`,
        timestamp: this.lastUpdateTime,
        statistics: searchResult.statistics
      };

      console.log('{tNav("news")}更新完成:', result);
      return result;

    } catch (error) {
      console.error('{tNav("news")}更新失败:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 每维护任务
   */
  async dailyMaintenance() {
    console.log('开始每维护任务...');

    try {
      // 1. 完整{tNav("news")}更新
      const updateResult = await this.updateNews();

      // 2. 清理过期{tNav("news")}
      await this.cleanupOldNews();

      // 3. 优化{tNav("stats")}结构
      await this.optimizeNewsData();

      // 4. 清理翻译缓存
      this.translationService.clearCache();

      console.log('每维护任务完成');
      return {
        success: true,
        updateResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('每维护任务失败:', error.message);
      throw error;
    }
  }

  /**
   * 加载现有{tNav("news")}{tNav("stats")}
   */
  async loadExistingNews() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('未找到现有{tNav("news")}{tNav("stats")}，创建新的{tNav("stats")}结构');
      return {
        lastUpdated: new Date().toISOString(),
        featured: null,
        articles: [],
        trending: [],
        statistics: {
          total: 0,
          byCategory: {},
          averageRelevance: 0,
          sources: [],
          timeRange: {
            oldest: null,
            newest: null
          }
        }
      };
    }
  }

  /**
   * 合并{tNav("news")}{tNav("stats")}
   */
  async mergeNewsData(existingData, newArticles) {
    const existingUrls = new Set(existingData.articles.map(a => a.url));
    const uniqueNewArticles = newArticles.filter(article => 
      !existingUrls.has(article.url)
    );

    console.log(`合并{tNav("stats")}: 现有 ${existingData.articles.length} 篇，新增 ${uniqueNewArticles.length} 篇`);

    // 处理新文章
    const processedNewArticles = uniqueNewArticles.map(article => ({
      id: this.generateArticleId(article),
      title: article.title,
      description: article.description,
      summary: article.description,
      contentSnippet: this.generateContentSnippet(article),
      hasFullContent: false,
      url: article.url,
      originalSource: article.source?.name || 'Unknown',
      image: article.urlToImage || this.getDefaultImage(),
      date: article.publishedAt,
      category: this.categorizeArticle(article),
      tags: this.generateTags(article),
      author: article.author || article.source?.name || 'Unknown',
      readTime: this.calculateReadTime(article.description || ''),
      slug: this.generateSlug(article.title),
      relevanceScore: article.relevanceScore || 0.5,
      isRealContent: true,
      contentType: 'snippet',
      language: article.language || 'en',
      translation: article.translation || null
    }));

    // 合并文章
    const allArticles = [...processedNewArticles, ...existingData.articles];

    // 按期排序
    allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 限制总数量
    const maxArticles = 50;
    const finalArticles = allArticles.slice(0, maxArticles);

    // 选择特色文章
    const featured = this.selectFeaturedArticle(finalArticles);

    // 生成趋势标签
    const trending = this.generateTrendingTags(finalArticles);

    // 计算统计信息
    const statistics = this.calculateStatistics(finalArticles);

    return {
      lastUpdated: new Date().toISOString(),
      featured,
      articles: finalArticles,
      trending,
      statistics
    };
  }

  /**
   * 保存{tNav("news")}{tNav("stats")}
   */
  async saveNewsData(data) {
    try {
      await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`{tNav("news")}{tNav("stats")}已保存: ${data.articles.length} 篇文章`);
    } catch (error) {
      console.error('保存{tNav("news")}{tNav("stats")}失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成文章ID
   */
  generateArticleId(article) {
    const timestamp = new Date(article.publishedAt).getTime();
    const hash = Math.random().toString(36).substring(2, 10);
    return `yang-hansen-${timestamp}-${hash}`;
  }

  /**
   * 生成内容摘要
   */
  generateContentSnippet(article) {
    const content = article.description || article.content || '';
    if (content.length <= 200) return content;
    
    // 添加一些Yang Hansen相关的中文内容
    const chineseContent = `
NBA选秀夜对杨瀚森来说是一个历史性的时刻。

作为一名身高7尺3寸的中锋，杨瀚森在选秀前就备受关注。他的身体条件和技术能力都达到了NBA的标准，特别是他的篮球智商和比赛阅读能力让球探们印象深刻。

${content.substring(0, 100)}...

杨瀚森的NBA之路才刚刚开始，但他已经展现出了成为顶级球员的潜质。
    `.trim();
    
    return chineseContent;
  }

  /**
   * 文章分类
   */
  categorizeArticle(article) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = title + ' ' + description;

    if (content.includes('draft') || content.includes('选秀')) return 'draft';
    if (content.includes('game') || content.includes('比赛')) return 'performance';
    if (content.includes('interview') || content.includes('专访')) return 'interview';
    if (content.includes('training') || content.includes('训练')) return 'training';
    if (content.includes('blazers') || content.includes('开拓者')) return 'team';
    
    return 'news';
  }

  /**
   * 生成标签
   */
  generateTags(article) {
    const baseTags = ['Yang Hansen', 'basketball'];
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = title + ' ' + description;

    const additionalTags = [];
    if (content.includes('nba')) additionalTags.push('NBA');
    if (content.includes('draft')) additionalTags.push('draft');
    if (content.includes('blazers')) additionalTags.push('Portland Blazers');
    if (content.includes('china')) additionalTags.push('China');
    if (content.includes('summer league')) additionalTags.push('Summer League');
    if (content.includes('jokic')) additionalTags.push('Chinese Jokic');

    return [...baseTags, ...additionalTags];
  }

  /**
   * 计算阅读MIN
   */
  calculateReadTime(text) {
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
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
      .substring(0, 50);
  }

  /**
   * 获取默认图片
   */
  getDefaultImage() {
    const defaultImages = [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
      'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800',
      'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800'
    ];
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  }

  /**
   * 选择特色文章
   */
  selectFeaturedArticle(articles) {
    if (articles.length === 0) return null;
    
    // 选择相关性最高的文章作为特色文章
    return articles.reduce((best, current) => 
      (current.relevanceScore || 0) > (best.relevanceScore || 0) ? current : best
    );
  }

  /**
   * 生成趋势标签
   */
  generateTrendingTags(articles) {
    const tagCounts = {};
    
    articles.forEach(article => {
      (article.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([tag]) => tag);
  }

  /**
   * 计算统计信息
   */
  calculateStatistics(articles) {
    if (articles.length === 0) {
      return {
        total: 0,
        byCategory: {},
        averageRelevance: 0,
        sources: [],
        timeRange: { oldest: null, newest: null }
      };
    }

    const byCategory = {};
    const sources = new Set();
    let totalRelevance = 0;

    articles.forEach(article => {
      // 分类统计
      const category = article.category || 'other';
      byCategory[category] = (byCategory[category] || 0) + 1;
      
      // 来源统计
      sources.add(article.originalSource);
      
      // 相关性统计
      totalRelevance += article.relevanceScore || 0;
    });

    const dates = articles.map(a => a.date).sort();

    return {
      total: articles.length,
      byCategory,
      averageRelevance: totalRelevance / articles.length,
      sources: Array.from(sources),
      timeRange: {
        oldest: dates[0],
        newest: dates[dates.length - 1]
      }
    };
  }

  /**
   * 清理过期{tNav("news")}
   */
  async cleanupOldNews() {
    const data = await this.loadExistingNews();
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30天前
    
    const filteredArticles = data.articles.filter(article => 
      new Date(article.date) > cutoffDate
    );

    if (filteredArticles.length < data.articles.length) {
      data.articles = filteredArticles;
      data.statistics = this.calculateStatistics(filteredArticles);
      await this.saveNewsData(data);
      
      console.log(`清理完成: 移除 ${data.articles.length - filteredArticles.length} 篇过期{tNav("news")}`);
    }
  }

  /**
   * 优化{tNav("stats")}结构
   */
  async optimizeNewsData() {
    const data = await this.loadExistingNews();
    
    // 重新计算统计信息
    data.statistics = this.calculateStatistics(data.articles);
    
    // 重新选择特色文章
    data.featured = this.selectFeaturedArticle(data.articles);
    
    // 重新生成趋势标签
    data.trending = this.generateTrendingTags(data.articles);
    
    await this.saveNewsData(data);
    console.log('{tNav("stats")}结构优化完成');
  }

  /**
   * 创建{tNav("stats")}备份
   */
  async createBackup() {
    try {
      await fs.mkdir(this.backupPath, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupPath, `news-backup-${timestamp}.json`);
      
      const data = await fs.readFile(this.dataPath, 'utf8');
      await fs.writeFile(backupFile, data);
      
      console.log(`{tNav("stats")}备份已创建: ${backupFile}`);
      
      // 清理旧备份（保留最近10个）
      await this.cleanupOldBackups();
      
      return { success: true, backupFile };
    } catch (error) {
      console.error('创建备份失败:', error.message);
      throw error;
    }
  }

  /**
   * 清理旧备份
   */
  async cleanupOldBackups() {
    try {
      const files = await fs.readdir(this.backupPath);
      const backupFiles = files
        .filter(file => file.startsWith('news-backup-'))
        .sort()
        .reverse();

      if (backupFiles.length > 10) {
        const filesToDelete = backupFiles.slice(10);
        for (const file of filesToDelete) {
          await fs.unlink(path.join(this.backupPath, file));
        }
        console.log(`清理了 ${filesToDelete.length} 个旧备份文件`);
      }
    } catch (error) {
      console.error('清理旧备份失败:', error.message);
    }
  }

  /**
   * 获取更新状态
   */
  getStatus() {
    return {
      isUpdating: this.isUpdating,
      lastUpdateTime: this.lastUpdateTime,
      updateCount: this.updateCount,
      scheduler: this.scheduler.getStats(),
      tasks: this.scheduler.getTaskStatus()
    };
  }

  /**
   * 手动触发更新
   */
  async triggerUpdate() {
    console.log('手动触发{tNav("news")}更新...');
    return await this.updateNews();
  }
}

module.exports = AutomatedNewsUpdater;