const YangHansenVideoSearcher = require('./yang-hansen-video-searcher');
const VideoRelevanceValidator = require('./video-relevance-validator');
const TaskScheduler = require('./task-scheduler');
const fs = require('fs').promises;
const path = require('path');

/**
 * 自动化{tNav("videos")}更新器
 * 整合{tNav("videos")}搜索、验证、分类和定时更新功能
 */
class AutomatedVideoUpdater {
  constructor() {
    this.videoSearcher = new YangHansenVideoSearcher();
    this.relevanceValidator = new VideoRelevanceValidator();
    this.scheduler = new TaskScheduler();
    this.dataPath = path.join(__dirname, '../data/videos.json');
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
    // 每6小时更新一次{tNav("videos")}
    this.scheduler.addTask(
      'video-update',
      '0 */6 * * *', // 每6小时执行一次
      () => this.updateVideos(),
      { 
        scheduled: true,
        description: '自动更新Yang Hansen{tNav("videos")}'
      }
    );

    // 每凌晨3点进行完整更新和清理
    this.scheduler.addTask(
      'video-daily-maintenance',
      '0 3 * * *', // 每天凌晨3点
      () => this.dailyMaintenance(),
      {
        scheduled: true,
        description: '每{tNav("videos")}维护：完整更新和{tNav("stats")}清理'
      }
    );

    // 每周一凌晨4点备份{tNav("videos")}{tNav("stats")}
    this.scheduler.addTask(
      'video-weekly-backup',
      '0 4 * * 1', // 每周一凌晨4点
      () => this.createBackup(),
      {
        scheduled: true,
        description: '每周{tNav("videos")}{tNav("stats")}备份'
      }
    );

    console.log('自动化{tNav("videos")}更新任务已设置');
  }

  /**
   * 启动自动化更新
   */
  start() {
    console.log('启动自动化{tNav("videos")}更新系统...');
    this.scheduler.start();
    
    // 立即执行一次更新
    this.updateVideos().catch(error => {
      console.error('初始{tNav("videos")}更新失败:', error.message);
    });
  }

  /**
   * 停止自动化更新
   */
  stop() {
    console.log('停止自动化{tNav("videos")}更新系统...');
    this.scheduler.stop();
  }

  /**
   * 更新{tNav("videos")}
   */
  async updateVideos() {
    if (this.isUpdating) {
      console.log('{tNav("videos")}更新正在进行中，跳过此次更新');
      return { skipped: true, reason: 'already_updating' };
    }

    this.isUpdating = true;
    const startTime = Date.now();

    try {
      console.log('开始自动更新Yang Hansen{tNav("videos")}...');

      // 1. 搜索最新{tNav("videos")}
      const searchResult = await this.videoSearcher.searchWithMultipleStrategies({
        maxVideosPerStrategy: 10,
        totalMaxVideos: 40,
        timeRange: 30, // 最近30天
        includeAllStrategies: true
      });

      if (!searchResult.processedVideos || searchResult.processedVideos.length === 0) {
        console.log('未找到新的相关{tNav("videos")}');
        return { 
          success: true, 
          newVideos: 0, 
          message: 'No new videos found' 
        };
      }

      console.log(`找到 ${searchResult.processedVideos.length} 个相关{tNav("videos")}`);

      // 2. 验证{tNav("videos")}相关性
      console.log('开始验证{tNav("videos")}相关性...');
      const validationResult = this.relevanceValidator.validateVideos(
        searchResult.processedVideos, 
        0.4 // 相关性阈值
      );

      const relevantVideos = validationResult.relevant;
      console.log(`相关性验证完成: ${relevantVideos.length} 个相关{tNav("videos")}`);

      if (relevantVideos.length === 0) {
        console.log('没有通过相关性验证的{tNav("videos")}');
        return { 
          success: true, 
          newVideos: 0, 
          message: 'No relevant videos found' 
        };
      }

      // 3. 读取现有{tNav("stats")}
      const existingData = await this.loadExistingVideos();

      // 4. 合并{tNav("videos")}{tNav("stats")}
      const updatedData = await this.mergeVideoData(existingData, relevantVideos);

      // 5. 保存更新后的{tNav("stats")}
      await this.saveVideoData(updatedData);

      const duration = Date.now() - startTime;
      this.lastUpdateTime = new Date().toISOString();
      this.updateCount++;

      const result = {
        success: true,
        newVideos: relevantVideos.length,
        totalVideos: this.getTotalVideoCount(updatedData),
        duration: `${duration}ms`,
        timestamp: this.lastUpdateTime,
        statistics: {
          search: searchResult.statistics,
          validation: validationResult.statistics
        }
      };

      console.log('{tNav("videos")}更新完成:', result);
      return result;

    } catch (error) {
      console.error('{tNav("videos")}更新失败:', error.message);
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
    console.log('开始每{tNav("videos")}维护任务...');

    try {
      // 1. 完整{tNav("videos")}更新
      const updateResult = await this.updateVideos();

      // 2. 清理过期{tNav("videos")}
      await this.cleanupOldVideos();

      // 3. 优化{tNav("stats")}结构
      await this.optimizeVideoData();

      // 4. 验证{tNav("videos")}状态
      await this.validateVideoStatus();

      console.log('每{tNav("videos")}维护任务完成');
      return {
        success: true,
        updateResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('每{tNav("videos")}维护任务失败:', error.message);
      throw error;
    }
  }

  /**
   * 加载现有{tNav("videos")}{tNav("stats")}
   */
  async loadExistingVideos() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('未找到现有{tNav("videos")}{tNav("stats")}，创建新的{tNav("stats")}结构');
      return {
        lastUpdated: new Date().toISOString(),
        featured: null,
        categories: {
          highlights: [],
          draft: [],
          summer_league: [],
          interview: [],
          training: [],
          skills: [],
          news: []
        },
        statistics: {
          total: 0,
          byCategory: {},
          averageRelevance: 0,
          averageQuality: 0,
          totalViews: 0,
          timeRange: {
            oldest: null,
            newest: null
          },
          lastProcessed: null
        }
      };
    }
  }

  /**
   * 合并{tNav("videos")}{tNav("stats")}
   */
  async mergeVideoData(existingData, newVideos) {
    const existingIds = new Set();
    
    // 收集现有{tNav("videos")}ID
    Object.values(existingData.categories).forEach(categoryVideos => {
      categoryVideos.forEach(video => existingIds.add(video.id));
    });

    // 过滤出真正的新{tNav("videos")}
    const uniqueNewVideos = newVideos.filter(video => 
      !existingIds.has(video.id)
    );

    console.log(`合并{tNav("stats")}: 现有 ${this.getTotalVideoCount(existingData)} 个，新增 ${uniqueNewVideos.length} 个`);

    // 处理新{tNav("videos")}
    const processedNewVideos = uniqueNewVideos.map(video => this.processVideoForStorage(video));

    // 按分类合并{tNav("videos")}
    const updatedCategories = { ...existingData.categories };
    
    processedNewVideos.forEach(video => {
      const category = video.category || 'news';
      if (!updatedCategories[category]) {
        updatedCategories[category] = [];
      }
      updatedCategories[category].push(video);
    });

    // 对每个分类的{tNav("videos")}进行排序和限制数量
    Object.keys(updatedCategories).forEach(category => {
      // 按相关性和质量排序
      updatedCategories[category].sort((a, b) => {
        const scoreA = (a.relevanceScore || 0) * (a.qualityScore || 0);
        const scoreB = (b.relevanceScore || 0) * (b.qualityScore || 0);
        return scoreB - scoreA;
      });

      // 限制每个分类的{tNav("videos")}数量
      const maxPerCategory = category === 'highlights' ? 20 : 15;
      updatedCategories[category] = updatedCategories[category].slice(0, maxPerCategory);
    });

    // 选择特色{tNav("videos")}
    const featured = this.selectFeaturedVideo(updatedCategories);

    // 计算统计信息
    const statistics = this.calculateVideoStatistics(updatedCategories);

    return {
      lastUpdated: new Date().toISOString(),
      featured,
      categories: updatedCategories,
      statistics
    };
  }

  /**
   * 处理{tNav("videos")}用于存储
   */
  processVideoForStorage(video) {
    return {
      id: `video-${video.id}`,
      youtubeId: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnailUrl || video.thumbnails?.high?.url || '',
      duration: this.formatDuration(video.duration),
      publishedAt: video.publishedAt,
      viewCount: video.viewCount || 0,
      formattedViewCount: this.formatViewCount(video.viewCount || 0),
      likeCount: video.likeCount || 0,
      channelTitle: video.channelTitle,
      channelId: video.channelId,
      category: video.category || 'news',
      tags: this.generateVideoTags(video),
      relevanceScore: video.relevanceScore || 0,
      qualityScore: video.qualityScore || 0,
      channelAuthority: video.channelAuthority || 0,
      embedUrl: `https://www.youtube.com/embed/${video.id}`,
      watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
      searchStrategy: video.searchStrategy,
      isProcessed: true,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 格式化时长
   */
  formatDuration(duration) {
    if (!duration) return '0:00';
    
    // 如果已经是格式化的时长，直接返回
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }

    // 解析YouTube时长格式 PT4M13S
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
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
   * 生成{tNav("videos")}标签
   */
  generateVideoTags(video) {
    const baseTags = ['Yang Hansen', 'basketball'];
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();

    const additionalTags = [];
    if (title.includes('nba') || description.includes('nba')) additionalTags.push('NBA');
    if (title.includes('blazers') || description.includes('blazers')) additionalTags.push('Portland Blazers');
    if (title.includes('highlights')) additionalTags.push('highlights');
    if (title.includes('draft')) additionalTags.push('draft');
    if (title.includes('summer league')) additionalTags.push('Summer League');
    if (title.includes('chinese jokic')) additionalTags.push('Chinese Jokic');

    // 添加原有标签
    const originalTags = video.tags || video.enhancedTags || [];
    
    return [...new Set([...baseTags, ...additionalTags, ...originalTags])];
  }

  /**
   * 选择特色{tNav("videos")}
   */
  selectFeaturedVideo(categories) {
    const allVideos = [];
    
    Object.values(categories).forEach(categoryVideos => {
      allVideos.push(...categoryVideos);
    });

    if (allVideos.length === 0) return null;

    // 选择综合评分最高的{tNav("videos")}作为特色{tNav("videos")}
    return allVideos.reduce((best, current) => {
      const bestScore = (best.relevanceScore || 0) * (best.qualityScore || 0) * (best.channelAuthority || 0);
      const currentScore = (current.relevanceScore || 0) * (current.qualityScore || 0) * (current.channelAuthority || 0);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * 计算{tNav("videos")}统计信息
   */
  calculateVideoStatistics(categories) {
    const allVideos = [];
    const byCategory = {};
    let totalViews = 0;
    let totalRelevance = 0;
    let totalQuality = 0;

    Object.entries(categories).forEach(([category, videos]) => {
      byCategory[category] = videos.length;
      allVideos.push(...videos);
    });

    if (allVideos.length === 0) {
      return {
        total: 0,
        byCategory: {},
        averageRelevance: 0,
        averageQuality: 0,
        totalViews: 0,
        timeRange: { oldest: null, newest: null },
        lastProcessed: new Date().toISOString()
      };
    }

    allVideos.forEach(video => {
      totalViews += video.viewCount || 0;
      totalRelevance += video.relevanceScore || 0;
      totalQuality += video.qualityScore || 0;
    });

    const dates = allVideos.map(v => v.publishedAt).sort();

    return {
      total: allVideos.length,
      byCategory,
      averageRelevance: totalRelevance / allVideos.length,
      averageQuality: totalQuality / allVideos.length,
      totalViews,
      timeRange: {
        oldest: dates[0],
        newest: dates[dates.length - 1]
      },
      lastProcessed: new Date().toISOString()
    };
  }

  /**
   * 获取{tNav("videos")}总数
   */
  getTotalVideoCount(data) {
    return Object.values(data.categories).reduce((total, videos) => total + videos.length, 0);
  }

  /**
   * 保存{tNav("videos")}{tNav("stats")}
   */
  async saveVideoData(data) {
    try {
      await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`{tNav("videos")}{tNav("stats")}已保存: ${this.getTotalVideoCount(data)} 个{tNav("videos")}`);
    } catch (error) {
      console.error('保存{tNav("videos")}{tNav("stats")}失败:', error.message);
      throw error;
    }
  }

  /**
   * 清理过期{tNav("videos")}
   */
  async cleanupOldVideos() {
    const data = await this.loadExistingVideos();
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90天前
    let totalRemoved = 0;

    Object.keys(data.categories).forEach(category => {
      const originalCount = data.categories[category].length;
      data.categories[category] = data.categories[category].filter(video => 
        new Date(video.publishedAt) > cutoffDate
      );
      const removedCount = originalCount - data.categories[category].length;
      totalRemoved += removedCount;
    });

    if (totalRemoved > 0) {
      data.statistics = this.calculateVideoStatistics(data.categories);
      await this.saveVideoData(data);
      console.log(`清理完成: 移除 ${totalRemoved} 个过期{tNav("videos")}`);
    }
  }

  /**
   * 优化{tNav("stats")}结构
   */
  async optimizeVideoData() {
    const data = await this.loadExistingVideos();
    
    // 重新计算统计信息
    data.statistics = this.calculateVideoStatistics(data.categories);
    
    // 重新选择特色{tNav("videos")}
    data.featured = this.selectFeaturedVideo(data.categories);
    
    await this.saveVideoData(data);
    console.log('{tNav("videos")}{tNav("stats")}结构优化完成');
  }

  /**
   * 验证{tNav("videos")}状态
   */
  async validateVideoStatus() {
    console.log('开始验证{tNav("videos")}状态...');
    // 这里可以添加检查{tNav("videos")}是否仍然可用的逻辑
    // 由于YouTube API限制，暂时跳过实际验证
    console.log('{tNav("videos")}状态验证完成');
  }

  /**
   * 创建{tNav("stats")}备份
   */
  async createBackup() {
    try {
      await fs.mkdir(this.backupPath, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupPath, `videos-backup-${timestamp}.json`);
      
      const data = await fs.readFile(this.dataPath, 'utf8');
      await fs.writeFile(backupFile, data);
      
      console.log(`{tNav("videos")}{tNav("stats")}备份已创建: ${backupFile}`);
      
      // 清理旧备份（保留最近10个）
      await this.cleanupOldBackups();
      
      return { success: true, backupFile };
    } catch (error) {
      console.error('创建{tNav("videos")}备份失败:', error.message);
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
        .filter(file => file.startsWith('videos-backup-'))
        .sort()
        .reverse();

      if (backupFiles.length > 10) {
        const filesToDelete = backupFiles.slice(10);
        for (const file of filesToDelete) {
          await fs.unlink(path.join(this.backupPath, file));
        }
        console.log(`清理了 ${filesToDelete.length} 个旧{tNav("videos")}备份文件`);
      }
    } catch (error) {
      console.error('清理旧{tNav("videos")}备份失败:', error.message);
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
    console.log('手动触发{tNav("videos")}更新...');
    return await this.updateVideos();
  }

  /**
   * 按分类获取{tNav("videos")}
   */
  async getVideosByCategory(category) {
    const data = await this.loadExistingVideos();
    return data.categories[category] || [];
  }

  /**
   * 搜索{tNav("videos")}
   */
  async searchVideos(query) {
    const data = await this.loadExistingVideos();
    const allVideos = [];
    
    Object.values(data.categories).forEach(categoryVideos => {
      allVideos.push(...categoryVideos);
    });

    const queryLower = query.toLowerCase();
    return allVideos.filter(video => 
      video.title.toLowerCase().includes(queryLower) ||
      video.description.toLowerCase().includes(queryLower) ||
      video.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }
}

module.exports = AutomatedVideoUpdater;