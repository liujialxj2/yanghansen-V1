/**
 * 验证第一阶段更新效果
 * 检查网站页面是否正确显示更新后的信息
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 验证数据文件内容
 */
async function verifyDataFiles() {
  console.log('验证数据文件内容...\n');
  
  const results = {
    playerInfo: { passed: false, issues: [] },
    statsData: { passed: false, issues: [] },
    newsData: { passed: false, issues: [] }
  };

  try {
    // 验证球员信息
    const playerData = JSON.parse(await fs.readFile('data/player.json', 'utf8'));
    
    if (playerData.basicInfo.team === 'Indiana Pacers') {
      console.log('✅ 球队信息已更新为 Indiana Pacers');
    } else {
      results.playerInfo.issues.push('球队信息未正确更新');
    }
    
    if (playerData.basicInfo.experience === 'NBA Rookie') {
      console.log('✅ 职业状态已更新为 NBA Rookie');
    } else {
      results.playerInfo.issues.push('职业状态未正确更新');
    }
    
    if (playerData.careerTimeline.some(item => item.event.includes('步行者队'))) {
      console.log('✅ 职业生涯时间线包含NBA信息');
    } else {
      results.playerInfo.issues.push('时间线缺少NBA信息');
    }
    
    if (playerData.nbaInfo && playerData.nbaInfo.draftInfo) {
      console.log('✅ NBA选秀信息已添加');
    } else {
      results.playerInfo.issues.push('缺少NBA选秀信息');
    }
    
    results.playerInfo.passed = results.playerInfo.issues.length === 0;

    // 验证统计数据
    const statsData = JSON.parse(await fs.readFile('data/stats.json', 'utf8'));
    
    if (statsData.currentSeason.season === '2024-25 NBA常规赛') {
      console.log('✅ 当前赛季已更新为2024-25 NBA常规赛');
    } else {
      results.statsData.issues.push('当前赛季信息未更新');
    }
    
    if (statsData.currentSeason.team === 'Indiana Pacers') {
      console.log('✅ 统计数据中的球队信息已更新');
    } else {
      results.statsData.issues.push('统计数据中球队信息未更新');
    }
    
    if (statsData.milestones.some(m => m.achievement.includes('步行者队'))) {
      console.log('✅ 里程碑包含NBA相关信息');
    } else {
      results.statsData.issues.push('里程碑缺少NBA信息');
    }
    
    results.statsData.passed = results.statsData.issues.length === 0;

    // 验证新闻数据
    const newsData = JSON.parse(await fs.readFile('data/news.json', 'utf8'));
    
    if (newsData.featured && newsData.featured.title.includes('步行者队')) {
      console.log('✅ 头条新闻包含NBA内容');
    } else {
      results.newsData.issues.push('头条新闻未更新');
    }
    
    if (newsData.articles.length > 0) {
      console.log('✅ 新闻文章列表已更新');
    } else {
      results.newsData.issues.push('新闻文章列表为空');
    }
    
    if (newsData.trending.includes('Indiana Pacers')) {
      console.log('✅ 热门话题包含NBA关键词');
    } else {
      results.newsData.issues.push('热门话题未包含NBA关键词');
    }
    
    results.newsData.passed = results.newsData.issues.length === 0;

  } catch (error) {
    console.error('❌ 验证过程出错:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, results };
}

/**
 * 生成页面预览检查清单
 */
function generatePageChecklist() {
  return {
    title: "页面预览检查清单",
    pages: [
      {
        url: "http://localhost:3000/",
        name: "首页",
        checkPoints: [
          "英雄区域显示 'Indiana Pacers' 而不是 'NBA Draft Prospect'",
          "个人简介提到NBA球员身份",
          "统计数据标题显示 '2024-25 NBA常规赛'",
          "球衣号码显示 'TBD'（待确定）"
        ]
      },
      {
        url: "http://localhost:3000/about",
        name: "个人档案页",
        checkPoints: [
          "基本信息中球队显示 'Indiana Pacers'",
          "职业生涯时间线包含2024年选秀信息",
          "职业生涯时间线包含签约步行者队信息",
          "个人故事提到NBA征程"
        ]
      },
      {
        url: "http://localhost:3000/stats",
        name: "数据统计页",
        checkPoints: [
          "当前赛季显示 '2024-25 NBA常规赛'",
          "球队信息显示 'Indiana Pacers'",
          "里程碑包含NBA选秀记录",
          "数据状态标注为新秀赛季"
        ]
      },
      {
        url: "http://localhost:3000/news",
        name: "新闻动态页",
        checkPoints: [
          "头条新闻标题包含步行者队信息",
          "新闻列表包含NBA相关内容",
          "热门话题包含 'Indiana Pacers'",
          "侧边栏统计数据来自步行者队"
        ]
      }
    ]
  };
}

/**
 * 创建测试报告
 */
async function createTestReport(verificationResults) {
  const checklist = generatePageChecklist();
  
  const report = {
    title: "第一阶段更新验证报告",
    timestamp: new Date().toISOString(),
    dataVerification: verificationResults,
    pageChecklist: checklist,
    summary: {
      dataFilesStatus: Object.values(verificationResults.results).every(r => r.passed) ? "通过" : "有问题",
      totalIssues: Object.values(verificationResults.results).reduce((sum, r) => sum + r.issues.length, 0),
      nextSteps: [
        "启动开发服务器: npm run dev",
        "逐一检查每个页面的显示效果",
        "确认所有信息都正确显示",
        "如有问题，检查对应的JSON数据文件"
      ]
    }
  };

  await fs.writeFile('data/phase1-verification-report.json', JSON.stringify(report, null, 2), 'utf8');
  
  return report;
}

/**
 * 主执行函数
 */
async function main() {
  console.log('=== 第一阶段更新验证 ===\n');
  
  try {
    // 验证数据文件
    const verificationResults = await verifyDataFiles();
    
    if (!verificationResults.success) {
      console.error('❌ 验证失败:', verificationResults.error);
      return;
    }

    // 创建测试报告
    const report = await createTestReport(verificationResults);
    
    console.log('\n=== 验证结果汇总 ===');
    console.log(`数据文件状态: ${report.summary.dataFilesStatus}`);
    console.log(`发现问题数量: ${report.summary.totalIssues}`);
    
    if (report.summary.totalIssues > 0) {
      console.log('\n❌ 发现的问题:');
      Object.entries(verificationResults.results).forEach(([key, result]) => {
        if (result.issues.length > 0) {
          console.log(`\n${key}:`);
          result.issues.forEach(issue => {
            console.log(`  • ${issue}`);
          });
        }
      });
    } else {
      console.log('\n🎉 所有数据文件验证通过！');
    }
    
    console.log('\n📋 下一步操作:');
    report.summary.nextSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });
    
    console.log('\n📄 页面检查清单已生成，请按以下步骤验证:');
    report.pageChecklist.pages.forEach(page => {
      console.log(`\n🔗 ${page.name} (${page.url}):`);
      page.checkPoints.forEach(point => {
        console.log(`  □ ${point}`);
      });
    });
    
    console.log('\n✅ 验证报告已保存到: data/phase1-verification-report.json');
    
  } catch (error) {
    console.error('❌ 验证过程失败:', error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  verifyDataFiles,
  generatePageChecklist,
  createTestReport
};