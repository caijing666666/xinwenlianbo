import { kv } from '@vercel/kv';
import { NewsItem, InvestmentAnalysis, AnalysisSummary } from '@/types';

// 存储新闻数据
export async function saveNews(news: NewsItem): Promise<void> {
  await kv.set(`news:${news.id}`, news);
  // 使用北京时间中午12点作为该日期的时间戳，确保落在查询范围内
  const dateScore = new Date(news.date + 'T12:00:00+08:00').getTime();
  await kv.zadd('news:by-date', { score: dateScore, member: news.id });
}

// 批量存储新闻
export async function saveMultipleNews(newsList: NewsItem[]): Promise<void> {
  for (const news of newsList) {
    await saveNews(news);
  }
}

// 获取指定日期的新闻
export async function getNewsByDate(date: string): Promise<NewsItem[]> {
  // 使用北京时间 (UTC+8) 计算日期范围
  const startTime = new Date(date + 'T00:00:00+08:00').getTime();
  const endTime = new Date(date + 'T23:59:59+08:00').getTime();
  
  const newsIds = await kv.zrange('news:by-date', startTime, endTime, { byScore: true }) as string[];
  
  if (newsIds.length === 0) return [];
  
  // 使用 mget 批量获取，减少请求次数
  const keys = newsIds.map((id) => `news:${id}`);
  const newsData = await kv.mget<(NewsItem | null)[]>(...keys);
  
  return (newsData || []).filter((news): news is NewsItem => news !== null);
}

// 获取最近N天的新闻
export async function getRecentNews(days: number = 7): Promise<NewsItem[]> {
  // 扩大查询范围，确保能查到所有数据（考虑时区差异）
  const endTime = Date.now() + 24 * 60 * 60 * 1000; // 多加一天
  const startTime = endTime - (days + 2) * 24 * 60 * 60 * 1000; // 多减两天
  
  const newsIds = await kv.zrange('news:by-date', startTime, endTime, { byScore: true }) as string[];
  
  if (newsIds.length === 0) return [];
  
  // 使用 mget 批量获取，减少请求次数（从N次变成1次）
  const keys = newsIds.map((id) => `news:${id}`);
  const newsData = await kv.mget<(NewsItem | null)[]>(...keys);
  
  const newsList = (newsData || []).filter((news): news is NewsItem => news !== null);
  
  return newsList.sort((a: NewsItem, b: NewsItem) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 存储分析结果
export async function saveAnalysis(analysis: InvestmentAnalysis): Promise<void> {
  await kv.set(`analysis:${analysis.newsId}`, analysis);
  // 使用北京时间中午12点作为该日期的时间戳，确保落在查询范围内
  const dateScore = new Date(analysis.newsDate + 'T12:00:00+08:00').getTime();
  await kv.zadd('analysis:by-date', { 
    score: dateScore, 
    member: analysis.newsId 
  });
}

// 批量存储分析结果
export async function saveMultipleAnalyses(analyses: InvestmentAnalysis[]): Promise<void> {
  for (const analysis of analyses) {
    await saveAnalysis(analysis);
  }
}

// 获取指定日期的分析结果
export async function getAnalysisByDate(date: string): Promise<InvestmentAnalysis[]> {
  // 使用北京时间 (UTC+8) 计算日期范围
  const startTime = new Date(date + 'T00:00:00+08:00').getTime();
  const endTime = new Date(date + 'T23:59:59+08:00').getTime();
  
  const newsIds = await kv.zrange('analysis:by-date', startTime, endTime, { byScore: true }) as string[];
  
  if (newsIds.length === 0) return [];
  
  // 使用 mget 批量获取，减少请求次数
  const keys = newsIds.map((id) => `analysis:${id}`);
  const analysisData = await kv.mget<(InvestmentAnalysis | null)[]>(...keys);
  
  return (analysisData || []).filter((a): a is InvestmentAnalysis => a !== null);
}

// 获取最近N天的分析结果
export async function getRecentAnalyses(days: number = 7): Promise<InvestmentAnalysis[]> {
  // 扩大查询范围，确保能查到所有数据（考虑时区差异）
  const endTime = Date.now() + 24 * 60 * 60 * 1000; // 多加一天
  const startTime = endTime - (days + 2) * 24 * 60 * 60 * 1000; // 多减两天
  
  const newsIds = await kv.zrange('analysis:by-date', startTime, endTime, { byScore: true }) as string[];
  
  if (newsIds.length === 0) return [];
  
  // 使用 mget 批量获取，减少请求次数
  const keys = newsIds.map((id) => `analysis:${id}`);
  const analysisData = await kv.mget<(InvestmentAnalysis | null)[]>(...keys);
  
  const analyses = (analysisData || []).filter((a): a is InvestmentAnalysis => a !== null);
  
  return analyses.sort((a: InvestmentAnalysis, b: InvestmentAnalysis) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime());
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
