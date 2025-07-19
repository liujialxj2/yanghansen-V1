const Parser = require('rss-parser');
const fs = require('fs').promises;
const path = require('path');

const parser = new Parser({
  customFields: {
    item: ['media:thumbnail', 'enclosure']
  }
});

// RSS 新闻源配置
const RSS_SOURCES = [
  {
    url: 'https://www.espn.com/espn/rss/news',
    name: 'ESPN体育',
    category: '国际体育'
  },
  {
    url: 'https://www.espn.com/espn/rss/nba/news',
    name: 'ESPN NBA',
    category: 'NBA资讯'
  },
  {
    url: 'https://feeds.nbcsports.com/nbcsports/NBCS',
    name: 'NBC体育',
    category: '体育新闻'
  },
  {
    url: 'https://www.cbssports.com/rss/headlines/',
    name: 'CBS体育',
    category: '体育资讯'
  },
  {
    url: 'https://bleacherreport.com/articles/feed',
    name: 'Bleacher Report',
    category: '体育分析'
  }
];

// 关键词过滤 - 篮球相关内容
const BASKETBALL_KEYWORDS = [
  '篮球', 'NBA', 'CBA', '球员', '比赛', '赛季', '得分', '篮板', 
  '助攻', '投篮', '三分', '罚球', '盖帽', '抢断', '教练', '球队',
  'basketball', 'player', 'game', 'season', 'score', 'rebound'
];

// 获取默认图片
function getDefaultImage(category) {
  const images = {
    '篮球新闻': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    '体育资讯': 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'NBA资讯': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    '国际体育': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  };
  return images[category] || images['篮球新闻'];
}

// 提取图片URL
function extractImageUrl(item) {
  // 尝试从多个字段获取图片
  if (item['media:thumbnail'] && item['media:thumbnail'].$.url) {
    return item['media:thumbnail'].$.url;
  }
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  // 从内容中提取图片
  const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) {
    return imgMatch[1];
  }
  return null;
}

// 清理HTML标签
function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

// 检查是否为篮球相关内容
function isBasketballRelated(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  return BASKETBALL_KEYWORDS.some(keyword => 
    text.includes(keyword.toLowerCase())
  );
}

// 估算阅读时间
function estimateReadTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes}分钟`;
}

// 获取RSS新闻
async function fetchRSSNews() {
  const allArticles = [];
  
  for (const source of RSS_SOURCES) {
    try {
      console.log(`正在获取 ${source.name} 的新闻...`);
      const feed = await parser.parseURL(source.url);
      
      for (const item of feed.items.slice(0, 10)) { // 每个源取前10条
        const title = cleanHtml(item.title);
        const content = cleanHtml(item.contentSnippet || item.content || '');
        
        // 只保留篮球相关内容
        if (!isBasketballRelated(title, content)) {
          continue;
        }
        
        const article = {
          id: Date.now() + Math.random(),
          title: title,
          summary: content.substring(0, 150) + '...',
          content: content,
          image: extractImageUrl(item) || getDefaultImage(source.category),
          date: new Date(item.pubDate || item.isoDate).toISOString().split('T')[0],
          category: source.category,
          readTime: estimateReadTime(content),
          author: source.name,
          url: item.link
        };
        
        allArticles.push(article);
      }
      
      console.log(`✓ ${source.name}: 获取到 ${feed.items.length} 条新闻`);
    } catch (error) {
      console.error(`✗ 获取 ${source.name} 失败:`, error.message);
    }
  }
  
  return allArticles;
}

// 生成热门话题
function generateTrending(articles) {
  const keywords = [];
  articles.forEach(article => {
    BASKETBALL_KEYWORDS.forEach(keyword => {
      if (article.title.toLowerCase().includes(keyword.toLowerCase())) {
        keywords.push(keyword);
      }
    });
  });
  
  // 统计关键词频率并返回前5个
  const keywordCount = {};
  keywords.forEach(keyword => {
    keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
  });
  
  return Object.entries(keywordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([keyword]) => keyword);
}

// 生成杨瀚森相关新闻
function generateYangHansenNews() {
  const newsTemplates = [
    {
      title: "杨瀚森荣获青年联赛MVP，场均{stats}创历史纪录",
      summary: "19岁中锋杨瀚森凭借出色表现荣获2024赛季青年联赛最有价值球员，成为联赛历史上最年轻的MVP得主。",
      category: "荣誉成就",
      stats: ["22.8分13.5篮板4.2盖帽", "21.3分12.8篮板3.8盖帽", "24.1分14.2篮板4.5盖帽"],
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "杨瀚森单场{performance}震撼全场，刷新个人最佳纪录",
      summary: "在昨晚的关键比赛中，杨瀚森展现了超越年龄的成熟表现，帮助球队取得重要胜利。",
      category: "比赛表现",
      performance: ["35分18篮板6盖帽", "30分15篮板5盖帽", "28分20篮板7盖帽", "32分16篮板4盖帽"],
      image: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "专访杨瀚森：从青年联赛到{dream}的追梦之路",
      summary: "杨瀚森在接受专访时分享了自己的篮球成长历程，以及对未来职业生涯的规划和期待。",
      category: "独家专访",
      dream: ["NBA梦想", "职业篮球", "国际赛场", "更高舞台"],
      image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "杨瀚森{training}训练曝光，专业态度获教练盛赞",
      summary: "训练场上的杨瀚森展现出了超乎寻常的专注度和学习能力，教练组对其职业态度给予高度评价。",
      category: "训练动态",
      training: ["夏季特训", "技术提升", "体能强化", "战术学习"],
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "杨瀚森领衔中国青年队，{event}表现备受期待",
      summary: "作为中国青年篮球的代表人物，杨瀚森将在即将到来的重要赛事中承担重要责任。",
      category: "国际赛事",
      event: ["亚青赛征程", "世青赛备战", "友谊赛热身", "选拔赛集训"],
      image: "https://images.unsplash.com/photo-1552657140-4d5a2b8b8d4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "NBA球探关注杨瀚森，{scout}给出积极评价",
      summary: "多位NBA球探表示杨瀚森的身体条件和技术能力都达到了职业水准，未来前景看好。",
      category: "NBA前景",
      scout: ["资深球探", "选秀专家", "球队高管", "技术分析师"],
      image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "杨瀚森{achievement}创造历史，成为联赛最年轻纪录保持者",
      summary: "凭借出色的个人能力和团队贡献，杨瀚森再次刷新了青年联赛的历史纪录。",
      category: "历史纪录",
      achievement: ["连续10场20+10", "单月场均三双", "新秀赛季MVP", "最佳防守球员"],
      image: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "杨瀚森慈善活动{activity}，展现青年球员社会责任感",
      summary: "场外的杨瀚森同样表现出色，积极参与各类公益活动，用实际行动回馈社会。",
      category: "公益活动",
      activity: ["校园篮球推广", "贫困地区支教", "青少年训练营", "慈善比赛"],
      image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const articles = [];
  
  newsTemplates.forEach((template, index) => {
    // 为每个模板生成1-2篇文章
    const numArticles = Math.random() > 0.5 ? 2 : 1;
    for (let i = 0; i < numArticles; i++) {
      const article = {
        id: Date.now() + index * 100 + i,
        title: template.title.replace(/\{(\w+)\}/g, (match, key) => {
          const options = template[key];
          return options ? options[Math.floor(Math.random() * options.length)] : match;
        }),
        summary: template.summary,
        content: generateYangHansenArticleContent(template.category),
        image: template.image,
        date: getRandomRecentDate(),
        category: template.category,
        readTime: estimateReadTime(template.summary + generateYangHansenArticleContent(template.category)),
        author: getRandomAuthor(),
        slug: `yang-hansen-${Date.now() + index * 100 + i}`
      };
      articles.push(article);
    }
  });
  
  return articles;
}

// 生成杨瀚森相关文章内容
function generateYangHansenArticleContent(category) {
  const contentTemplates = {
    "荣誉成就": "19岁的杨瀚森在2024赛季青年联赛中表现出色，最终荣获最有价值球员奖项。这位身高7尺3寸的年轻中锋在整个赛季中场均贡献22.8分13.5篮板4.2盖帽的全面数据，投篮命中率高达58.3%。\n\n\"杨瀚森展现出了超越年龄的成熟度和篮球智商，\"联赛技术委员会主任在颁奖典礼上说道，\"他的身体条件和技术能力都非常出色，具备了冲击更高水平联赛的实力。\"\n\n作为联赛历史上最年轻的MVP得主，杨瀚森的获奖不仅是对其个人能力的认可，更代表了中国青年篮球的崛起。他在攻防两端的统治力让所有人印象深刻，特别是在关键比赛中的表现更是可圈可点。",
    
    "比赛表现": "在昨晚进行的青年联赛半决赛中，杨瀚森交出了35分18篮板6盖帽的统治级表现，帮助球队以98-85击败对手晋级决赛。这场比赛中，杨瀚森展现了全面的技术能力和出色的比赛阅读能力。\n\n第四节关键时刻，当球队落后8分时，杨瀚森连续命中两记三分球，随后又在防守端送出关键盖帽，彻底扭转了比赛局势。\"他就像一名经验丰富的老将，\"主教练赛后评价道，\"在最需要的时候总能站出来。\"\n\n这已经是杨瀚森本赛季第8次单场得分30+，他的稳定发挥成为球队最大的依靠。数据显示，当杨瀚森得分超过25分时，球队的胜率高达92.3%。",
    
    "独家专访": "\"我的梦想一直很简单，就是成为最好的篮球运动员，\"杨瀚森在接受专访时说道，\"无论是在中国还是在世界舞台上，我都希望能够证明自己的实力。\"\n\n谈到自己的成长历程，杨瀚森表示感谢所有帮助过他的人。\"从小学开始接触篮球到现在，每一位教练、队友和家人都给了我很大的支持。特别是我的父母，他们为了我的篮球梦想付出了很多。\"\n\n对于未来的规划，杨瀚森显得很有想法：\"短期目标是帮助球队赢得联赛冠军，长期来看，我希望能够进入更高水平的联赛，甚至有朝一日能够在NBA的舞台上证明中国球员的实力。\"",
    
    "训练动态": "清晨6点，当大多数人还在睡梦中时，杨瀚森已经出现在训练馆里。这样的训练强度和自律性让所有人都印象深刻。\"他是我见过最勤奋的年轻球员之一，\"体能教练李明说道。\n\n杨瀚森的训练计划非常全面，包括力量训练、技术练习、战术学习和心理调节。每天的训练时间超过6小时，即使在休息日也会进行轻度的恢复性训练。\"我知道天赋很重要，但努力更重要，\"杨瀚森说，\"只有通过不断的训练才能让天赋得到最大的发挥。\"\n\n最近，杨瀚森还专门聘请了投篮教练来改善自己的三分球技术。数据显示，他的三分球命中率从赛季初的28%提升到了现在的37%，这种进步速度让人惊叹。",
    
    "国际赛事": "作为中国青年篮球的领军人物，杨瀚森即将代表国家队参加亚洲青年篮球锦标赛。这将是他首次在国际舞台上亮相，备受各方关注。\n\n\"能够代表国家出战是我的荣幸，\"杨瀚森在出征仪式上表示，\"我会全力以赴，争取为国家争光。\"国家队主教练对杨瀚森的能力非常认可，\"他的身体条件和技术水平都达到了国际先进水平，我们对他在比赛中的表现很有信心。\"\n\n据了解，已有多支亚洲强队将杨瀚森列为重点研究对象。韩国队主教练在接受采访时表示：\"杨瀚森是一名非常出色的球员，我们必须制定专门的战术来限制他的发挥。\"",
    
    "NBA前景": "多位NBA球探在观看了杨瀚森的比赛后给出了积极评价。来自洛杉矶湖人队的球探约翰·史密斯表示：\"杨瀚森拥有在NBA立足的所有条件——身高、臂展、移动能力和篮球智商都很出色。\"\n\n著名选秀专家查德·福特在最新的选秀预测中将杨瀚森列为潜在的首轮秀。\"如果他继续保持这样的发展轨迹，我认为他很有机会在未来两年内进入NBA，\"福特说道。\n\n杨瀚森本人对NBA的向往也不加掩饰：\"NBA是世界上最高水平的篮球联赛，每一个篮球运动员都梦想能够在那里打球。我会继续努力，希望有朝一日能够实现这个梦想。\"",
    
    "历史纪录": "杨瀚森再次创造了青年联赛的历史纪录。在昨晚的比赛中，他成为联赛历史上最年轻的连续10场20+10球员，这一纪录此前由23岁的前国手王治郅保持。\n\n\"这个纪录对我来说意义重大，\"杨瀚森赛后说道，\"但我更关心的是球队的胜利。个人荣誉只有建立在团队成功的基础上才有意义。\"\n\n统计显示，杨瀚森本赛季的场均数据为22.8分13.5篮板4.2盖帽，各项数据都创造了19岁以下球员的历史最高纪录。更令人印象深刻的是，他的投篮命中率高达58.3%，罚球命中率也达到了82.1%。",
    
    "公益活动": "场外的杨瀚森同样表现出色。上周末，他来到北京市朝阳区的一所小学，为孩子们上了一堂生动的篮球课。\"看到孩子们对篮球的热爱，我想起了自己刚开始打球时的样子，\"杨瀚森说。\n\n这已经是杨瀚森今年第5次参加公益活动。从校园篮球推广到贫困地区支教，从青少年训练营到慈善比赛，他用实际行动诠释了什么是青年球员的社会责任。\n\n\"篮球给了我很多，我也希望能够通过篮球帮助更多的人，\"杨瀚森表示，\"特别是那些热爱篮球但条件有限的孩子们，我希望能够为他们提供一些帮助和鼓励。\""
  };
  
  return contentTemplates[category] || "杨瀚森作为中国青年篮球的代表人物，在场上场下都展现出了出色的表现和良好的品格，是年轻一代学习的榜样。";
}

// 获取随机近期日期
function getRandomRecentDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30); // 30天内
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
}

// 获取随机作者
function getRandomAuthor() {
  const authors = [
    "体育周报", "篮球时报", "青年体育", "运动世界", "篮球前沿",
    "体育新闻网", "中国篮球", "青训观察", "篮球分析师", "体育评论"
  ];
  return authors[Math.floor(Math.random() * authors.length)];
}

// 主函数
async function main() {
  try {
    console.log('开始获取RSS新闻数据...');
    
    let articles = await fetchRSSNews();
    
    // 总是生成杨瀚森相关新闻作为主要内容
    console.log('生成杨瀚森相关新闻...');
    const yangHansenNews = generateYangHansenNews();
    
    // 将RSS新闻和杨瀚森新闻合并，优先显示杨瀚森新闻
    articles = [...yangHansenNews, ...articles.slice(0, 3)];
    
    // 按日期排序
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 构建新闻数据结构
    const newsData = {
      featured: articles[0], // 最新的作为头条
      articles: articles.slice(1, 11), // 接下来10条作为文章列表
      trending: generateTrending(articles)
    };
    
    // 保存到文件
    const dataPath = path.join(__dirname, '../data/news.json');
    await fs.writeFile(dataPath, JSON.stringify(newsData, null, 2), 'utf8');
    
    console.log(`✓ 成功更新新闻数据: ${articles.length} 条新闻`);
    console.log(`✓ 头条: ${newsData.featured.title}`);
    console.log(`✓ 热门话题: ${newsData.trending.join(', ')}`);
    
  } catch (error) {
    console.error('获取新闻数据失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { main };