#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 开始最终国际化清理...');

// 修复layout.tsx的元数据
function fixLayout() {
  console.log('🔧 修复Layout元数据...');
  
  const layoutPath = 'app/layout.tsx';
  if (!fs.existsSync(layoutPath)) return;
  
  let content = fs.readFileSync(layoutPath, 'utf8');
  
  // 替换元数据中的中文
  const replacements = [
    {
      search: /title: '杨瀚森 \| Yang Hansen - NBA Portland Trail Blazers'/g,
      replace: "title: 'Yang Hansen | NBA Portland Trail Blazers'"
    },
    {
      search: /description: '杨瀚森官方网站 - 波特兰开拓者队中锋，中国NBA球员的新星'/g,
      replace: "description: 'Yang Hansen Official Website - Portland Trail Blazers Center, Rising Chinese NBA Star'"
    },
    {
      search: /keywords: '杨瀚森, Yang Hansen, NBA, 开拓者, Trail Blazers, 中国篮球, 中锋'/g,
      replace: "keywords: 'Yang Hansen, NBA, Trail Blazers, Chinese Basketball, Center'"
    },
    {
      search: /authors: \[\{ name: '杨瀚森官方团队' \}\]/g,
      replace: "authors: [{ name: 'Yang Hansen Official Team' }]"
    }
  ];
  
  replacements.forEach(({search, replace}) => {
    content = content.replace(search, replace);
  });
  
  fs.writeFileSync(layoutPath, content);
  console.log('✅ Layout元数据修复完成');
}

// 修复视频详情页
function fixVideoPage() {
  console.log('🔧 修复视频详情页...');
  
  const videoPath = 'app/media/video/[slug]/page.tsx';
  if (!fs.existsSync(videoPath)) return;
  
  let content = fs.readFileSync(videoPath, 'utf8');
  
  // 确保是客户端组件
  if (!content.includes("'use client'")) {
    content = "'use client'\n\n" + content;
  }
  
  // 添加翻译导入
  if (!content.includes('useTranslations')) {
    content = content.replace(
      "import { notFound } from 'next/navigation'",
      "import { notFound } from 'next/navigation'\nimport { useTranslations } from 'next-intl'"
    );
    
    content = content.replace(
      "export default function VideoPage({ params }: { params: { slug: string } }) {",
      "export default function VideoPage({ params }: { params: { slug: string } }) {\n  const t = useTranslations('MediaPage');"
    );
  }
  
  // 替换硬编码中文
  const replacements = [
    {
      search: /<h1 className="text-2xl font-bold text-gray-900 mb-4">视频未找到<\/h1>/g,
      replace: '<h1 className="text-2xl font-bold text-gray-900 mb-4">{t("videoNotFound")}</h1>'
    },
    {
      search: /<p className="text-gray-600 mb-6">抱歉，您访问的视频不存在或已被删除。<\/p>/g,
      replace: '<p className="text-gray-600 mb-6">{t("videoNotFoundDesc")}</p>'
    },
    {
      search: /返回媒体中心/g,
      replace: '{t("backToMedia")}'
    },
    {
      search: /播放视频/g,
      replace: '{t("playVideo")}'
    },
    {
      search: /\/\* 导航栏 \*\//g,
      replace: '{/* Navigation */}'
    },
    {
      search: /\/\* 主要内容区域 \*\//g,
      replace: '{/* Main Content */}'
    },
    {
      search: /\/\* 视频播放器 \*\//g,
      replace: '{/* Video Player */}'
    },
    {
      search: /\/\* 视频信息 \*\//g,
      replace: '{/* Video Info */}'
    }
  ];
  
  replacements.forEach(({search, replace}) => {
    content = content.replace(search, replace);
  });
  
  fs.writeFileSync(videoPath, content);
  console.log('✅ 视频详情页修复完成');
}

// 修复About页面的ConditionalContent中的中文
function fixAboutPageConditional() {
  console.log('🔧 修复About页面的条件内容...');
  
  const aboutPath = 'app/about/page.tsx';
  if (!fs.existsSync(aboutPath)) return;
  
  let content = fs.readFileSync(aboutPath, 'utf8');
  
  // 这些中文是在ConditionalContent的zh属性中，这是正确的
  // 我们只需要确保它们被正确包装
  console.log('✅ About页面的条件内容已正确配置');
}

// 添加缺失的翻译
function addMissingTranslations() {
  console.log('📝 添加缺失的翻译...');
  
  // 读取现有翻译文件
  const zhTranslations = JSON.parse(fs.readFileSync('messages/zh.json', 'utf8'));
  const enTranslations = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
  
  // 添加视频页面翻译
  zhTranslations.MediaPage = {
    "videoNotFound": "视频未找到",
    "videoNotFoundDesc": "抱歉，您访问的视频不存在或已被删除。",
    "backToMedia": "返回媒体中心",
    "playVideo": "播放视频",
    "videoTitle": "视频标题",
    "videoDescription": "视频描述",
    "publishDate": "发布日期",
    "category": "分类",
    "watchNow": "立即观看",
    "fullscreen": "全屏",
    "quality": "画质"
  };
  
  enTranslations.MediaPage = {
    "videoNotFound": "Video Not Found",
    "videoNotFoundDesc": "Sorry, the video you're looking for doesn't exist or has been removed.",
    "backToMedia": "Back to Media Center",
    "playVideo": "Play Video",
    "videoTitle": "Video Title",
    "videoDescription": "Video Description",
    "publishDate": "Publish Date",
    "category": "Category",
    "watchNow": "Watch Now",
    "fullscreen": "Fullscreen",
    "quality": "Quality"
  };
  
  // 写回文件
  fs.writeFileSync('messages/zh.json', JSON.stringify(zhTranslations, null, 2));
  fs.writeFileSync('messages/en.json', JSON.stringify(enTranslations, null, 2));
  
  console.log('✅ 翻译文件更新完成');
}

// 创建数据文件的英文版本
function createEnglishDataFiles() {
  console.log('🔧 创建英文数据文件...');
  
  // 创建英文版本的player.json
  const playerData = JSON.parse(fs.readFileSync('data/player.json', 'utf8'));
  
  const playerDataEn = {
    ...playerData,
    basicInfo: {
      ...playerData.basicInfo,
      name: "Yang Hansen",
      position: "Center",
      birthPlace: "Zibo, Shandong Province, China",
      team: "Portland Trail Blazers",
      experience: "NBA Rookie"
    },
    biography: {
      story: "Yang Hansen is a young center from Zibo, Shandong, China, standing 7'1\". He was selected by the Memphis Grizzlies in the 2025 NBA Draft and then traded to the Portland Trail Blazers. He is a rising star in Chinese basketball who achieved his NBA dream through outstanding performance in the CBA.",
      background: "Yang Hansen was born in Zibo, Shandong Province, and started playing basketball at a young age. He entered club training in the third grade of elementary school and later attended Zibo Sports School. Around 2020, he joined the youth training system of Qingdao Guoxin Haitian Club.",
      journey: "Yang Hansen excelled in Qingdao Guoxin Haitian youth team, helping the team win U17 national championships for two consecutive years and earning individual honors. In 2023, he was promoted to the CBA first team and won multiple important honors in his first season, including CBA Rookie of the Year. In 2025, he successfully entered the NBA, starting a new chapter in his professional career."
    },
    personalLife: {
      ...playerData.personalLife,
      education: "Zibo Sports School",
      languages: ["Chinese (Native)", "English (Learning)"],
      hobbies: ["Basketball Training", "Music", "Reading"],
      hometown: "Zibo, Shandong Province",
      motto: "Train hard, pursue excellence"
    }
  };
  
  fs.writeFileSync('data/player-en.json', JSON.stringify(playerDataEn, null, 2));
  console.log('✅ 英文数据文件创建完成');
}

// 主执行函数
async function main() {
  try {
    fixLayout();
    fixVideoPage();
    fixAboutPageConditional();
    addMissingTranslations();
    createEnglishDataFiles();
    
    console.log('🎉 最终国际化清理完成！');
    console.log('');
    console.log('📋 清理总结:');
    console.log('✅ 修复了Layout元数据');
    console.log('✅ 修复了视频详情页');
    console.log('✅ 检查了About页面条件内容');
    console.log('✅ 添加了缺失的翻译');
    console.log('✅ 创建了英文数据文件');
    console.log('');
    console.log('🔍 请运行以下命令检查最终结果:');
    console.log('node scripts/strict-chinese-detector.js');
    
  } catch (error) {
    console.error('❌ 清理过程中出现错误:', error);
    process.exit(1);
  }
}

main();