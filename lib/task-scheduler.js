const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

/**
 * 任务调度器
 * 管理定时任务的创建、执行和监控
 */
class TaskScheduler {
  constructor() {
    this.tasks = new Map();
    this.taskHistory = [];
    this.isRunning = false;
    this.logFile = path.join(__dirname, '../logs/scheduler.log');
    
    // 确保志目录存在
    this.ensureLogDirectory();
  }

  /**
   * 确保志目录存在
   */
  async ensureLogDirectory() {
    try {
      const logDir = path.dirname(this.logFile);
      await fs.mkdir(logDir, { recursive: true });
    } catch (error) {
      console.error('创建志目录失败:', error.message);
    }
  }

  /**
   * 添加定时任务
   * @param {string} name - 任务名称
   * @param {string} schedule - cron表达式
   * @param {Function} task - 要执行的任务函数
   * @param {Object} options - 任务选项
   */
  addTask(name, schedule, task, options = {}) {
    if (this.tasks.has(name)) {
      console.warn(`任务 ${name} 已存在，将被覆盖`);
      this.removeTask(name);
    }

    const taskConfig = {
      name,
      schedule,
      task,
      options: {
        timezone: 'Asia/Shanghai',
        scheduled: true,
        ...options
      },
      cronJob: null,
      lastRun: null,
      nextRun: null,
      runCount: 0,
      errorCount: 0,
      isRunning: false
    };

    // 创建cron任务
    taskConfig.cronJob = cron.schedule(schedule, async () => {
      await this.executeTask(name);
    }, {
      ...taskConfig.options,
      scheduled: false // 先不启动，等待手动启动
    });

    this.tasks.set(name, taskConfig);
    this.log(`任务 ${name} 已添加，调度: ${schedule}`);
    
    return taskConfig;
  }

  /**
   * 启动任务
   * @param {string} name - 任务名称
   */
  startTask(name) {
    const taskConfig = this.tasks.get(name);
    if (!taskConfig) {
      throw new Error(`任务 ${name} 不存在`);
    }

    if (taskConfig.cronJob) {
      taskConfig.cronJob.start();
      taskConfig.nextRun = this.getNextRunTime(taskConfig.schedule);
      this.log(`任务 ${name} 已启动`);
    }
  }

  /**
   * 停止任务
   * @param {string} name - 任务名称
   */
  stopTask(name) {
    const taskConfig = this.tasks.get(name);
    if (!taskConfig) {
      throw new Error(`任务 ${name} 不存在`);
    }

    if (taskConfig.cronJob) {
      taskConfig.cronJob.stop();
      taskConfig.nextRun = null;
      this.log(`任务 ${name} 已停止`);
    }
  }

  /**
   * 移除任务
   * @param {string} name - 任务名称
   */
  removeTask(name) {
    const taskConfig = this.tasks.get(name);
    if (taskConfig && taskConfig.cronJob) {
      taskConfig.cronJob.destroy();
    }
    
    this.tasks.delete(name);
    this.log(`任务 ${name} 已移除`);
  }

  /**
   * 手动执行任务
   * @param {string} name - 任务名称
   */
  async executeTask(name) {
    const taskConfig = this.tasks.get(name);
    if (!taskConfig) {
      throw new Error(`任务 ${name} 不存在`);
    }

    if (taskConfig.isRunning) {
      this.log(`任务 ${name} 正在运行中，跳过此次执行`);
      return;
    }

    const startTime = Date.now();
    taskConfig.isRunning = true;
    taskConfig.lastRun = new Date().toISOString();

    try {
      this.log(`开始执行任务: ${name}`);
      
      // 执行任务
      const result = await taskConfig.task();
      
      const duration = Date.now() - startTime;
      taskConfig.runCount++;
      taskConfig.isRunning = false;
      
      // 记录执行历史
      const historyEntry = {
        taskName: name,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        duration,
        success: true,
        result: result || 'completed'
      };
      
      this.taskHistory.push(historyEntry);
      this.log(`任务 ${name} 执行成功，耗时: ${duration}ms`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      taskConfig.errorCount++;
      taskConfig.isRunning = false;
      
      // 记录错误历史
      const historyEntry = {
        taskName: name,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        duration,
        success: false,
        error: error.message
      };
      
      this.taskHistory.push(historyEntry);
      this.log(`任务 ${name} 执行失败: ${error.message}`);
      
      throw error;
    }
  }

  /**
   * 启动调度器
   */
  start() {
    if (this.isRunning) {
      console.log('调度器已在运行中');
      return;
    }

    this.isRunning = true;
    
    // 启动所有任务
    for (const [name, taskConfig] of this.tasks) {
      if (taskConfig.options.scheduled) {
        this.startTask(name);
      }
    }

    this.log('任务调度器已启动');
    console.log(`任务调度器已启动，管理 ${this.tasks.size} 个任务`);
  }

  /**
   * 停止调度器
   */
  stop() {
    if (!this.isRunning) {
      console.log('调度器未运行');
      return;
    }

    // 停止所有任务
    for (const [name] of this.tasks) {
      this.stopTask(name);
    }

    this.isRunning = false;
    this.log('任务调度器已停止');
    console.log('任务调度器已停止');
  }

  /**
   * 获取任务状态
   * @param {string} name - 任务名称，如果不提供则返回所有任务状态
   */
  getTaskStatus(name = null) {
    if (name) {
      const taskConfig = this.tasks.get(name);
      if (!taskConfig) {
        return null;
      }
      
      return {
        name: taskConfig.name,
        schedule: taskConfig.schedule,
        isRunning: taskConfig.isRunning,
        lastRun: taskConfig.lastRun,
        nextRun: taskConfig.nextRun,
        runCount: taskConfig.runCount,
        errorCount: taskConfig.errorCount,
        isScheduled: taskConfig.cronJob ? taskConfig.cronJob.running : false
      };
    }

    // 返回所有任务状态
    const allStatus = {};
    for (const [taskName, taskConfig] of this.tasks) {
      allStatus[taskName] = this.getTaskStatus(taskName);
    }
    
    return allStatus;
  }

  /**
   * 获取执行历史
   * @param {number} limit - 限制返回的记录数
   */
  getHistory(limit = 50) {
    return this.taskHistory
      .slice(-limit)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }

  /**
   * 获取下次运行MIN
   * @param {string} schedule - cron表达式
   */
  getNextRunTime(schedule) {
    try {
      // 这里简化处理，实际应该解析cron表达式
      const now = new Date();
      const next = new Date(now.getTime() + 60 * 60 * 1000); // 简单地加1小时
      return next.toISOString();
    } catch (error) {
      return null;
    }
  }

  /**
   * 记录志
   * @param {string} message - 志消息
   */
  async log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    try {
      await fs.appendFile(this.logFile, logEntry);
    } catch (error) {
      console.error('写入志失败:', error.message);
    }
    
    console.log(`[Scheduler] ${message}`);
  }

  /**
   * 清理历史记录
   * @param {number} maxAge - 最大保留天数
   */
  cleanupHistory(maxAge = 30) {
    const cutoffTime = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000);
    
    this.taskHistory = this.taskHistory.filter(entry => 
      new Date(entry.startTime) > cutoffTime
    );
    
    this.log(`历史记录清理完成，保留 ${this.taskHistory.length} 条记录`);
  }

  /**
   * 获取调度器统计信息
   */
  getStats() {
    const totalTasks = this.tasks.size;
    const runningTasks = Array.from(this.tasks.values()).filter(t => t.isRunning).length;
    const scheduledTasks = Array.from(this.tasks.values()).filter(t => 
      t.cronJob && t.cronJob.running
    ).length;
    
    const recentHistory = this.getHistory(100);
    const successfulRuns = recentHistory.filter(h => h.success).length;
    const failedRuns = recentHistory.filter(h => !h.success).length;
    
    return {
      scheduler: {
        isRunning: this.isRunning,
        totalTasks,
        runningTasks,
        scheduledTasks
      },
      execution: {
        totalRuns: recentHistory.length,
        successfulRuns,
        failedRuns,
        successRate: recentHistory.length > 0 ? 
          (successfulRuns / recentHistory.length * 100).toFixed(2) + '%' : '0%'
      },
      history: {
        totalEntries: this.taskHistory.length,
        oldestEntry: this.taskHistory.length > 0 ? this.taskHistory[0].startTime : null,
        newestEntry: this.taskHistory.length > 0 ? 
          this.taskHistory[this.taskHistory.length - 1].startTime : null
      }
    };
  }
}

module.exports = TaskScheduler;