/**
 * 第一阶段完整更新脚本
 * 一键执行所有关键信息更新
 */

const { updatePlayerInfo, updateStatsInfo, generateUpdateReport } = require('./research-yang-hansen-current-info');
const { updateNewsData, createUpdateChecklist } = require('./simple-news-aggregator');
const fs = require('fs').promises;
const path = require('path');

/**
 * 验证更新结果
 */
async function validateUpdates() {
  console.log('验证更新结果...');
  
  const validationResults = {
    playerInfo: false,
    statsData: false,
    newsData: false,
    checklist: false,
    errors: []
  };

  try {
    // 验证球员信息
    const playerPath = path.join(__dirname, '../data/player.json');
    const playerData = JSON.parse(await fs.readFile(playerPath, 'utf8'));
    
    if (playerData.basicInfo.team === 'Indiana Pacers' && 
        playerData.careerTimeline.some(item => item.event.includes('步行者队'))) {
      validationResults.playerInfo = true;
    } else {
      validationResults.errors.push('球员信息更新不完整');
    }

    // 验证统计数据
    const statsPath = path.join(__dirname, '../data/stats.json');
    const statsData = JSON.parse(await fs.readFile(statsPath, 'utf8'));
    
    if (statsData.currentSeason.season === '2024-25 NBA常规赛' &&
        statsData.currentSeason.team === 'Indiana Pacers') {
      validationResults.statsData = true;
    } else {
      validationResults.errors.push('统计数据更新不完整');
    }

    // 验证新闻数据
    const newsPath = path.join(__dirname, '../data/news.json');
    const newsData = JSON.parse(await fs.readFile(newsPath, 'utf8'));
    
    if (newsData.featured && newsData.articles.length > 0) {
      validationResults.newsData = true;
    } else {
      validationResults.errors.push('新闻数据更新失败');
    }

    // 验证检查清单
    const checklistPath = path.join(__dirname, '../data/content-update-checklist.json');
    try {
      await fs.access(checklistPath);
      validationResults.checklist = true;
    } catch {
      validationResults.errors.push('检查清单创建失败');
    }

  } catch (error) {
    validationResults.errors.push(`验证过程出错: ${error.message}`);
  }

  return validationResults;
}

/**
 * 生成网站预览链接和说明
 */
function generatePreviewGuide() {
  return {
    title: "第一阶段更新完成 - 预览指南",
    
    updatedPages: [
      {
        page: "首页 (/)",
        changes: [
          "球队信息从 'NBA Draft Prospect' 更新为 'Indiana Pacers'",
          "个人简介更新为反映NBA球员身份",
          "统计数据标题更新为 '2024-25 NBA常规赛'"
        ],
        previewUrl: "http://localhost:3000/"
      },
      {
        page: "个人档案页 (/about)",
        changes: [
          "职业生涯时间线添加2024年选秀和签约信息",
          "个人故事更新为NBA征程",
          "基本信息中的球队和状态更新"
        ],
        previewUrl: "http://localhost:3000/about"
      },
      {
        page: "数据统计页 (/stats)",
        changes: [
          "当前赛季更新为2024-25 NBA常规赛",
          "球队信息更新为印第安纳步行者队",
          "里程碑添加NBA选秀和签约记录"
        ],
        previewUrl: "http://localhost:3000/stats"
      },
      {
        page: "新闻动态页 (/news)",
        changes: [
          "头条新闻更新为NBA首秀相关内容",
          "新闻列表包含选秀、训练营等最新动态",
          "热门话题更新为NBA相关关键词"
        ],
        previewUrl: "http://localhost:3000/news"
      }
    ],
    
    verificationSteps: [
      "运行 `npm run dev` 启动开发服务器",
      "访问 http://localhost:3000 查看首页更新",
      "检查个人档案页的时间线是否包含2024年NBA信息",
      "确认统计页面显示的是步行者队信息",
      "查看新闻页面是否有NBA相关内容"
    ],
    
    nextPhasePreparation: [
      "监控步行者队官方网站获取最新消息",
      "关注NBA官方统计数据的更新",
      "收集杨瀚森的实际比赛数据",
      "准备第二阶段的自动化数据集成"
    ]
  };
}

/**
 * 创建维护文档
 */
async function createMaintenanceDoc() {
  const maintenanceDoc = {
    title: "杨瀚森网站维护指南 - 第一阶段",
    lastUpdated: new Date().toISOString(),
    
    dailyTasks: [
      {
        task: "检查步行者队新闻",
        description: "访问 https://www.nba.com/pacers/ 查看是否有杨瀚森相关新闻",
        timeRequired: "5分钟",
        priority: "高"
      },
      {
        task: "更新比赛数据",
        description: "如果杨瀚森参加了比赛，手动更新 data/stats.json 中的数据",
        timeRequired: "10分钟",
        priority: "高"
      }
    ],
    
    weeklyTasks: [
      {
        task: "内容质量检查",
        description: "检查网站所有页面的信息是否准确和最新",
        timeRequired: "30分钟",
        priority: "中"
      },
      {
        task: "新闻内容更新",
        description: "手动添加一周内的重要新闻到 data/news.json",
        timeRequired: "20分钟",
        priority: "中"
      }
    ],
    
    emergencyProcedures: [
      {
        scenario: "重大新闻或交易",
        steps: [
          "立即更新 data/player.json 中的相关信息",
          "在 data/news.json 中添加紧急新闻",
          "更新职业生涯时间线",
          "重新部署网站"
        ]
      },
      {
        scenario: "数据错误发现",
        steps: [
          "确认错误信息的准确性",
          "更新相应的JSON文件",
          "检查其他相关页面是否需要更新",
          "记录错误原因以避免重复"
        ]
      }
    ],
    
    fileLocations: {
      "球员基本信息": "data/player.json",
      "统计数据": "data/stats.json", 
      "新闻内容": "data/news.json",
      "更新检查清单": "data/content-update-checklist.json",
      "更新报告": "data/update-report.json"
    },
    
    troubleshooting: [
      {
        problem: "网站显示旧信息",
        solution: "检查JSON文件是否正确更新，重启开发服务器"
      },
      {
        problem: "新闻页面显示错误",
        solution: "验证 data/news.json 格式是否正确"
      },
      {
        problem: "统计数据不显示",
        solution: "检查 data/stats.json 中的数据格式和字段名"
      }
    ]
  };

  const docPath = path.join(__dirname, '../docs/maintenance-guide-phase1.md');
  
  // 创建docs目录（如果不存在）
  await fs.mkdir(path.dirname(docPath), { recursive: true });
  
  // 转换为Markdown格式
  let markdownContent = `# ${maintenanceDoc.title}\n\n`;
  markdownContent += `最后更新: ${maintenanceDoc.lastUpdated}\n\n`;
  
  markdownContent += `## 日常维护任务\n\n`;
  maintenanceDoc.dailyTasks.forEach(task => {
    markdownContent += `### ${task.task}\n`;
    markdownContent += `- **描述**: ${task.description}\n`;
    markdownContent += `- **所需时间**: ${task.timeRequired}\n`;
    markdownContent += `- **优先级**: ${task.priority}\n\n`;
  });
  
  markdownContent += `## 每周维护任务\n\n`;
  maintenanceDoc.weeklyTasks.forEach(task => {
    markdownContent += `### ${task.task}\n`;
    markdownContent += `- **描述**: ${task.description}\n`;
    markdownContent += `- **所需时间**: ${task.timeRequired}\n`;
    markdownContent += `- **优先级**: ${task.priority}\n\n`;
  });
  
  markdownContent += `## 紧急处理程序\n\n`;
  maintenanceDoc.emergencyProcedures.forEach(proc => {
    markdownContent += `### ${proc.scenario}\n`;
    proc.steps.forEach((step, index) => {
      markdownContent += `${index + 1}. ${step}\n`;
    });
    markdownContent += `\n`;
  });
  
  markdownContent += `## 重要文件位置\n\n`;
  Object.entries(maintenanceDoc.fileLocations).forEach(([key, value]) => {
    markdownContent += `- **${key}**: \`${value}\`\n`;
  });
  
  markdownContent += `\n## 故障排除\n\n`;
  maintenanceDoc.troubleshooting.forEach(item => {
    markdownContent += `### ${item.problem}\n`;
    markdownContent += `${item.solution}\n\n`;
  });

  await fs.writeFile(docPath, markdownContent, 'utf8');
  console.log('✓ 维护文档已创建');
  
  return maintenanceDoc;
}

/**
 * 主执行函数
 */
async function main() {
  console.log('=== 第一阶段完整更新开始 ===\n');
  
  const startTime = Date.now();
  const results = {
    success: false,
    steps: {},
    validation: null,
    duration: 0,
    errors: []
  };

  try {
    // 步骤1: 更新球员信息
    console.log('1. 更新球员基本信息...');
    const playerData = await updatePlayerInfo();
    results.steps.playerInfo = { success: true, data: playerData };
    
    // 步骤2: 更新统计数据
    console.log('2. 更新统计数据...');
    const statsData = await updateStatsInfo();
    results.steps.statsData = { success: true, data: statsData };
    
    // 步骤3: 更新新闻数据
    console.log('3. 更新新闻数据...');
    const newsData = await updateNewsData();
    results.steps.newsData = { success: true, data: newsData };
    
    // 步骤4: 创建检查清单
    console.log('4. 创建内容更新检查清单...');
    const checklist = await createUpdateChecklist();
    results.steps.checklist = { success: true, data: checklist };
    
    // 步骤5: 生成更新报告
    console.log('5. 生成更新报告...');
    const report = await generateUpdateReport(playerData, statsData);
    results.steps.report = { success: true, data: report };
    
    // 步骤6: 创建维护文档
    console.log('6. 创建维护文档...');
    const maintenanceDoc = await createMaintenanceDoc();
    results.steps.maintenanceDoc = { success: true, data: maintenanceDoc };
    
    // 步骤7: 验证更新结果
    console.log('7. 验证更新结果...');
    const validation = await validateUpdates();
    results.validation = validation;
    
    // 计算执行时间
    results.duration = Date.now() - startTime;
    results.success = validation.errors.length === 0;
    
    // 显示结果
    console.log('\n=== 第一阶段更新完成 ===');
    console.log(`执行时间: ${results.duration}ms`);
    
    if (results.success) {
      console.log('✅ 所有更新成功完成！');
      
      // 显示预览指南
      const previewGuide = generatePreviewGuide();
      console.log('\n📋 预览指南:');
      previewGuide.verificationSteps.forEach((step, index) => {
        console.log(`${index + 1}. ${step}`);
      });
      
      console.log('\n📁 已创建的文件:');
      console.log('- data/player.json (更新的球员信息)');
      console.log('- data/stats.json (更新的统计数据)');
      console.log('- data/news.json (更新的新闻内容)');
      console.log('- data/content-update-checklist.json (内容更新检查清单)');
      console.log('- data/update-report.json (更新报告)');
      console.log('- docs/maintenance-guide-phase1.md (维护指南)');
      
      console.log('\n🚀 下一步:');
      console.log('1. 运行 `npm run dev` 查看更新效果');
      console.log('2. 按照维护指南定期更新内容');
      console.log('3. 准备第二阶段的自动化功能');
      
    } else {
      console.log('❌ 更新过程中发现问题:');
      validation.errors.forEach(error => {
        console.log(`  • ${error}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    results.errors.push(error.message);
    results.success = false;
    return results;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().then(results => {
    process.exit(results.success ? 0 : 1);
  });
}

module.exports = {
  main,
  validateUpdates,
  generatePreviewGuide,
  createMaintenanceDoc
};