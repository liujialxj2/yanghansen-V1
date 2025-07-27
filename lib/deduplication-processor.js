const crypto = require('crypto');

/**
 * 去重处理器
 * 用于识别和处理重复的{tNav("news")}内容
 */
class DeduplicationProcessor {
  constructor() {
    this.seenHashes = new Set();
    this.processedArticles = [];
  }

  /**
   * 生成内容哈希值
   */
  generateContentHash(article) {
    const content = [
      article.title || '',
      article.description || '',
      article.source?.name || ''
    ].join('|').toLowerCase();

    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * 计算两篇文章的相似度
   */
  calculateSimilarity(article1, article2) {
    const title1 = (article1.title || '').toLowerCase();
    const title2 = (article2.title || '').toLowerCase();
    const desc1 = (article1.description || '').toLowerCase();
    const desc2 = (article2.description || '').toLowerCase();

    // 标题相似度 (60%)
    const titleSimilarity = this.calculateTextSimilarity(title1, title2);
    
    // 描述相似度 (40%)
    const descSimilarity = this.calculateTextSimilarity(desc1, desc2);

    return titleSimilarity * 0.6 + descSimilarity * 0.4;
  }

  /**
   * 计算文本相似度 (简单的词汇重叠算法)
   */
  calculateTextSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;

    const words1 = new Set(text1.split(/\s+/).filter(word => word.length > 2));
    const words2 = new Set(text2.split(/\s+/).filter(word => word.length > 2));

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * 找到最相似的文章
   */
  findMostSimilar(article, existingArticles) {
    let maxSimilarity = 0;
    let mostSimilar = null;

    for (const existing of existingArticles) {
      const similarity = this.calculateSimilarity(article, existing);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        mostSimilar = existing;
      }
    }

    return { similarity: maxSimilarity, article: mostSimilar };
  }

  /**
   * 选择更好的文章版本
   */
  selectBetterArticle(article1, article2) {
    // 优先选择内容更完整的文章
    const content1Length = (article1.content || article1.description || '').length;
    const content2Length = (article2.content || article2.description || '').length;

    if (content1Length !== content2Length) {
      return content1Length > content2Length ? article1 : article2;
    }

    // 优先选择更新的文章
    const date1 = new Date(article1.publishedAt || 0);
    const date2 = new Date(article2.publishedAt || 0);

    if (date1.getTime() !== date2.getTime()) {
      return date1 > date2 ? article1 : article2;
    }

    // 优先选择权威来源
    const authoritativeSources = [
      'ESPN', 'NBA.com', 'Bleacher Report', 'Yahoo Sports', 'CBS Sports'
    ];

    const source1 = article1.source?.name || '';
    const source2 = article2.source?.name || '';

    const auth1 = authoritativeSources.some(source => 
      source1.toLowerCase().includes(source.toLowerCase())
    );
    const auth2 = authoritativeSources.some(source => 
      source2.toLowerCase().includes(source.toLowerCase())
    );

    if (auth1 && !auth2) return article1;
    if (auth2 && !auth1) return article2;

    // 默认返回第一个
    return article1;
  }

  /**
   * 去重处理主函数
   */
  removeDuplicates(articles, similarityThreshold = 0.8) {
    const uniqueArticles = [];
    const duplicateGroups = [];
    const processLog = [];

    for (const article of articles) {
      const contentHash = this.generateContentHash(article);
      
      // 检查完全相同的内容
      if (this.seenHashes.has(contentHash)) {
        processLog.push({
          action: 'duplicate_hash',
          article: article.title,
          reason: '内容哈希值重复'
        });
        continue;
      }

      // 检查相似内容
      const similarResult = this.findMostSimilar(article, uniqueArticles);
      
      if (similarResult.similarity >= similarityThreshold) {
        // 找到相似文章，选择更好的版本
        const betterArticle = this.selectBetterArticle(article, similarResult.article);
        
        // 替换原有文章
        const index = uniqueArticles.indexOf(similarResult.article);
        uniqueArticles[index] = betterArticle;
        
        // 记录重复组
        duplicateGroups.push({
          kept: betterArticle.title,
          removed: betterArticle === article ? similarResult.article.title : article.title,
          similarity: similarResult.similarity
        });

        processLog.push({
          action: 'similar_content',
          kept: betterArticle.title,
          removed: betterArticle === article ? similarResult.article.title : article.title,
          similarity: similarResult.similarity
        });
      } else {
        // 添加到唯一文章列表
        uniqueArticles.push(article);
        this.seenHashes.add(contentHash);
        
        processLog.push({
          action: 'added',
          article: article.title,
          similarity: similarResult.similarity
        });
      }
    }

    return {
      originalCount: articles.length,
      uniqueCount: uniqueArticles.length,
      removedCount: articles.length - uniqueArticles.length,
      uniqueArticles,
      duplicateGroups,
      processLog
    };
  }

  /**
   * 合并相关文章信息
   */
  mergeRelatedArticles(articles) {
    const mergedArticles = [];
    
    for (const article of articles) {
      // 查找相关文章
      const relatedArticles = articles.filter(other => 
        other !== article && 
        this.calculateSimilarity(article, other) > 0.3 && 
        this.calculateSimilarity(article, other) < 0.8
      );

      if (relatedArticles.length > 0) {
        // 创建合并后的文章
        const mergedArticle = {
          ...article,
          relatedSources: relatedArticles.map(related => ({
            title: related.title,
            source: related.source?.name,
            url: related.url,
            publishedAt: related.publishedAt
          })),
          sourceCount: relatedArticles.length + 1
        };
        
        mergedArticles.push(mergedArticle);
      } else {
        mergedArticles.push(article);
      }
    }

    return mergedArticles;
  }

  /**
   * 重置去重状态
   */
  reset() {
    this.seenHashes.clear();
    this.processedArticles = [];
  }

  /**
   * 获取去重统计信息
   */
  getStats() {
    return {
      processedCount: this.processedArticles.length,
      uniqueHashCount: this.seenHashes.size,
      duplicateRate: this.processedArticles.length > 0 ? 
        (this.processedArticles.length - this.seenHashes.size) / this.processedArticles.length : 0
    };
  }
}

module.exports = DeduplicationProcessor;