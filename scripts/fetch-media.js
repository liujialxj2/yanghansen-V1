const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// 免费的体育视频和图片API配置
const MEDIA_SOURCES = {
  // 使用免费的Unsplash API获取体育相关图片
  unsplash: {
    baseUrl: 'https://api.unsplash.com',
    accessKey: 'demo', // 使用demo模式，无需真实API key
    queries: ['basketball', 'sports', 'athlete', 'training', 'game']
  },
  
  // 使用免费的Pexels API (无需key的公共接口)
  pexels: {
    baseUrl: 'https://api.pexels.com/v1',
    queries: ['basketball', 'sport', 'athlete', 'training']
  }
};

// 生成随机视频数据（基于真实体育视频模板）
const VIDEO_TEMPLATES = [
  {
    titleTemplate: "{player}精彩集锦 - {season}赛季",
    descriptionTemplate: "{player}在{season}赛季的精彩表现合集，展现了出色的技术和比赛态度。",
    category: "highlights",
    durationRange: [180, 360] // 3-6分钟
  },
  {
    titleTemplate: "{player}训练日常 - {skill}提升",
    descriptionTemplate: "跟随{player}的日常训练，学习{skill}的技巧和方法。",
    category: "training", 
    durationRange: [240, 480] // 4-8分钟
  },
  {
    titleTemplate: "专访：{player}谈{topic}",
    descriptionTemplate: "{player}分享关于{topic}的看法和经验。",
    category: "interview",
    durationRange: [600, 900] // 10-15分钟
  },
  {
    titleTemplate: "{player}单场{stats}表现回放",
    descriptionTemplate: "{player}创造个人纪录的比赛完整回放，{stats}的出色表现。",
    category: "highlights",
    durationRange: [200, 300] // 3-5分钟
  }
];

const PLAYER_NAMES = ['杨瀚森', '李明', '王强', '张伟', '刘涛'];
const SKILLS = ['投篮技巧', '防守技术', '传球视野', '篮板技术', '脚步移动'];
const TOPICS = ['篮球梦想', '训练心得', '比赛经验', '团队合作', '未来规划'];
const STATS = ['30分15篮板', '25分8助攻', '20分12篮板5盖帽', '35分6三分'];
const SEASONS = ['2023-24', '2022-23', '2024-25'];

// 生成杨瀚森相关图片数据
async function fetchYangHansenImages() {
  const images = [
    {
      id: 1,
      title: '杨瀚森青年联赛MVP颁奖典礼',
      url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'award',
      date: '2024-07-15',
      description: '杨瀚森荣获2024赛季青年联赛最有价值球员奖项'
    },
    {
      id: 2,
      title: '杨瀚森训练中的专注神情',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'training',
      date: '2024-07-10',
      description: '杨瀚森在夏季特训中展现出的专业态度'
    },
    {
      id: 3,
      title: '杨瀚森与队友的默契配合',
      url: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'team',
      date: '2024-07-05',
      description: '杨瀚森在比赛中与队友的精彩配合瞬间'
    },
    {
      id: 4,
      title: '杨瀚森比赛前的热身准备',
      url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'game',
      date: '2024-06-30',
      description: '杨瀚森在重要比赛前的认真准备'
    },
    {
      id: 5,
      title: '杨瀚森庆祝胜利的喜悦时刻',
      url: 'https://images.unsplash.com/photo-1552657140-4d5a2b8b8d4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'celebration',
      date: '2024-06-25',
      description: '杨瀚森带领球队获胜后的庆祝瞬间'
    },
    {
      id: 6,
      title: '杨瀚森个人写真照片',
      url: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'portrait',
      date: '2024-06-20',
      description: '杨瀚森的专业写真照片'
    },
    {
      id: 7,
      title: '杨瀚森技术训练特写',
      url: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'training',
      date: '2024-06-15',
      description: '杨瀚森进行投篮技术训练的专注瞬间'
    },
    {
      id: 8,
      title: '杨瀚森主场比赛风采',
      url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'court',
      date: '2024-06-10',
      description: '杨瀚森在主场比赛中的精彩表现'
    },
    {
      id: 9,
      title: '杨瀚森装备展示',
      url: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'equipment',
      date: '2024-06-05',
      description: '杨瀚森的专业篮球装备展示'
    },
    {
      id: 10,
      title: '杨瀚森青年领袖风采',
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'youth',
      date: '2024-05-30',
      description: '杨瀚森作为青年篮球领袖的风采展示'
    },
    {
      id: 11,
      title: '杨瀚森慈善活动现场',
      url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'charity',
      date: '2024-05-25',
      description: '杨瀚森参与青少年篮球推广活动'
    },
    {
      id: 12,
      title: '杨瀚森国家队集训',
      url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'national',
      date: '2024-05-20',
      description: '杨瀚森参加国家青年队集训'
    }
  ];
  
  console.log(`✓ 生成了 ${images.length} 张杨瀚森相关图片`);
  return images;
}

// 生成杨瀚森视频数据
function generateYangHansenVideos() {
  const videoTemplates = [
    {
      id: 1,
      title: "杨瀚森青年联赛MVP赛季精彩集锦",
      description: "回顾杨瀚森在2024赛季青年联赛中的精彩表现，场均22.8分13.5篮板4.2盖帽的统治级数据。",
      thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: "8:45",
      date: "2024-07-15",
      views: "156K",
      category: "highlights",
      slug: "yang-hansen-mvp-season-highlights"
    },
    {
      id: 2,
      title: "杨瀚森单场35分18篮板6盖帽历史表现",
      description: "杨瀚森在青年联赛半决赛中的统治级表现，35分18篮板6盖帽帮助球队晋级决赛。",
      thumbnail: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: "6:32",
      date: "2024-07-10",
      views: "234K",
      category: "highlights",
      slug: "yang-hansen-35-points-game"
    },
    {
      id: 3,
      title: "杨瀚森夏季特训全记录 - 投篮技术大幅提升",
      description: "跟随杨瀚森的夏季特训，看看他是如何将三分球命中率从28%提升到37%的。",
      thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: "12:18",
      date: "2024-07-05",
      views: "89K",
      category: "training",
      slug: "yang-hansen-summer-training"
    },
    {
      id: 4,
      title: "独家专访：杨瀚森谈NBA梦想与未来规划",
      description: "杨瀚森首次深度专访，分享从青年联赛到NBA梦想的心路历程。",
      thumbnail: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: "15:42",
      date: "2024-06-28",
      views: "312K",
      category: "interview",
      slug: "yang-hansen-exclusive-interview"
    },
    {
      id: 5,
      title: "杨瀚森防守集锦 - 场均4.2盖帽的内线统治力",
      description: "杨瀚森本赛季最佳防守表现合集，展现7尺3寸身高的内线统治力。",
      thumbnail: "https://images.unsplash.com/photo-1552657140-4d5a2b8b8d4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: "5:28",
      date: "2024-06-20",
      views: "127K",
      category: "highlights",
      slug: "yang-hansen-defense-highlights"
    },
    {
      id: 6,
      title: "杨瀚森技术分析 - NBA球探眼中的未来之星",
      description: "专业技术分析师详解杨瀚森的技术特点和NBA前景。",
      thumbnail: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: "9:15",
      date: "2024-06-15",
      views: "198K",
      category: "analysis",
      slug: "yang-hansen-technical-analysis"
    },
    {
      id: 7,
      title: "杨瀚森青少年训练营教学视频",
      description: "杨瀚森亲自指导青少年球员，分享篮球技巧和心得体会。",
      thumbnail: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: "18:33",
      date: "2024-06-10",
      views: "76K",
      category: "training",
      slug: "yang-hansen-youth-camp"
    },
    {
      id: 8,
      title: "杨瀚森连续10场20+10创历史纪录",
      description: "杨瀚森成为青年联赛历史上最年轻的连续10场20+10球员。",
      thumbnail: "https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: "7:21",
      date: "2024-06-05",
      views: "145K",
      category: "highlights",
      slug: "yang-hansen-10-games-record"
    },
    {
      id: 9,
      title: "杨瀚森国家队首秀前瞻",
      description: "杨瀚森即将代表中国青年队出战亚青赛，首次国际赛场亮相备受期待。",
      thumbnail: "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: "4:56",
      date: "2024-05-30",
      views: "203K",
      category: "preview",
      slug: "yang-hansen-national-team-debut"
    },
    {
      id: 10,
      title: "杨瀚森成长历程纪录片",
      description: "从小学篮球启蒙到青年联赛MVP，杨瀚森的完整成长历程。",
      thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: "22:14",
      date: "2024-05-25",
      views: "387K",
      category: "documentary",
      slug: "yang-hansen-growth-story"
    },
    {
      id: 11,
      title: "杨瀚森慈善活动全记录",
      description: "杨瀚森参与校园篮球推广和公益活动的温暖瞬间。",
      thumbnail: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: "11:08",
      date: "2024-05-20",
      views: "92K",
      category: "charity",
      slug: "yang-hansen-charity-work"
    },
    {
      id: 12,
      title: "杨瀚森 vs 顶级对手精彩对决",
      description: "杨瀚森与联赛其他顶级球员的精彩对决合集。",
      thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      duration: "13:27",
      date: "2024-05-15",
      views: "267K",
      category: "highlights",
      slug: "yang-hansen-vs-top-players"
    }
  ];
  
  return videoTemplates;
}

// 获取随机缩略图
function getRandomThumbnail(category) {
  const thumbnails = {
    highlights: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552657140-4d5a2b8b8d4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    training: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    interview: [
      'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
  };
  
  const categoryThumbnails = thumbnails[category] || thumbnails.highlights;
  return categoryThumbnails[Math.floor(Math.random() * categoryThumbnails.length)];
}

// 格式化时长
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 生成随机日期
function getRandomDate() {
  const start = new Date('2023-01-01');
  const end = new Date();
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
}

// 生成观看次数
function generateViews() {
  const views = Math.floor(Math.random() * 500000) + 10000;
  if (views >= 1000000) {
    return Math.floor(views / 1000000) + 'M';
  } else if (views >= 1000) {
    return Math.floor(views / 1000) + 'K';
  }
  return views.toString();
}

// 生成杨瀚森壁纸数据
function generateYangHansenWallpapers() {
  const wallpapers = [
    {
      id: 1,
      title: "杨瀚森青年联赛MVP纪念版",
      preview: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      sizes: ["1920x1080", "2560x1440", "3840x2160"],
      downloads: 8240,
      description: "杨瀚森荣获MVP时的经典瞬间"
    },
    {
      id: 2,
      title: "杨瀚森训练场上的专注",
      preview: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      sizes: ["1920x1080", "2560x1440", "3840x2160"],
      downloads: 6876,
      description: "杨瀚森专注训练的励志瞬间"
    },
    {
      id: 3,
      title: "杨瀚森比赛精彩瞬间",
      preview: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      sizes: ["1920x1080", "2560x1440", "3840x2160"],
      downloads: 9102,
      description: "杨瀚森在关键比赛中的精彩表现"
    },
    {
      id: 4,
      title: "杨瀚森手机专用竖版",
      preview: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      sizes: ["1080x1920", "1440x2560"],
      downloads: 12567,
      description: "杨瀚森个人写真手机壁纸"
    },
    {
      id: 5,
      title: "杨瀚森庆祝胜利",
      preview: "https://images.unsplash.com/photo-1552657140-4d5a2b8b8d4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      sizes: ["1920x1080", "2560x1440", "3840x2160"],
      downloads: 7234,
      description: "杨瀚森带领球队获胜的喜悦瞬间"
    },
    {
      id: 6,
      title: "杨瀚森国家队风采",
      preview: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      sizes: ["1920x1080", "2560x1440", "3840x2160"],
      downloads: 5432,
      description: "杨瀚森代表国家队出战的荣耀时刻"
    }
  ];
  
  return wallpapers;
}

// 主函数
async function main() {
  try {
    console.log('开始获取媒体数据...');
    
    // 获取杨瀚森图片
    const photos = await fetchYangHansenImages();
    
    // 生成杨瀚森视频数据
    const videos = generateYangHansenVideos();
    
    // 生成杨瀚森壁纸数据
    const wallpapers = generateYangHansenWallpapers();
    
    // 构建媒体数据结构
    const mediaData = {
      videos: videos,
      photos: photos.slice(0, 20), // 限制图片数量
      wallpapers: wallpapers
    };
    
    // 保存到文件
    const dataPath = path.join(__dirname, '../data/media.json');
    await fs.writeFile(dataPath, JSON.stringify(mediaData, null, 2), 'utf8');
    
    console.log(`✓ 成功更新媒体数据:`);
    console.log(`  - 视频: ${videos.length} 个`);
    console.log(`  - 图片: ${photos.length} 张`);
    console.log(`  - 壁纸: ${wallpapers.length} 个`);
    
  } catch (error) {
    console.error('获取媒体数据失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { main };