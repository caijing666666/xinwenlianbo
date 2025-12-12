import { NewsItem, InvestmentAnalysis, AnalysisSummary } from '@/types';
import { sampleNews, sampleAnalyses } from './sample-data';

// 简单的内存存储（用于演示）
let newsData: NewsItem[] = [...sampleNews];
let analysisData: InvestmentAnalysis[] = [...sampleAnalyses];

// 存储新闻数据
export async function saveNews(news: NewsItem): Promise<void> {
  const existingIndex = newsData.findIndex(n => n.id === news.id);
  if (existingIndex >= 0) {
    newsData[existingIndex] = news;
  } else {
    newsData.push(news);
  }
}

// 批量存储新闻
export async function saveMultipleNews(newsList: NewsItem[]): Promise<void> {
  for (const news of newsList) {
    await saveNews(news);
  }
}

// 获取指定日期的新闻
export async function getNewsByDate(date: string): Promise<NewsItem[]> {
  return newsData.filter(news => {
    const newsDate = new Date(news.date).toISOString().split('T')[0];
    return newsDate === date;
  });
}

// 获取最近N天的新闻
export async function getRecentNews(days: number = 7): Promise<NewsItem[]> {
  const endTime = Date.now();
  const startTime = endTime - days * 24 * 60 * 60 * 1000;
  
  return newsData
    .filter(news => {
      const newsTime = new Date(news.date).getTime();
      return newsTime >= startTime && newsTime <= endTime;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 存储分析结果
export async function saveAnalysis(analysis: InvestmentAnalysis): Promise<void> {
  const existingIndex = analysisData.findIndex(a => a.newsId === analysis.newsId);
  if (existingIndex >= 0) {
    analysisData[existingIndex] = analysis;
  } else {
    analysisData.push(analysis);
  }
}

// 批量存储分析结果
export async function saveMultipleAnalyses(analyses: InvestmentAnalysis[]): Promise<void> {
  for (const analysis of analyses) {
    await saveAnalysis(analysis);
  }
}

// 获取指定日期的分析结果
export async function getAnalysisByDate(date: string): Promise<InvestmentAnalysis[]> {
  return analysisData.filter(analysis => {
    const analysisDate = new Date(analysis.newsDate).toISOString().split('T')[0];
    return analysisDate === date;
  });
}

// 获取最近N天的分析结果
export async function getRecentAnalyses(days: number = 7): Promise<InvestmentAnalysis[]> {
  const endTime = Date.now();
  const startTime = endTime - days * 24 * 60 * 60 * 1000;
  
  return analysisData
    .filter(analysis => {
      const analysisTime = new Date(analysis.newsDate).getTime();
      return analysisTime >= startTime && analysisTime <= endTime;
    })
    .sort((a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime());
}

// 生成每日分析摘要
export async function generateDailySummary(date: string): Promise<AnalysisSummary> {
  const analyses = await getAnalysisByDate(date);
  
  // 汇总所有影响
  const allIndustries = analyses.flatMap(a => a.industryImpacts);
  const allCompanies = analyses.flatMap(a => a.companyImpacts);
  const allFutures = analyses.flatMap(a => a.futuresImpacts);
  const allBonds = analyses.flatMap(a => a.bondImpacts);
  
  // 按评分排序并取前10
  const topIndustries = allIndustries
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 10);
  
  const topCompanies = allCompanies
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 10);
  
  const topFutures = allFutures
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 10);
  
  const bondMarketOutlook = allBonds
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 5);
  
  // 计算整体情绪
  const sentimentCounts = {
    bullish: analyses.filter(a => a.overallSentiment === 'bullish').length,
    bearish: analyses.filter(a => a.overallSentiment === 'bearish').length,
    neutral: analyses.filter(a => a.overallSentiment === 'neutral').length,
  };
  
  const overallMarketSentiment = 
    sentimentCounts.bullish > sentimentCounts.bearish ? 'bullish' :
    sentimentCounts.bearish > sentimentCounts.bullish ? 'bearish' : 'neutral';
  
  return {
    date,
    totalNewsCount: analyses.length,
    topIndustries,
    topCompanies,
    topFutures,
    bondMarketOutlook,
    overallMarketSentiment,
  };
}
