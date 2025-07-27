/**
 * 验证杨瀚森信息修正结果
 * 确保所有错误信息都已正确修正
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 验证基本信息修正
 */
async function verifyBasicInfo() {
  console.log('验证基本信息修正...');
  
  try {
    const playerData = JSON.parse(await fs.readFile('data/player.json', 'utf8'));
    const basicInfo = playerData.basicInfo;
    
    const checks = {
      birthDate: basicInfo.birthDate === '2005-06-26',
      birthPlace: basicInfo.birthPlace === '中国山东省淄博市',
      height: basicInfo.height === '7\'1" (2.16m)',
      weight: basicInfo.weight === '249 lbs (113kg)',
      age: basicInfo.age === 20,
      team: basicInfo.team === '波特兰开拓者',
      draftYear: basicInfo.draftInfo.year === 2025,
      draftRound: basicInfo.draftInfo.round === 1,
      draftPick: basicInfo.draftInfo.pick === 16,
      originalTeam: basicInfo.draftInfo.originalTeam === '孟菲斯灰熊'
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    
    console.log(`基本信息验证: ${passed}/${total} 项通过`);
    
    if (passed < total) {
      console.log('未通过的检查项:');
      Object.entries(checks).forEach(([key, passed]) => {
        if (!passed) {
          console.log(`  ❌ ${key}`);
        }
      });
    }
    
    return { passed: passed === total, details: checks };
  } catch (error) {
    console.error('验证基本信息失败:', error.message);
    return { passed: false, error: error.message };
  }
}

/**
 * 验证职业生涯信息
 */
async function verifyCareerInfo() {
  console.log('验证职业生涯信息...');
  
  try {
    const playerData = JSON.parse(await fs.readFile('data/player.json', 'utf8'));
    const statsData = JSON.parse(await fs.readFile('data/stats.json', 'utf8'));
    
    const checks = {
      hasQingdaoTraining: playerData.careerTimeline.some(item => 
        item.event.includes('青岛国信海天')),
      hasCBACareer: statsData.cbaCareer && statsData.cbaCareer.team === '青岛雄鹰',
      hasU19Achievement: statsData.nationalTeam && 
        statsData.nationalTeam.u19WorldCup2023.achievement === '最佳二阵',
      hasSummerLeagueData: statsData.nbaCareer && 
        statsData.nbaCareer.summerLeague.stats.points === 10,
      correctNBATeam: statsData.nbaCareer.team === '波特兰开拓者'
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    
    console.log(`职业生涯信息验证: ${passed}/${total} 项通过`);
    
    if (passed < total) {
      console.log('未通过的检查项:');
      Object.entries(checks).forEach(([key, passed]) => {
        if (!passed) {
          console.log(`  ❌ ${key}`);
        }
      });
    }
    
    return { passed: passed === total, details: checks };
  } catch (error) {
    console.error('验证职业生涯信息失败:', error.message);
    return { passed: false, error: error.message };
  }
}

/**
 * 验证新闻内容修正
 */
async function verifyNewsContent() {
  console.log('验证新闻内容修正...');
  
  try {
    const newsData = JSON.parse(await fs.readFile('data/news.json', 'utf8'));
    
    const checks = {
      correctTeamInTitle: newsData.featured.title.includes('开拓者'),
      correctHeightInSummary: newsData.featured.summary.includes('7尺1寸'),
      correctSummerLeagueStats: newsData.featured.content.includes('10分、4篮板、5助攻、3盖帽'),
      correctDraftInfo: newsData.featured.content.includes('第一轮第16顺位'),
      correctOriginalTeam: newsData.featured.content.includes('孟菲斯灰熊'),
      hasCBAMentions: newsData.featured.content.includes('CBA年度最佳新锐球员'),
      correctTrendingTopics: newsData.trending.includes('波特兰开拓者')
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    
    console.log(`新闻内容验证: ${passed}/${total} 项通过`);
    
    if (passed < total) {
      console.log('未通过的检查项:');
      Object.entries(checks).forEach(([key, passed]) => {
        if (!passed) {
          console.log(`  ❌ ${key}`);
        }
      });
    }
    
    return { passed: passed === total, details: checks };
  } catch (error) {
    console.error('验证新闻内容失败:', error.message);
    return { passed: false, error: error.message };
  }
}

/**
 * 生成验证报告
 */
async function generateVerificationReport(basicInfo, careerInfo, newsContent) {
  const report = {
    title: "杨瀚森信息修正验证报告",
    verificationTime: new Date().toISOString(),
    
    summary: {
      basicInfoPassed: basicInfo.passed,
      careerInfoPassed: careerInfo.passed,
      newsContentPassed: newsContent.passed,
      overallPassed: basicInfo.passed && careerInfo.passed && newsContent.passed
    },
    
    detailedResults: {
      basicInfo: basicInfo.details || basicInfo.error,
      careerInfo: careerInfo.details || careerInfo.error,
      newsContent: newsContent.details || newsContent.error
    },
    
    keyCorrections: [
      "✅ 出生地：北京 → 山东省淄博市",
      "✅ 身高：7'3\" → 7'1\"",
      "✅ 出生日期：2005-05-20 → 2005-06-26",
      "✅ 球队：印第安纳步行者 → 波特兰开拓者",
      "✅ 选秀：2024年第2轮第36顺位 → 2025年第1轮第16顺位",
      "✅ 添加了完整的CBA生涯数据",
      "✅ 添加了国家队经历",
      "✅ 添加了真实的夏季联赛数据"
    ],
    
    pageImpact: [
      {
        page: "首页 (/)",
        changes: [
          "球队信息显示为波特兰开拓者",
          "身高显示为7'1\"",
          "个人简介提到山东淄博出身"
        ]
      },
      {
        page: "个人档案页 (/about)",
        changes: [
          "出生地显示为山东省淄博市",
          "出生日期显示为2005年6月26日",
          "职业生涯时间线包含青岛青训经历",
          "时间线包含CBA和国家队成就"
        ]
      },
      {
        page: "数据统计页 (/stats)",
        changes: [
          "包含完整的CBA生涯数据",
          "包含U19世界杯最佳二阵成就",
          "包含真实的NBA夏季联赛数据",
          "当前球队显示为波特兰开拓者"
        ]
      },
      {
        page: "新闻动态页 (/news)",
        changes: [
          "头条新闻提到开拓者队",
          "新闻内容包含正确的选秀信息",
          "热门话题包含波特兰开拓者",
          "新闻内容提到CBA成就"
        ]
      }
    ]
  };
  
  await fs.writeFile('data/verification-report.json', JSON.stringify(report, null, 2), 'utf8');
  return report;
}

/**
 * 主执行函数
 */
async function main() {
  console.log('=== 杨瀚森信息修正验证 ===\n');
  
  try {
    // 验证各个方面
    const basicInfo = await verifyBasicInfo();
    const careerInfo = await verifyCareerInfo();
    const newsContent = await verifyNewsContent();
    
    // 生成验证报告
    const report = await generateVerificationReport(basicInfo, careerInfo, newsContent);
    
    console.log('\n=== 验证结果汇总 ===');
    console.log(`基本信息: ${basicInfo.passed ? '✅ 通过' : '❌ 未通过'}`);
    console.log(`职业生涯: ${careerInfo.passed ? '✅ 通过' : '❌ 未通过'}`);
    console.log(`新闻内容: ${newsContent.passed ? '✅ 通过' : '❌ 未通过'}`);
    console.log(`总体结果: ${report.summary.overallPassed ? '✅ 全部通过' : '❌ 存在问题'}`);
    
    if (report.summary.overallPassed) {
      console.log('\n🎉 所有信息修正验证通过！');
      console.log('\n📋 关键修正确认:');
      report.keyCorrections.forEach(correction => {
        console.log(`  ${correction}`);
      });
      
      console.log('\n🔍 页面影响预览:');
      report.pageImpact.forEach(page => {
        console.log(`\n${page.page}:`);
        page.changes.forEach(change => {
          console.log(`  • ${change}`);
        });
      });
      
      console.log('\n🚀 下一步操作:');
      console.log('1. 运行 `npm run dev` 启动开发服务器');
      console.log('2. 访问各个页面确认显示效果');
      console.log('3. 所有信息现在都基于维基百科准确数据');
      
    } else {
      console.log('\n❌ 发现验证问题，请检查数据文件');
    }
    
    console.log('\n📄 详细验证报告已保存到: data/verification-report.json');
    
    return report;
    
  } catch (error) {
    console.error('❌ 验证过程失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  verifyBasicInfo,
  verifyCareerInfo,
  verifyNewsContent,
  generateVerificationReport
};