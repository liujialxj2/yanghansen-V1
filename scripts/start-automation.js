const AutomatedNewsUpdater = require('../lib/automated-news-updater');
const AutomatedVideoUpdater = require('../lib/automated-video-updater');
const SystemIntegrationTest = require('./system-integration-test');
const fs = require('fs').promises;
const path = require('path');

/**
 * 自动化系统启动器
 * 统一管理新闻和视频自动化系统的启动和监控
 */
class AutomationManager {
  constructor() {
    this.newsUpdater = null;
    this.videoUpdater = null;
    this.isRunning = false;
    this.startTime = null;
    this.statusFile = path.join(__dirname, '../logs/automation-status.json');
    
    // 绑定信号处理
    this.setupSignalHandlers();
  }

  /**
   * 启动所有自动化系统
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️ 自动化系统已在运行中');
      return;
    }

    console.log('🚀 启动Yang Hansen网站自动化系统...\n');
    this.startTime = new Date();

    try {
      // 1. 运行系统检查
      await this.runSystemCheck();

      // 2. 初始化系统
      await this.initializeSystems();

      // 3. 启动新闻自动化
      await this.startNewsAutomation();

      // 4. 启动视频自动化
      await this.startVideoAutomation();

      // 5. 运行初始更新
      await this.runInitialUpdate();

      // 6. 启动监控
      this.startMonitoring();

      this.isRunning = true;
      console.log('✅ 所有自动化系统启动成功!\n');
      
      // 显示状态信息
      await this.displayStatus();

    } catch (error) {
      console.error('❌ 启动自动化系统失败:', error.message);
      await this.stop();
      throw error;
    }
  }

  /**
   * 停止所有自动化系统
   */
  async stop() {
    if (!this.isRunning) {
      console.log('⚠️ 自动化系统未运行');
      return;
    }

    console.log('🛑 停止自动化系统...');

    try {
      if (this.newsUpdater) {
        this.newsUpdater.stop();
        console.log('✅ 新闻自动化系统已停止');
      }

      if (this.videoUpdater) {
        this.videoUpdater.stop();
        console.log('✅ 视频自动化系统已停止');
      }

      // 清理监控
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }

      this.isRunning = false;
      console.log('✅ 所有自动化系统已停止');

    } catch (error) {
      console.error('❌ 停止系统时出错:', error.message);
    }
  }

  /**
   * 运行系统检查
   */
  async runSystemCheck() {
    console.log('🔍 运行系统检查...');

    // 检查必要的目录
    const requiredDirs = [
      path.join(__dirname, '../data'),
      path.join(__dirname, '../logs'),
      path.join(__dirname, '../data/backups')
    ];

    for (const dir of requiredDirs) {
      await fs.mkdir(dir, { recursive: true });
    }

    // 检查环境变量
    const requiredEnvVars = ['NEWSAPI_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('⚠️ 缺少环境变量:', missingVars.join(', '));
      console.log('💡 某些功能可能受限，但系统仍可运行');
    }

    console.log('✅ 系统检查完成');
  }

  /**
   * 初始化系统
   */
  async initializeSystems() {
    console.log('⚙️ 初始化自动化系统...');

    try {
      this.newsUpdater = new AutomatedNewsUpdater();
      this.videoUpdater = new AutomatedVideoUpdater();
      
      console.log('✅ 系统初始化完成');
    } catch (error) {
      console.error('❌ 系统初始化失败:', error.message);
      throw error;
    }
  }

  /**
   * 启动新闻自动化
   */
  async startNewsAutomation() {
    console.log('📰 启动新闻自动化系统...');
    
    try {
      this.newsUpdater.start();
      console.log('✅ 新闻自动化系统启动成功');
    } catch (error) {
      console.error('❌ 新闻自动化启动失败:', error.message);
      throw error;
    }
  }

  /**
   * 启动视频自动化
   */
  async startVideoAutomation() {
    console.log('🎥 启动视频自动化系统...');
    
    try {
      this.videoUpdater.start();
      console.log('✅ 视频自动化系统启动成功');
    } catch (error) {
      console.error('❌ 视频自动化启动失败:', error.message);
      throw error;
    }
  }

  /**
   * 运行初始更新
   */
  async runInitialUpdate() {
    console.log('🔄 运行初始数据更新...');

    try {
      // 并行执行初始更新
      const [newsResult, videoResult] = await Promise.allSettled([
        this.newsUpdater.triggerUpdate(),
        this.videoUpdater.triggerUpdate()
      ]);

      // 检查结果
      if (newsResult.status === 'fulfilled') {
        console.log('✅ 新闻初始更新完成');
      } else {
        console.warn('⚠️ 新闻初始更新失败:', newsResult.reason?.message);
      }

      if (videoResult.status === 'fulfilled') {
        console.log('✅ 视频初始更新完成');
      } else {
        console.warn('⚠️ 视频初始更新失败:', videoResult.reason?.message);
      }

    } catch (error) {
      console.warn('⚠️ 初始更新过程中出现问题:', error.message);
      // 不抛出错误，允许系统继续运行
    }
  }

  /**
   * 启动监控
   */
  startMonitoring() {
    console.log('📊 启动系统监控...');

    // 每5分钟更新一次状态
    this.monitoringInterval = setInterval(async () => {
      await this.updateStatus();
    }, 5 * 60 * 1000);

    console.log('✅ 系统监控已启动');
  }

  /**
   * 更新状态
   */
  async updateStatus() {
    try {
      const status = {
        isRunning: this.isRunning,
        startTime: this.startTime?.toISOString(),
        uptime: this.isRunning ? Date.now() - this.startTime.getTime() : 0,
        lastUpdate: new Date().toISOString(),
        news: this.newsUpdater ? this.newsUpdater.getStatus() : null,
        video: this.videoUpdater ? this.videoUpdater.getStatus() : null,
        system: {
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          platform: process.platform,
          nodeVersion: process.version
        }
      };

      await fs.writeFile(this.statusFile, JSON.stringify(status, null, 2));
    } catch (error) {
      console.error('更新状态失败:', error.message);
    }
  }

  /**
   * 显示状态
   */
  async displayStatus() {
    console.log('📊 系统状态信息');
    console.log('='.repeat(50));
    
    if (this.newsUpdater) {
      const newsStatus = this.newsUpdater.getStatus();
      console.log('📰 新闻系统:');
      console.log(`   更新次数: ${newsStatus.updateCount}`);
      console.log(`   最后更新: ${newsStatus.lastUpdateTime || '未更新'}`);
      console.log(`   运行状态: ${newsStatus.isUpdating ? '更新中' : '待机'}`);
    }

    if (this.videoUpdater) {
      const videoStatus = this.videoUpdater.getStatus();
      console.log('🎥 视频系统:');
      console.log(`   更新次数: ${videoStatus.updateCount}`);
      console.log(`   最后更新: ${videoStatus.lastUpdateTime || '未更新'}`);
      console.log(`   运行状态: ${videoStatus.isUpdating ? '更新中' : '待机'}`);
    }

    console.log(`🕐 启动时间: ${this.startTime?.toLocaleString()}`);
    console.log(`📁 状态文件: ${this.statusFile}`);
    console.log('='.repeat(50));
  }

  /**
   * 设置信号处理
   */
  setupSignalHandlers() {
    // 优雅关闭
    const gracefulShutdown = async (signal) => {
      console.log(`\n收到 ${signal} 信号，正在优雅关闭...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    // 处理未捕获的异常
    process.on('uncaughtException', async (error) => {
      console.error('未捕获的异常:', error);
      await this.stop();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('未处理的Promise拒绝:', reason);
      await this.stop();
      process.exit(1);
    });
  }

  /**
   * 运行集成测试
   */
  async runIntegrationTest() {
    console.log('🧪 运行集成测试...');
    
    try {
      const test = new SystemIntegrationTest();
      const report = await test.runFullTest();
      
      console.log('✅ 集成测试完成');
      return report;
    } catch (error) {
      console.error('❌ 集成测试失败:', error.message);
      throw error;
    }
  }

  /**
   * 手动触发更新
   */
  async triggerManualUpdate() {
    if (!this.isRunning) {
      throw new Error('自动化系统未运行');
    }

    console.log('🔄 手动触发更新...');

    const results = await Promise.allSettled([
      this.newsUpdater.triggerUpdate(),
      this.videoUpdater.triggerUpdate()
    ]);

    return {
      news: results[0].status === 'fulfilled' ? results[0].value : results[0].reason,
      video: results[1].status === 'fulfilled' ? results[1].value : results[1].reason
    };
  }

  /**
   * 获取系统状态
   */
  async getStatus() {
    try {
      const statusData = await fs.readFile(this.statusFile, 'utf8');
      return JSON.parse(statusData);
    } catch (error) {
      return {
        isRunning: this.isRunning,
        error: 'Status file not found'
      };
    }
  }
}

// 命令行接口
async function main() {
  const manager = new AutomationManager();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      await manager.start();
      break;
      
    case 'stop':
      await manager.stop();
      break;
      
    case 'status':
      const status = await manager.getStatus();
      console.log(JSON.stringify(status, null, 2));
      break;
      
    case 'test':
      await manager.runIntegrationTest();
      break;
      
    case 'update':
      await manager.start();
      const updateResult = await manager.triggerManualUpdate();
      console.log('更新结果:', updateResult);
      await manager.stop();
      break;
      
    default:
      console.log('使用方法:');
      console.log('  node start-automation.js start   - 启动自动化系统');
      console.log('  node start-automation.js stop    - 停止自动化系统');
      console.log('  node start-automation.js status  - 查看系统状态');
      console.log('  node start-automation.js test    - 运行集成测试');
      console.log('  node start-automation.js update  - 手动触发更新');
      break;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = AutomationManager;