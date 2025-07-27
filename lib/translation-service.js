const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

/**
 * 翻译服务类
 * 支持多种翻译API服务，提供中英文互译功能
 */
class TranslationService {
  constructor() {
    // 优先使用Google Translate API，如果没有则使用免费的LibreTranslate
    this.googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    this.libreTranslateUrl = process.env.LIBRE_TRANSLATE_URL || 'https://libretranslate.de/translate';
    
    // 翻译缓存，避免重复翻译
    this.translationCache = new Map();
    
    console.log('翻译服务初始化:', {
      googleApi: this.googleApiKey ? '已配置' : '未配置',
      libreTranslate: '可用'
    });
  }

  /**
   * 翻译文本
   * @param {string} text - 要翻译的文本
   * @param {string} targetLang - 目标语言 ('zh' 或 'en')
   * @param {string} sourceLang - 源语言 ('auto', 'zh', 'en')
   * @returns {Promise<string>} 翻译后的文本
   */
  async translateText(text, targetLang = 'zh', sourceLang = 'auto') {
    if (!text || text.trim().length === 0) {
      return text;
    }

    // 检查缓存
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    if (this.translationCache.has(cacheKey)) {
      console.log('使用翻译缓存');
      return this.translationCache.get(cacheKey);
    }

    try {
      let translatedText;
      
      // 优先使用Google Translate API
      if (this.googleApiKey) {
        translatedText = await this.translateWithGoogle(text, targetLang, sourceLang);
      } else {
        // 使用免费的LibreTranslate
        translatedText = await this.translateWithLibre(text, targetLang, sourceLang);
      }

      // 缓存翻译Result
      this.translationCache.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (error) {
      console.error('翻译失败:', error.message);
      return text; // 翻译失败时返回原文
    }
  }

  /**
   * 使用Google Translate API翻译
   */
  async translateWithGoogle(text, targetLang, sourceLang) {
    const url = 'https://translation.googleapis.com/language/translate/v2';
    
    const response = await axios.post(url, {
      q: text,
      target: targetLang === 'zh' ? 'zh-CN' : targetLang,
      source: sourceLang === 'auto' ? undefined : sourceLang,
      key: this.googleApiKey
    });

    if (response.data && response.data.data && response.data.data.translations) {
      return response.data.data.translations[0].translatedText;
    }
    
    throw new Error('Google Translate API返回无效响应');
  }

  /**
   * 使用LibreTranslate翻译
   */
  async translateWithLibre(text, targetLang, sourceLang) {
    const response = await axios.post(this.libreTranslateUrl, {
      q: text,
      source: sourceLang === 'auto' ? 'auto' : sourceLang,
      target: targetLang === 'zh' ? 'zh' : targetLang,
      format: 'text'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 sec超时
    });

    if (response.data && response.data.translatedText) {
      return response.data.translatedText;
    }
    
    throw new Error('LibreTranslate返回无效响应');
  }

  /**
   * 翻译{tNav("news")}文章
   * @param {Object} article - {tNav("news")}文章对象
   * @returns {Promise<Object>} 包含翻译的文章对象
   */
  async translateArticle(article) {
    if (!article) return article;

    try {
      console.log(`翻译文章: ${article.title?.substring(0, 50)}...`);

      // 检测原文语言
      const isEnglish = this.detectLanguage(article.title || article.description || '');
      const sourceLang = isEnglish ? 'en' : 'zh';
      const targetLang = isEnglish ? 'zh' : 'en';

      const translation = {
        title: '',
        summary: '',
        content: ''
      };

      // 翻译标题
      if (article.title) {
        translation.title = await this.translateText(article.title, targetLang, sourceLang);
        await this.delay(100); // 避免API限制
      }

      // 翻译摘要
      if (article.description || article.summary) {
        const summary = article.description || article.summary;
        translation.summary = await this.translateText(summary, targetLang, sourceLang);
        await this.delay(100);
      }

      // 翻译内容
      if (article.content || article.contentSnippet) {
        const content = article.content || article.contentSnippet;
        translation.content = await this.translateText(content, targetLang, sourceLang);
        await this.delay(100);
      }

      return {
        ...article,
        language: sourceLang,
        translation: {
          ...translation,
          language: targetLang
        }
      };
    } catch (error) {
      console.error('翻译文章失败:', error.message);
      return article; // 翻译失败时返回原文章
    }
  }

  /**
   * 批量翻译文章
   * @param {Array} articles - 文章数组
   * @returns {Promise<Array>} 翻译后的文章数组
   */
  async translateArticles(articles) {
    if (!Array.isArray(articles) || articles.length === 0) {
      return articles;
    }

    console.log(`开始批量翻译 ${articles.length} 篇文章...`);
    const translatedArticles = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`翻译进度: ${i + 1}/${articles.length}`);
      
      try {
        const translatedArticle = await this.translateArticle(article);
        translatedArticles.push(translatedArticle);
        
        // 避免API限制，每篇文章间添加延迟
        if (i < articles.length - 1) {
          await this.delay(500);
        }
      } catch (error) {
        console.error(`翻译第 ${i + 1} 篇文章失败:`, error.message);
        translatedArticles.push(article); // 失败时保留原文
      }
    }

    console.log(`批量翻译完成: ${translatedArticles.length}/${articles.length}`);
    return translatedArticles;
  }

  /**
   * 简单的语言检测
   * @param {string} text - 要检测的文本
   * @returns {boolean} true表示英文，false表示中文
   */
  detectLanguage(text) {
    if (!text) return true; // 默认英文
    
    // 简单的中文字符检测
    const chineseRegex = /[\u4e00-\u9fff]/;
    const chineseMatches = text.match(chineseRegex);
    
    // 如果包含中文字符且比例较高，认为是中文
    if (chineseMatches) {
      const chineseRatio = chineseMatches.length / text.length;
      return chineseRatio < 0.3; // 中文字符比例小于30%认为是英文
    }
    
    return true; // 默认英文
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清理翻译缓存
   */
  clearCache() {
    this.translationCache.clear();
    console.log('翻译缓存已清理');
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      size: this.translationCache.size,
      keys: Array.from(this.translationCache.keys()).slice(0, 5) // 显示前5个键
    };
  }

  /**
   * 测试翻译服务
   */
  async testTranslation() {
    console.log('测试翻译服务...');
    
    try {
      // 测试英译中
      const englishText = 'Yang Hansen is a talented basketball player from China.';
      const chineseResult = await this.translateText(englishText, 'zh', 'en');
      console.log('英译中测试:', englishText, '->', chineseResult);

      // 测试中译英
      const chineseText = '杨瀚森是一名来自中国的天才篮球运动员。';
      const englishResult = await this.translateText(chineseText, 'en', 'zh');
      console.log('中译英测试:', chineseText, '->', englishResult);

      return {
        success: true,
        results: {
          englishToChinese: chineseResult,
          chineseToEnglish: englishResult
        }
      };
    } catch (error) {
      console.error('翻译服务测试失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = TranslationService;