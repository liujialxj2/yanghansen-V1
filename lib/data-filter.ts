/**
 * 数据过滤中间件 - 确保英文模式下不显示中文内容
 */

// 检测是否包含中文字符
export function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(text);
}

// 中文到英文的映射表
const CHINESE_TO_ENGLISH_MAP: Record<string, string> = {
  // 基本信息
  '杨瀚森': 'Yang Hansen',
  '中锋': 'Center',
  '波特兰开拓者': 'Portland Trail Blazers',
  '孟菲斯灰熊': 'Memphis Grizzlies',
  '中国山东省淄博市': 'Zibo, Shandong Province, China',
  '山东省淄博市': 'Zibo, Shandong Province',
  'NBA新秀': 'NBA Rookie',
  
  // 统计数据
  '场均得分': 'PPG',
  '场均篮板': 'RPG',
  '场均盖帽': 'BPG',
  '场均助攻': 'APG',
  '投篮命中率': 'FG%',
  '出场比赛': 'Games Played',
  '首发比赛': 'Games Started',
  '场均时间': 'Minutes/Game',
  
  // 时间和比赛
  '赛季': 'Season',
  '夏季联赛': 'Summer League',
  '常规赛': 'Regular Season',
  '季后赛': 'Playoffs',
  '全明星赛': 'All-Star Game',
  '选秀': 'Draft',
  '职业首秀': 'Professional Debut',
  
  // 球队和联赛
  '青岛雄鹰': 'Qingdao Eagles',
  '青岛国信海天': 'Qingdao Guoxin Haitian',
  '中国U17青少年篮球联赛': 'China U17 Youth Basketball League',
  '中国U19国家队': 'China U19 National Team',
  '中国国家队': 'China National Team',
  
  // 荣誉和成就
  '总冠军': 'Champion',
  '最佳防守球员': 'Best Defensive Player',
  '最有价值球员': 'Most Valuable Player',
  '最佳新锐球员': 'Rookie of the Year',
  '最佳二阵': 'Second Team All-Star',
  '国内球员第一阵容': 'Domestic Player First Team',
  '北区首发': 'North All-Star Starter',
  
  // 个人信息
  '淄博体校': 'Zibo Sports School',
  '中文（母语）': 'Chinese (Native)',
  '英语（学习中）': 'English (Learning)',
  '篮球训练': 'Basketball Training',
  '音乐': 'Music',
  '阅读': 'Reading',
  '努力训练，追求卓越': 'Train hard, pursue excellence',
  
  // 时间表达
  '年': '',
  '月': '/',
  '日': '',
  '对阵': 'vs',
  '金州勇士': 'Golden State Warriors',
  '不到': 'Less than',
  '分钟': 'minutes',
  '即将开始': 'Coming Soon',
  '已完成': 'Completed',
  '进入': 'Entered',
  '国家队成员': 'National Team Member',
  '新秀': 'Rookie',
  
  // 其他常用词
  '秒': 'sec',
  '篮球': 'Basketball',
  '北美篮球社': 'North American Basketball',
  '微博': 'Weibo',
  '微信公众号': 'WeChat Official Account',
  '白带你看球': 'Basketball Analysis',
  '中国男篮': 'China Men\'s Basketball',
  '中国篮球': 'Chinese Basketball',
};

// 深度克隆并过滤对象
export function deepClone(obj: any, transformer?: (key: string, value: any) => any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (Array.isArray(obj)) {
    return obj.map((item, index) => deepClone(item, transformer));
  }
  
  const cloned: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      let value = obj[key];
      
      if (transformer) {
        value = transformer(key, value);
      }
      
      cloned[key] = deepClone(value, transformer);
    }
  }
  
  return cloned;
}

// 获取英文翻译
function getEnglishTranslation(key: string, value: string): string {
  // 直接映射
  if (CHINESE_TO_ENGLISH_MAP[value]) {
    return CHINESE_TO_ENGLISH_MAP[value];
  }
  
  // 部分替换
  let result = value;
  Object.entries(CHINESE_TO_ENGLISH_MAP).forEach(([chinese, english]) => {
    result = result.replace(new RegExp(chinese, 'g'), english);
  });
  
  // 如果还有中文字符，返回占位符
  if (containsChinese(result)) {
    // 根据key类型返回合适的英文占位符
    if (key.includes('name') || key.includes('Name')) {
      return 'Yang Hansen';
    }
    if (key.includes('team') || key.includes('Team')) {
      return 'Portland Trail Blazers';
    }
    if (key.includes('position') || key.includes('Position')) {
      return 'Center';
    }
    if (key.includes('date') || key.includes('Date')) {
      return result.replace(/[\u4e00-\u9fff]/g, '').trim();
    }
    
    return '[EN]'; // 默认占位符
  }
  
  return result;
}

// 主过滤函数
export function filterChineseContent(data: any, locale: string): any {
  if (locale === 'zh') {
    return data; // 中文模式直接返回原数据
  }
  
  // 英文模式下过滤中文内容
  return deepClone(data, (key, value) => {
    if (typeof value === 'string' && containsChinese(value)) {
      return getEnglishTranslation(key, value);
    }
    return value;
  });
}