import { NewsItem, InvestmentAnalysis } from '@/types';

// 示例新闻数据
export const sampleNews: NewsItem[] = [
  // 今天的新闻
  {
    id: 'news-001',
    title: '央行宣布降准0.5个百分点，释放流动性约1万亿元',
    content: '中国人民银行决定于2025年11月28日降准0.5个百分点，此次降准将释放长期资金约1万亿元，旨在保持银行体系流动性合理充裕，支持实体经济发展。',
    date: '2025-11-28T19:00:00Z',
    scrapedAt: '2025-11-28T19:30:00Z'
  },
  {
    id: 'news-002', 
    title: '国家发改委：前三季度GDP同比增长5.2%',
    content: '国家发展改革委发布数据显示，前三季度国内生产总值同比增长5.2%，经济运行总体平稳，高质量发展扎实推进。',
    date: '2025-11-28T19:05:00Z',
    scrapedAt: '2025-11-28T19:30:00Z'
  },
  {
    id: 'news-003',
    title: '工信部：新能源汽车产销量连续9年全球第一',
    content: '工业和信息化部数据显示，我国新能源汽车产销量连续9年保持全球第一，前10月产销分别完成735.2万辆和728万辆。',
    date: '2025-11-28T19:10:00Z',
    scrapedAt: '2025-11-28T19:30:00Z'
  },
  
  // 昨天的新闻
  {
    id: 'news-004',
    title: '国务院：推进新一轮财税体制改革',
    content: '国务院发布关于推进新一轮财税体制改革的意见，将进一步完善税收制度，优化财政支出结构，提高财政资金使用效率。',
    date: '2025-11-27T19:00:00Z',
    scrapedAt: '2025-11-27T19:30:00Z'
  },
  {
    id: 'news-005',
    title: '商务部：前10月实际使用外资同比增长8.4%',
    content: '商务部数据显示，前10月全国实际使用外资金额同比增长8.4%，高技术产业实际使用外资增长15.2%。',
    date: '2025-11-27T19:05:00Z',
    scrapedAt: '2025-11-27T19:30:00Z'
  },
  
  // 前天的新闻
  {
    id: 'news-006',
    title: '证监会：完善资本市场基础制度建设',
    content: '证监会表示将继续完善资本市场基础制度建设，推进注册制改革，加强投资者保护，促进资本市场健康发展。',
    date: '2025-11-26T19:00:00Z',
    scrapedAt: '2025-11-26T19:30:00Z'
  },
  {
    id: 'news-007',
    title: '农业农村部：秋粮收获接近尾声，丰收已成定局',
    content: '农业农村部最新数据显示，全国秋粮收获接近尾声，预计全年粮食产量将再创历史新高，丰收已成定局。',
    date: '2025-11-26T19:05:00Z',
    scrapedAt: '2025-11-26T19:30:00Z'
  }
];

// 示例分析数据
export const sampleAnalyses: InvestmentAnalysis[] = [
  {
    newsId: 'news-001',
    newsTitle: '央行宣布降准0.5个百分点，释放流动性约1万亿元',
    newsDate: '2025-11-28T19:00:00Z',
    newsContent: '中国人民银行决定于2025年11月28日降准0.5个百分点，此次降准将释放长期资金约1万亿元，旨在保持银行体系流动性合理充裕，支持实体经济发展。',
    overallSentiment: 'bullish',
    investmentOpportunityScore: 85,
    summary: '央行降准释放流动性，利好银行、房地产等行业，债券市场表现积极',
    analyzedAt: '2025-11-28T20:00:00Z',
    industryImpacts: [
      {
        industryName: '银行业',
        impactType: 'positive',
        impactScore: 85,
        reasoning: '降准释放流动性，银行可贷资金增加，有利于银行放贷业务',
        keywords: ['降准', '流动性', '银行'],
        confidence: 0.9
      },
      {
        industryName: '房地产',
        impactType: 'positive', 
        impactScore: 75,
        reasoning: '流动性增加有助于降低融资成本，利好房地产行业',
        keywords: ['流动性', '融资成本', '房地产'],
        confidence: 0.8
      }
    ],
    companyImpacts: [
      {
        companyName: '工商银行',
        stockCode: '601398',
        exchange: 'SSE',
        impactType: 'positive',
        impactScore: 80,
        reasoning: '作为大型银行，降准直接增加可贷资金',
        relatedIndustries: ['银行业'],
        confidence: 0.85,
        estimatedPriceImpact: '+2-4%'
      },
      {
        companyName: '万科A',
        stockCode: '000002',
        exchange: 'SZSE',
        impactType: 'positive',
        impactScore: 70,
        reasoning: '房地产龙头企业受益于流动性宽松',
        relatedIndustries: ['房地产'],
        confidence: 0.75,
        estimatedPriceImpact: '+1-3%'
      }
    ],
    futuresImpacts: [
      {
        commodity: '10年期国债期货',
        commodityCode: 'T',
        exchange: '中金所',
        impactType: 'positive',
        impactScore: 75,
        reasoning: '流动性宽松推动债券价格上涨',
        priceDirection: 'up',
        confidence: 0.8
      }
    ],
    bondImpacts: [
      {
        bondType: '国债',
        impactType: 'positive',
        impactScore: 80,
        reasoning: '央行降准增加市场流动性，债券需求增加',
        yieldDirection: 'down',
        riskLevel: 'low',
        confidence: 0.85
      }
    ]
  },
  {
    newsId: 'news-002',
    newsTitle: '国家发改委：前三季度GDP同比增长5.2%',
    newsDate: '2025-11-28T19:05:00Z',
    newsContent: '国家发展改革委发布数据显示，前三季度国内生产总值同比增长5.2%，经济运行总体平稳，高质量发展扎实推进。',
    overallSentiment: 'neutral',
    investmentOpportunityScore: 65,
    summary: 'GDP增长符合预期，经济运行平稳，对各行业影响相对温和',
    analyzedAt: '2025-11-28T20:05:00Z',
    industryImpacts: [
      {
        industryName: '制造业',
        impactType: 'positive',
        impactScore: 65,
        reasoning: 'GDP增长体现制造业稳定发展',
        keywords: ['GDP', '制造业', '增长'],
        confidence: 0.7
      }
    ],
    companyImpacts: [
      {
        companyName: '中国平安',
        stockCode: '601318',
        exchange: 'SSE',
        impactType: 'neutral',
        impactScore: 60,
        reasoning: '经济稳定增长对保险业整体利好',
        relatedIndustries: ['保险业'],
        confidence: 0.6
      }
    ],
    futuresImpacts: [
      {
        commodity: '沪深300指数期货',
        commodityCode: 'IF',
        exchange: '中金所',
        impactType: 'positive',
        impactScore: 65,
        reasoning: 'GDP增长支撑股指期货',
        priceDirection: 'up',
        confidence: 0.7
      }
    ],
    bondImpacts: [
      {
        bondType: '企业债',
        impactType: 'positive',
        impactScore: 60,
        reasoning: '经济增长降低企业违约风险',
        yieldDirection: 'stable',
        riskLevel: 'medium',
        confidence: 0.65
      }
    ]
  },
  
  // 昨天的分析
  {
    newsId: 'news-004',
    newsTitle: '国务院：推进新一轮财税体制改革',
    newsDate: '2025-11-27T19:00:00Z',
    newsContent: '国务院发布关于推进新一轮财税体制改革的意见，将进一步完善税收制度，优化财政支出结构，提高财政资金使用效率。',
    overallSentiment: 'neutral',
    investmentOpportunityScore: 70,
    summary: '财税体制改革将优化税收结构，对相关行业产生结构性影响',
    analyzedAt: '2025-11-27T20:00:00Z',
    industryImpacts: [
      {
        industryName: '税务服务',
        impactType: 'positive',
        impactScore: 75,
        reasoning: '财税改革将增加对专业税务服务的需求',
        keywords: ['财税改革', '税收制度', '税务服务'],
        confidence: 0.8
      },
      {
        industryName: '软件服务',
        impactType: 'positive',
        impactScore: 70,
        reasoning: '税收制度改革需要相应的软件系统支持',
        keywords: ['财税', '软件', '系统'],
        confidence: 0.75
      }
    ],
    companyImpacts: [
      {
        companyName: '航天信息',
        stockCode: '600271',
        exchange: 'SSE',
        impactType: 'positive',
        impactScore: 78,
        reasoning: '作为税控设备龙头，将受益于税制改革',
        relatedIndustries: ['税务服务', '软件服务'],
        confidence: 0.8,
        estimatedPriceImpact: '+2-5%'
      }
    ],
    futuresImpacts: [],
    bondImpacts: [
      {
        bondType: '地方债',
        impactType: 'positive',
        impactScore: 65,
        reasoning: '财政体制改革有利于地方债务管理',
        yieldDirection: 'stable',
        riskLevel: 'medium',
        confidence: 0.7
      }
    ]
  },
  
  {
    newsId: 'news-005',
    newsTitle: '商务部：前10月实际使用外资同比增长8.4%',
    newsDate: '2025-11-27T19:05:00Z',
    newsContent: '商务部数据显示，前10月全国实际使用外资金额同比增长8.4%，高技术产业实际使用外资增长15.2%。',
    overallSentiment: 'bullish',
    investmentOpportunityScore: 80,
    summary: '外资持续流入，特别是高技术产业，显示经济吸引力',
    analyzedAt: '2025-11-27T20:05:00Z',
    industryImpacts: [
      {
        industryName: '高技术产业',
        impactType: 'positive',
        impactScore: 85,
        reasoning: '外资大幅流入高技术产业，行业前景看好',
        keywords: ['外资', '高技术', '投资'],
        confidence: 0.9
      },
      {
        industryName: '制造业',
        impactType: 'positive',
        impactScore: 75,
        reasoning: '外资增长带动制造业升级',
        keywords: ['外资', '制造业', '升级'],
        confidence: 0.8
      }
    ],
    companyImpacts: [
      {
        companyName: '比亚迪',
        stockCode: '002594',
        exchange: 'SZSE',
        impactType: 'positive',
        impactScore: 82,
        reasoning: '新能源汽车领域外资关注度高',
        relatedIndustries: ['高技术产业', '制造业'],
        confidence: 0.85,
        estimatedPriceImpact: '+3-6%'
      }
    ],
    futuresImpacts: [
      {
        commodity: '人民币汇率',
        commodityCode: 'USDCNY',
        exchange: '外汇市场',
        impactType: 'positive',
        impactScore: 70,
        reasoning: '外资流入支撑人民币汇率',
        priceDirection: 'up',
        confidence: 0.75
      }
    ],
    bondImpacts: []
  },
  
  // 前天的分析
  {
    newsId: 'news-006',
    newsTitle: '证监会：完善资本市场基础制度建设',
    newsDate: '2025-11-26T19:00:00Z',
    newsContent: '证监会表示将继续完善资本市场基础制度建设，推进注册制改革，加强投资者保护，促进资本市场健康发展。',
    overallSentiment: 'bullish',
    investmentOpportunityScore: 85,
    summary: '资本市场制度完善，长期利好市场发展和投资者信心',
    analyzedAt: '2025-11-26T20:00:00Z',
    industryImpacts: [
      {
        industryName: '证券业',
        impactType: 'positive',
        impactScore: 90,
        reasoning: '资本市场制度完善直接利好证券行业',
        keywords: ['资本市场', '注册制', '证券'],
        confidence: 0.95
      },
      {
        industryName: '银行业',
        impactType: 'positive',
        impactScore: 75,
        reasoning: '资本市场发展促进银行投行业务',
        keywords: ['资本市场', '投行', '银行'],
        confidence: 0.8
      }
    ],
    companyImpacts: [
      {
        companyName: '中信证券',
        stockCode: '600030',
        exchange: 'SSE',
        impactType: 'positive',
        impactScore: 88,
        reasoning: '头部券商将充分受益于制度完善',
        relatedIndustries: ['证券业'],
        confidence: 0.9,
        estimatedPriceImpact: '+4-7%'
      },
      {
        companyName: '招商银行',
        stockCode: '600036',
        exchange: 'SSE',
        impactType: 'positive',
        impactScore: 72,
        reasoning: '资本市场发展利好银行财富管理业务',
        relatedIndustries: ['银行业'],
        confidence: 0.75,
        estimatedPriceImpact: '+2-4%'
      }
    ],
    futuresImpacts: [
      {
        commodity: '沪深300指数期货',
        commodityCode: 'IF',
        exchange: '中金所',
        impactType: 'positive',
        impactScore: 80,
        reasoning: '资本市场制度完善提振股指期货',
        priceDirection: 'up',
        confidence: 0.85
      }
    ],
    bondImpacts: []
  }
];
