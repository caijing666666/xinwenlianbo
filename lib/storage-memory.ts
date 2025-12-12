/**
 * 内存存储适配器 - 用于演示环境
 * 注意：这是临时存储，服务重启后数据会丢失
 */

import { NewsItem, InvestmentAnalysis } from '@/types';

// 内存存储
let newsStorage: NewsItem[] = [];
let analysisStorage: InvestmentAnalysis[] = [];

// 初始化一些示例数据
function initializeSampleData() {
  if (newsStorage.length === 0) {
    // 添加丰富的示例新闻数据
    const sampleNews: NewsItem[] = [
      // 2025-11-29 的新闻
      {
        id: '2025-11-29-0',
        date: '2025-11-29',
        title: '国务院常务会议：加强科技创新支撑现代化产业体系建设',
        content: '会议强调要深入实施创新驱动发展战略，加快建设现代化产业体系，推动经济高质量发展。重点支持人工智能、新能源、生物技术等战略性新兴产业。',
        scrapedAt: new Date().toISOString()
      },
      {
        id: '2025-11-29-1',
        date: '2025-11-29',
        title: '央行宣布降准0.5个百分点 释放流动性约1万亿元',
        content: '中国人民银行决定于12月15日下调金融机构存款准备金率0.5个百分点，释放长期资金约1万亿元，支持实体经济发展。',
        scrapedAt: new Date().toISOString()
      },
      {
        id: '2025-11-29-2',
        date: '2025-11-29',
        title: '国家能源局：新能源装机容量突破15亿千瓦',
        content: '截至11月底，全国新能源装机容量达到15.2亿千瓦，同比增长35%，其中风电、光伏发电装机分别达到4.8亿千瓦和6.2亿千瓦。',
        scrapedAt: new Date().toISOString()
      },
      {
        id: '2025-11-29-3',
        date: '2025-11-29',
        title: '工信部：推进5G-A商用部署 加快6G技术研发',
        content: '工业和信息化部表示，将加快5G-Advanced商用部署，同时启动6G技术预研，力争在2030年实现6G商用。',
        scrapedAt: new Date().toISOString()
      },
      // 2025-11-28 的新闻
      {
        id: '2025-11-28-0',
        date: '2025-11-28',
        title: '中央经济工作会议部署明年经济工作重点任务',
        content: '会议强调要坚持稳中求进工作总基调，完整、准确、全面贯彻新发展理念，加快构建新发展格局，着力推动高质量发展。',
        scrapedAt: new Date().toISOString()
      },
      {
        id: '2025-11-28-1', 
        date: '2025-11-28',
        title: '国家发改委：推动重大项目建设提质增效',
        content: '国家发改委表示，将继续发挥投资关键作用，推动重大项目建设，促进经济平稳健康发展。',
        scrapedAt: new Date().toISOString()
      },
      {
        id: '2025-11-28-2',
        date: '2025-11-28',
        title: '商务部：前11个月实际使用外资同比增长8.3%',
        content: '1-11月全国实际使用外资金额1.09万亿元人民币，同比增长8.3%，高技术产业实际使用外资增长15.2%。',
        scrapedAt: new Date().toISOString()
      }
    ];

    const sampleAnalysis: InvestmentAnalysis[] = [
      // 2025-11-29 的分析
      {
        newsId: '2025-11-29-0',
        newsDate: '2025-11-29',
        newsTitle: '国务院常务会议：加强科技创新支撑现代化产业体系建设',
        newsContent: '会议强调要深入实施创新驱动发展战略，加快建设现代化产业体系，推动经济高质量发展。重点支持人工智能、新能源、生物技术等战略性新兴产业。',
        investmentOpportunityScore: 90,
        industryImpacts: [
          {
            industryName: '科技创新',
            impactScore: 90,
            impactType: 'positive',
            confidence: 0.90,
            reasoning: '政策大力支持科技创新，相关产业将获得重点扶持',
            keywords: ['科技', '创新', '产业']
          }
        ],
        companyImpacts: [
          {
            companyName: '华为技术',
            stockCode: '002502',
            exchange: 'SZSE',
            impactScore: 85,
            impactType: 'positive',
            confidence: 0.85,
            reasoning: '科技创新政策利好，龙头科技企业将直接受益',
            relatedIndustries: ['科技创新']
          }
        ],
        futuresImpacts: [
          {
            commodity: '工业硅',
            exchange: '广期所',
            impactScore: 80,
            impactType: 'positive',
            confidence: 0.80,
            reasoning: '现代化产业体系建设将带动工业原料需求'
          }
        ],
        bondImpacts: [
          {
            bondType: '科创债',
            impactScore: 85,
            impactType: 'positive',
            confidence: 0.85,
            reasoning: '科技创新政策支持将促进科创债发行'
          }
        ],
        overallSentiment: 'bullish',
        summary: '政策大力支持科技创新和现代化产业体系建设，科技板块投资机会显著。',
        analyzedAt: new Date().toISOString()
      },
      {
        newsId: '2025-11-29-1',
        newsDate: '2025-11-29',
        newsTitle: '央行宣布降准0.5个百分点 释放流动性约1万亿元',
        newsContent: '中国人民银行决定于12月15日下调金融机构存款准备金率0.5个百分点，释放长期资金约1万亿元，支持实体经济发展。',
        investmentOpportunityScore: 85,
        industryImpacts: [
          {
            industryName: '银行业',
            impactScore: 85,
            impactType: 'positive',
            confidence: 0.85,
            reasoning: '降准释放流动性，银行放贷能力增强，利好银行股',
            keywords: ['降准', '流动性', '银行']
          }
        ],
        companyImpacts: [
          {
            companyName: '招商银行',
            stockCode: '600036',
            exchange: 'SSE',
            impactScore: 80,
            impactType: 'positive',
            confidence: 0.80,
            reasoning: '降准政策利好银行业，优质银行股将受益',
            relatedIndustries: ['银行业']
          }
        ],
        futuresImpacts: [
          {
            commodity: '国债期货',
            exchange: '中金所',
            impactScore: 75,
            impactType: 'positive',
            confidence: 0.75,
            reasoning: '流动性宽松预期推高债券价格'
          }
        ],
        bondImpacts: [
          {
            bondType: '国债',
            impactScore: 80,
            impactType: 'positive',
            confidence: 0.80,
            reasoning: '降准释放流动性，债券市场受益'
          }
        ],
        overallSentiment: 'bullish',
        summary: '央行降准释放万亿流动性，银行股和债券市场迎来利好，宽松货币政策支撑市场流动性。',
        analyzedAt: new Date().toISOString()
      },
      {
        newsId: '2025-11-29-2',
        newsDate: '2025-11-29',
        newsTitle: '国家能源局：新能源装机容量突破15亿千瓦',
        newsContent: '截至11月底，全国新能源装机容量达到15.2亿千瓦，同比增长35%，其中风电、光伏发电装机分别达到4.8亿千瓦和6.2亿千瓦。',
        investmentOpportunityScore: 88,
        industryImpacts: [
          {
            industryName: '新能源',
            impactScore: 88,
            impactType: 'positive',
            confidence: 0.88,
            reasoning: '新能源装机快速增长，行业景气度持续提升',
            keywords: ['新能源', '风电', '光伏']
          }
        ],
        companyImpacts: [
          {
            companyName: '隆基绿能',
            stockCode: '601012',
            exchange: 'SSE',
            impactScore: 85,
            impactType: 'positive',
            confidence: 0.85,
            reasoning: '光伏龙头企业，新能源装机增长直接利好',
            relatedIndustries: ['新能源']
          }
        ],
        futuresImpacts: [
          {
            commodity: '硅铁',
            exchange: '郑商所',
            impactScore: 82,
            impactType: 'positive',
            confidence: 0.82,
            reasoning: '光伏产业快速发展带动硅料需求增长'
          }
        ],
        bondImpacts: [
          {
            bondType: '绿色债券',
            impactScore: 85,
            impactType: 'positive',
            confidence: 0.85,
            reasoning: '新能源发展推动绿色金融市场扩容'
          }
        ],
        overallSentiment: 'bullish',
        summary: '新能源装机容量快速增长，风电光伏产业链迎来黄金发展期，相关龙头企业投资价值凸显。',
        analyzedAt: new Date().toISOString()
      },
      {
        newsId: '2025-11-28-0',
        newsDate: '2025-11-28',
        newsTitle: '中央经济工作会议部署明年经济工作重点任务',
        newsContent: '会议强调要坚持稳中求进工作总基调，完整、准确、全面贯彻新发展理念，加快构建新发展格局，着力推动高质量发展。',
        investmentOpportunityScore: 85,
        industryImpacts: [
          {
            industryName: '基础设施建设',
            impactScore: 85,
            impactType: 'positive',
            confidence: 0.85,
            reasoning: '会议强调推动高质量发展，基建投资将获得政策支持',
            keywords: ['基建', '投资']
          }
        ],
        companyImpacts: [
          {
            companyName: '中国建筑',
            stockCode: '601668',
            exchange: 'SSE',
            impactScore: 80,
            impactType: 'positive',
            confidence: 0.80,
            reasoning: '作为基建龙头，将直接受益于重大项目建设',
            relatedIndustries: ['基础设施建设']
          }
        ],
        futuresImpacts: [
          {
            commodity: '钢铁',
            exchange: '上期所',
            impactScore: 75,
            impactType: 'positive', 
            confidence: 0.75,
            reasoning: '基建投资增加将带动钢铁需求'
          }
        ],
        bondImpacts: [
          {
            bondType: '地方政府债',
            impactScore: 70,
            impactType: 'positive',
            confidence: 0.70,
            reasoning: '地方基建项目融资需求增加'
          }
        ],
        overallSentiment: 'bullish',
        summary: '政策支持基建投资，高质量发展成为重点。需关注政策执行力度。',
        analyzedAt: new Date().toISOString()
      }
    ];

    newsStorage = sampleNews;
    analysisStorage = sampleAnalysis;
  }
}

// 初始化示例数据
initializeSampleData();

export async function saveNews(news: NewsItem): Promise<void> {
  const existingIndex = newsStorage.findIndex(n => n.id === news.id);
  if (existingIndex >= 0) {
    newsStorage[existingIndex] = news;
  } else {
    newsStorage.push(news);
  }
}

export async function saveMultipleNews(newsList: NewsItem[]): Promise<void> {
  for (const news of newsList) {
    await saveNews(news);
  }
}

export async function getNewsByDate(date: string): Promise<NewsItem[]> {
  return newsStorage.filter(news => news.date === date);
}

export async function getRecentNews(days: number): Promise<NewsItem[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return newsStorage.filter(news => {
    const newsDate = new Date(news.date);
    return newsDate >= cutoffDate;
  }).sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveAnalysis(analysis: InvestmentAnalysis): Promise<void> {
  const existingIndex = analysisStorage.findIndex(a => a.newsId === analysis.newsId);
  if (existingIndex >= 0) {
    analysisStorage[existingIndex] = analysis;
  } else {
    analysisStorage.push(analysis);
  }
}

export async function saveMultipleAnalyses(analyses: InvestmentAnalysis[]): Promise<void> {
  for (const analysis of analyses) {
    await saveAnalysis(analysis);
  }
}

export async function getAnalysisByDate(date: string): Promise<InvestmentAnalysis[]> {
  return analysisStorage.filter(analysis => analysis.newsDate === date);
}

export async function getRecentAnalyses(days: number): Promise<InvestmentAnalysis[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return analysisStorage.filter(analysis => {
    const analysisDate = new Date(analysis.newsDate);
    return analysisDate >= cutoffDate;
  }).sort((a, b) => b.newsDate.localeCompare(a.newsDate));
}

export async function generateDailySummary(date: string): Promise<any> {
  const analyses = await getAnalysisByDate(date);
  
  if (analyses.length === 0) {
    return null;
  }

  // 简单的汇总逻辑
  const positiveCount = analyses.filter(a => a.overallSentiment === 'bullish').length;
  const neutralCount = analyses.filter(a => a.overallSentiment === 'neutral').length;
  const negativeCount = analyses.filter(a => a.overallSentiment === 'bearish').length;

  return {
    date,
    totalAnalyses: analyses.length,
    sentimentDistribution: {
      positive: positiveCount,
      neutral: neutralCount,
      negative: negativeCount
    },
    topIndustries: ['基础设施建设', '科技', '新能源'],
    summary: `${date} 共分析 ${analyses.length} 条新闻，整体情绪偏向积极`
  };
}
