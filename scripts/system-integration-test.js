const AutomatedNewsUpdater = require('../lib/automated-news-updater');
const AutomatedVideoUpdater = require('../lib/automated-video-updater');
const TranslationService = require('../lib/translation-service');
const TaskScheduler = require('../lib/task-scheduler');
const fs = require('fs').promises;
const path = require('path');

/**
 * 系统集成测试
 * 测试所有自动化功能的集成和稳定性
 */
class SystemIntegrationTest {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.logFile = path.join(__dirname, '../logs/integration-test.log');
  }

  /**
   * 运行完整的集成测试
   */
  async runFullTest() {
    console.log('🚀 开始系统集成测试...\n');
    
    try {
      // 确保日志目录存在
      await this.ensureLogDirectory();
      
      // 1. 测试翻译服务
      await this.testTranslationService();
      
      // 2. 测试任务调度器
      await this.testTaskScheduler();
      
      // 3. 测试新闻自动化系统
      await this.testNewsAutomation();
      
      // 4. 测试视频自动化系统
      await this.testVideoAutomation();
      
      // 5. 测试系统集成
      await this.testSystemIntegration();
      
      // 6. 测试错误处理
      await this.testErrorHandling();
      
      // 7. 测试性能
      await this.testPerformance();
      
      // 生成测试报告
      await this.generateTestReport();
      
    } catch (error) {
      console.error('❌ 集成测试失败:', error.message);
      await this.logError('Integration test failed', error);
    }
  }

  /**
   * 测试翻译服务
   */
  async testTranslationService() {
    console.log('📝 测试翻译服务...');
    const testName = 'Translation Service';
    
    try {
      const translationService = new TranslationService();
      
      // 测试基础翻译功能
      const englishText = 'Yang Hansen is a talented basketball player.';
      const chineseResult = await translationService.translateText(englishText, 'zh', 'en');
      
      const chineseText = '杨瀚森是一名优秀的篮球运动员。';
      const englishResult = await translationService.translateText(chineseText, 'en', 'zh');
      
      // 测试文章翻译
      const testArticle = {
        title: 'Yang Hansen Draft News',
        description: 'Yang Hansen was selected in the NBA draft.',
        content: 'This is a test article about Yang Hansen.'
      };
      
      const translatedArticle = await translationService.translateArticle(testArticle);
      
      // 验证结果
      const success = chineseResult && englishResult && 
                     translatedArticle && translatedArticle.translation;
      
      this.addTestResult(testName, success, {
        englishToChinese: chineseResult,
        chineseToEnglish: englishResult,
        articleTranslation: !!translatedArticle.translation
      });
      
      console.log(success ? '✅ 翻译服务测试通过' : '❌ 翻译服务测试失败');
      
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
      console.log('❌ 翻译服务测试失败:', error.message);
    }
  }

  /**
   * 测试任务调度器
   */
  async testTaskScheduler() {
    console.log('⏰ 测试任务调度器...');
    const testName = 'Task Scheduler';
    
    try {
      const scheduler = new TaskScheduler();
      
      // 添加测试任务
      let taskExecuted = false;
      scheduler.addTask('test-task', '*/5 * * * * *', () => {
        taskExecuted = true;
        return 'Task executed successfully';
      });
      
      // 手动执行任务
      const result = await scheduler.executeTask('test-task');
      
      // 获取任务状态
      const status = scheduler.getTaskStatus('test-task');
      const stats = scheduler.getStats();
      
      const success = taskExecuted && result && status && stats;
      
      this.addTestResult(testName, success, {
        taskExecuted,
        result,
        status: !!status,
        stats: !!stats
      });
      
      console.log(success ? '✅ 任务调度器测试通过' : '❌ 任务调度器测试失败');
      
      // 清理
      scheduler.removeTask('test-task');
      
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
      console.log('❌ 任务调度器测试失败:', error.message);
    }
  }

  /**
   * 测试新闻自动化系统
   */
  async testNewsAutomation() {
    console.log('📰 测试新闻自动化系统...');
    const testName = 'News Automation';
    
    try {
      const newsUpdater = new AutomatedNewsUpdater();
      
      // 测试新闻更新
      const updateResult = await newsUpdater.updateNews();
      
      // 获取状态
      const status = newsUpdater.getStatus();
      
      // 验证数据文件是否存在
      const dataPath = path.join(__dirname, '../data/news.json');
      const dataExists = await this.fileExists(dataPath);
      
      let newsData = null;
      if (dataExists) {
        const rawData = await fs.readFile(dataPath, 'utf8');
        newsData = JSON.parse(rawData);
      }
      
      const success = updateResult && updateResult.success && 
                     status && dataExists && newsData;
      
      this.addTestResult(testName, success, {
        updateResult: !!updateResult,
        updateSuccess: updateResult?.success,
        status: !!status,
        dataExists,
        articlesCount: newsData?.articles?.length || 0
      });
      
      console.log(success ? '✅ 新闻自动化测试通过' : '❌ 新闻自动化测试失败');
      
      // 停止调度器
      newsUpdater.stop();
      
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
      console.log('❌ 新闻自动化测试失败:', error.message);
    }
  }

  /**
   * 测试视频自动化系统
   */
  async testVideoAutomation() {
    console.log('🎥 测试视频自动化系统...');
    const testName = 'Video Automation';
    
    try {
      const videoUpdater = new AutomatedVideoUpdater();
      
      // 测试视频更新
      const updateResult = await videoUpdater.updateVideos();
      
      // 获取状态
      const status = videoUpdater.getStatus();
      
      // 验证数据文件是否存在
      const dataPath = path.join(__dirname, '../data/videos.json');
      const dataExists = await this.fileExists(dataPath);
      
      let videoData = null;
      if (dataExists) {
        const rawData = await fs.readFile(dataPath, 'utf8');
        videoData = JSON.parse(rawData);
      }
      
      const success = updateResult && status && dataExists && videoData;
      
      this.addTestResult(testName, success, {
        updateResult: !!updateResult,
        updateSuccess: updateResult?.success,
        status: !!status,
        dataExists,
        videosCount: videoData?.statistics?.total || 0
      });
      
      console.log(success ? '✅ 视频自动化测试通过' : '❌ 视频自动化测试失败');
      
      // 停止调度器
      videoUpdater.stop();
      
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
      console.log('❌ 视频自动化测试失败:', error.message);
    }
  }

  /**
   * 测试系统集成
   */
  async testSystemIntegration() {
    console.log('🔗 测试系统集成...');
    const testName = 'System Integration';
    
    try {
      // 同时启动新闻和视频系统
      const newsUpdater = new AutomatedNewsUpdater();
      const videoUpdater = new AutomatedVideoUpdater();
      
      // 并行执行更新
      const [newsResult, videoResult] = await Promise.all([
        newsUpdater.triggerUpdate(),
        videoUpdater.triggerUpdate()
      ]);
      
      // 检查数据一致性
      const newsData = await this.loadJsonFile('../data/news.json');
      const videoData = await this.loadJsonFile('../data/videos.json');
      
      const success = newsResult && videoResult && newsData && videoData;
      
      this.addTestResult(testName, success, {
        newsUpdate: !!newsResult,
        videoUpdate: !!videoResult,
        newsDataValid: !!newsData,
        videoDataValid: !!videoData,
        newsCount: newsData?.articles?.length || 0,
        videoCount: videoData?.statistics?.total || 0
      });
      
      console.log(success ? '✅ 系统集成测试通过' : '❌ 系统集成测试失败');
      
      // 清理
      newsUpdater.stop();
      videoUpdater.stop();
      
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
      console.log('❌ 系统集成测试失败:', error.message);
    }
  }

  /**
   * 测试错误处理
   */
  async testErrorHandling() {
    console.log('🛡️ 测试错误处理...');
    const testName = 'Error Handling';
    
    try {
      const scheduler = new TaskScheduler();
      
      // 添加会失败的任务
      scheduler.addTask('failing-task', '*/5 * * * * *', () => {
        throw new Error('Intentional test error');
      });
      
      // 执行失败的任务
      let errorCaught = false;
      try {
        await scheduler.executeTask('failing-task');
      } catch (error) {
        errorCaught = true;
      }
      
      // 检查任务历史
      const history = scheduler.getHistory(10);
      const failedTask = history.find(h => h.taskName === 'failing-task' && !h.success);
      
      const success = errorCaught && failedTask;
      
      this.addTestResult(testName, success, {
        errorCaught,
        failedTaskInHistory: !!failedTask,
        historyCount: history.length
      });
      
      console.log(success ? '✅ 错误处理测试通过' : '❌ 错误处理测试失败');
      
      // 清理
      scheduler.removeTask('failing-task');
      
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
      console.log('❌ 错误处理测试失败:', error.message);
    }
  }

  /**
   * 测试性能
   */
  async testPerformance() {
    console.log('⚡ 测试系统性能...');
    const testName = 'Performance';
    
    try {
      const startTime = Date.now();
      
      // 测试翻译服务性能
      const translationService = new TranslationService();
      const translationStart = Date.now();
      await translationService.translateText('Test performance', 'zh', 'en');
      const translationTime = Date.now() - translationStart;
      
      // 测试数据加载性能
      const dataLoadStart = Date.now();
      const newsData = await this.loadJsonFile('../data/news.json');
      const videoData = await this.loadJsonFile('../data/videos.json');
      const dataLoadTime = Date.now() - dataLoadStart;
      
      const totalTime = Date.now() - startTime;
      
      // 性能阈值
      const success = translationTime < 5000 && // 翻译应在5秒内完成
                     dataLoadTime < 1000 &&    // 数据加载应在1秒内完成
                     totalTime < 10000;        // 总时间应在10秒内完成
      
      this.addTestResult(testName, success, {
        translationTime: `${translationTime}ms`,
        dataLoadTime: `${dataLoadTime}ms`,
        totalTime: `${totalTime}ms`,
        newsDataSize: newsData ? JSON.stringify(newsData).length : 0,
        videoDataSize: videoData ? JSON.stringify(videoData).length : 0
      });
      
      console.log(success ? '✅ 性能测试通过' : '❌ 性能测试失败');
      
    } catch (error) {
      this.addTestResult(testName, false, { error: error.message });
      console.log('❌ 性能测试失败:', error.message);
    }
  }

  /**
   * 添加测试结果
   */
  addTestResult(testName, success, details = {}) {
    this.testResults.push({
      testName,
      success,
      details,
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime
    });
  }

  /**
   * 生成测试报告
   */
  async generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
    const totalDuration = Date.now() - this.startTime;

    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: `${successRate}%`,
        totalDuration: `${totalDuration}ms`,
        timestamp: new Date().toISOString()
      },
      results: this.testResults,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage()
      }
    };

    // 保存报告到文件
    const reportPath = path.join(__dirname, '../logs/integration-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // 输出控制台报告
    console.log('\n📊 集成测试报告');
    console.log('='.repeat(50));
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`成功率: ${successRate}%`);
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`报告已保存: ${reportPath}`);

    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      this.testResults.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.testName}: ${result.details.error || 'Unknown error'}`);
      });
    }

    console.log('\n🎉 集成测试完成!');
    
    return report;
  }

  /**
   * 确保日志目录存在
   */
  async ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    await fs.mkdir(logDir, { recursive: true });
  }

  /**
   * 记录错误
   */
  async logError(message, error) {
    const logEntry = `[${new Date().toISOString()}] ERROR: ${message}\n${error.stack}\n\n`;
    try {
      await fs.appendFile(this.logFile, logEntry);
    } catch (err) {
      console.error('写入日志失败:', err.message);
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 加载JSON文件
   */
  async loadJsonFile(relativePath) {
    try {
      const filePath = path.join(__dirname, relativePath);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }
}

// 如果直接运行此脚本，执行测试
if (require.main === module) {
  const test = new SystemIntegrationTest();
  test.runFullTest().catch(console.error);
}

module.exports = SystemIntegrationTest;