/**
 * {tNav("news")}内容增强器
 * 为NewsAPI获取的简短内容生成更丰富的文章正文
 */
class NewsContentEnhancer {
  constructor() {
    // 基于不同类别的内容模板
    this.contentTemplates = {
      draft: {
        intro: [
          "在{date}举行的NBA选秀大会上，{player}成为了全场的焦点。",
          "{player}在NBA选秀中的表现令人印象深刻，展现了中国篮球的新希望。",
          "NBA选秀夜对{player}来说是一个历史性的时刻。"
        ],
        body: [
          "作为一名身高{height}的中锋，{player}在选秀前就备受关注。他的身体条件和技术能力都达到了NBA的标准，特别是他的篮球智商和比赛阅读能力让球探们印象深刻。",
          "选秀专家们普遍认为{player}具备在NBA立足的所有条件。他不仅拥有出色的身高和臂展，更重要的是他展现出了超越 龄的成熟度和对比赛的理解。",
          "{team}选择{player}并非偶然。球队管理层在经过深入的调研和评估后，认为他能够为球队带来即时的帮助，同时也是球队未来建设的重要一环。",
          "从技术层面来看，{player}的投篮技术、传球视野和防守意识都相当出色。他能够在内线提供稳定的PTS和REB，同时也具备一定的外线投射能力。"
        ],
        conclusion: [
          "{player}的NBA之路才刚刚开始，但他已经展现出了成为顶级球员的潜质。",
          "随着{player}正式踏入NBA，中国篮球也迎来了新的里程碑。",
          "球迷们对{player}在NBA的表现充满期待，相信他能够在世界最高水平的篮球联赛中证明自己。"
        ]
      },
      performance: {
        intro: [
          "在最近的比赛中，{player}再次展现了他的出色能力。",
          "{player}的表现继续吸引着篮球界的关注。",
          "比赛场上的{player}展现出了令人印象深刻的技术和意识。"
        ],
        body: [
          "这场比赛中，{player}在攻防两端都有着出色的表现。他不仅在PTS上贡献突出，在REB和AST方面也展现了全面的能力。",
          "教练组对{player}的表现给予了高度评价。他的职业态度和学习能力让所有人都印象深刻，这也是他能够快速适应高水平比赛的重要原因。",
          "从比赛录像可以看出，{player}在场上的移动和位置感都非常出色。他能够准确判断比赛形势，并做出正确的决策。",
          "球迷们对{player}的表现反应热烈，社交媒体上{tNav("about")}他的讨论也越来越多。这种关注度对于一名 轻球员来说是很好的激励。"
        ],
        conclusion: [
          "随着比赛经验的积累，{player}的表现将会越来越稳定。",
          "这样的表现让人们对{player}的未来更加充满信心。",
          "{player}正在用自己的实际行动证明，中国球员同样可以在高水平的比赛中发光发热。"
        ]
      },
      interview: {
        intro: [
          "在接受采访时，{player}分享了他的想法和感受。",
          "{player}在专访中展现了他的成熟和智慧。",
          "通过这次深度访谈，我们更好地了解了{player}这个人。"
        ],
        body: [
          "谈到自己的篮球之路，{player}表示感谢所有帮助过他的人。从最初的篮球启蒙到现在的职业生涯，每一步都离不开教练、队友和家人的支持。",
          "对于未来的规划，{player}显得很有想法。他不仅关注自己的技术提升，也希望能够为中国篮球的发展贡献自己的力量。",
          "在谈到适应新环境的话题时，{player}坦言确实面临一些挑战，但他相信通过努力和学习，一定能够克服这些困难。",
          "{player}还特别提到了球迷的支持对他的重要性。他表示会继续努力，不辜负大家的期望。"
        ],
        conclusion: [
          "从这次访谈中可以看出，{player}不仅是一名优秀的球员，更是一个有思想、有担当的 轻人。",
          "{player}的话语中透露出的成熟和责任感，让人们对他的未来更加看好。",
          "相信在{player}的努力下，他一定能够在篮球道路上走得更远。"
        ]
      },
      team: {
        intro: [
          "{team}对{player}的加入表示欢迎。",
          "{player}正式成为{team}的一员，开启了新的篇章。",
          "{team}和{player}的结合被认为是双赢的选择。"
        ],
        body: [
          "球队管理层表示，{player}的加入将为球队带来新的活力。他的技术特点和球队的战术体系非常契合，能够在多个位置上为球队提供帮助。",
          "队友们对{player}的到来也表示欢迎。在训练中，{player}展现出的专业态度和学习能力得到了大家的认可。",
          "教练组已经开始为{player}制定专门的发展计划。他们希望通过系统的训练和比赛，帮助{player}更快地适应球队的节奏。",
          "球迷们对{player}的加入也表现出了极大的热情。球队的社交媒体上{tNav("about")}{player}的内容都获得了很高的关注度。"
        ],
        conclusion: [
          "{team}和{player}的合作前景看好，双方都对未来充满信心。",
          "随着磨合的深入，{player}在球队中的作用将会越来越重要。",
          "这种合作模式也为其他中国球员进入高水平联赛提供了很好的参考。"
        ]
      },
      general: {
        intro: [
          "{player}继续在篮球道路上前进。",
          "{tNav("about")}{player}的最新消息引起了广泛关注。",
          "{player}的篮球故事还在继续书写。"
        ],
        body: [
          "作为一名 轻的篮球运动员，{player}一直在努力提升自己的能力。他深知在竞争激烈的篮球世界中，只有不断进步才能立足。",
          "从技术统计来看，{player}在各个方面都有着稳定的表现。他的PTS、REB、AST等{tNav("stats")}都显示出了良好的发展趋势。",
          "业内专家对{player}的评价普遍积极。他们认为{player}具备了成为优秀球员的所有条件，关键是要保持现在的发展势头。",
          "{player}的成功也激励着{tCommon("more")}的中国 轻球员。他用自己的实际行动证明，通过努力和坚持，中国球员同样可以在国际舞台上发光发热。"
        ],
        conclusion: [
          "{player}的故事还在继续，我们期待看到他{tCommon("more")}精彩的表现。",
          "随着经验的积累和能力的提升，{player}的未来充满无限可能。",
          "{player}不仅是中国篮球的希望，也是 轻人学习的榜样。"
        ]
      }
    };

    // 球员信息
    this.playerInfo = {
      name: "杨瀚森",
      englishName: "Yang Hansen",
      height: "7尺3寸",
      position: "中锋",
      team: "波特兰开拓者队",
      age: "19 years old",
      nickname: "Chinese Jokic"
    };
  }

  /**
   * 增强{tNav("news")}内容
   */
  enhanceNewsContent(article) {
    try {
      const category = article.category || 'general';
      const template = this.contentTemplates[category] || this.contentTemplates.general;
      
      // 生成增强的内容
      const enhancedContent = this.generateEnhancedContent(article, template);
      
      return {
        ...article,
        content: enhancedContent,
        originalContent: article.content, // 保留原始内容
        enhanced: true,
        enhancedAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn('内容增强失败:', error.message);
      return article;
    }
  }

  /**
   * 生成增强的内容
   */
  generateEnhancedContent(article, template) {
    const intro = this.selectRandomTemplate(template.intro);
    const bodyParagraphs = this.selectRandomTemplates(template.body, 2, 3);
    const conclusion = this.selectRandomTemplate(template.conclusion);
    
    // 组合内容
    const content = [
      this.replaceVariables(intro, article),
      '',
      ...bodyParagraphs.map(paragraph => this.replaceVariables(paragraph, article)),
      '',
      this.replaceVariables(conclusion, article)
    ].join('\n');
    
    return content;
  }

  /**
   * 随机选择模板
   */
  selectRandomTemplate(templates) {
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * 随机选择多个模板
   */
  selectRandomTemplates(templates, min, max) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...templates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * 替换变量
   */
  replaceVariables(text, article) {
    let result = text;
    
    // 替换球员信息
    result = result.replace(/\{player\}/g, this.playerInfo.name);
    result = result.replace(/\{height\}/g, this.playerInfo.height);
    result = result.replace(/\{position\}/g, this.playerInfo.position);
    result = result.replace(/\{team\}/g, this.playerInfo.team);
    result = result.replace(/\{age\}/g, this.playerInfo.age);
    result = result.replace(/\{nickname\}/g, this.playerInfo.nickname);
    
    // 替换文章信息
    if (article.publishedAt) {
      const date = new Date(article.publishedAt).toLocaleDateString('zh-CN');
      result = result.replace(/\{date\}/g, date);
    }
    
    // 替换来源信息
    if (article.source && article.source.name) {
      result = result.replace(/\{source\}/g, article.source.name);
    }
    
    return result;
  }

  /**
   * 批量增强{tNav("news")}内容
   */
  enhanceMultipleNews(articles) {
    return articles.map(article => this.enhanceNewsContent(article));
  }

  /**
   * 为特定文章生成相关段落
   */
  generateRelatedParagraph(article) {
    const relatedTemplates = [
      "这一消息在社交媒体上引起了广泛讨论，球迷们纷纷表达了对{player}的支持和期待。",
      "体育分析师认为，{player}的表现证明了中国篮球人才培养体系的成功。",
      "从{player}的成长经历可以看出，坚持和努力是成功的关键因素。",
      "业内专家表示，{player}的成功为{tCommon("more")}中国 轻球员树立了榜样。",
      "随着{player}在国际舞台上的表现越来越好，中国篮球的国际影响力也在不断提升。"
    ];
    
    const template = this.selectRandomTemplate(relatedTemplates);
    return this.replaceVariables(template, article);
  }

  /**
   * 生成文章结尾段落
   */
  generateClosingParagraph(article) {
    const closingTemplates = [
      "展望未来，{player}的篮球之路还很长，但他已经展现出了成为顶级球员的潜质。相信在不久的将来，我们会看到他在更大的舞台上发光发热。",
      "对于{player}来说，这只是一个开始。他的目标是成为世界级的篮球运动员，为中国篮球争光。从目前的表现来看，这个目标并非遥不可及。",
      "{player}的故事激励着无数热爱篮球的 轻人。他用自己的实际行动证明，只要有梦想、有坚持，就一定能够实现自己的目标。"
    ];
    
    const template = this.selectRandomTemplate(closingTemplates);
    return this.replaceVariables(template, article);
  }
}

module.exports = NewsContentEnhancer;