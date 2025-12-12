import fs from 'fs';
import path from 'path';
import { NewsItem, InvestmentAnalysis } from '@/types';

// 本地数据存储目录
// 在生产环境和开发环境都使用项目下的 data 目录
const DATA_DIR = path.join(process.cwd(), 'data');

const NEWS_DIR = path.join(DATA_DIR, 'news');
const ANALYSIS_DIR = path.join(DATA_DIR, 'analysis');

// 确保目录存在
function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(NEWS_DIR)) fs.mkdirSync(NEWS_DIR, { recursive: true });
  if (!fs.existsSync(ANALYSIS_DIR)) fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
}


// 存储新闻数据
export async function saveNews(news: NewsItem): Promise<void> {
  ensureDirectories();
  const filePath = path.join(NEWS_DIR, `${news.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(news, null, 2), 'utf-8');
}

// 批量存储新闻
export async function saveMultipleNews(newsList: NewsItem[]): Promise<void> {
  for (const news of newsList) {
    await saveNews(news);
  }
}

// 获取指定日期的新闻
export async function getNewsByDate(date: string): Promise<NewsItem[]> {
  ensureDirectories();
  const files = fs.readdirSync(NEWS_DIR);
  const newsList: NewsItem[] = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const content = fs.readFileSync(path.join(NEWS_DIR, file), 'utf-8');
      const news: NewsItem = JSON.parse(content);
      if (news.date === date) {
        newsList.push(news);
      }
    }
  }
  
  return newsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 获取最近N天的新闻
export async function getRecentNews(days: number = 7): Promise<NewsItem[]> {
  ensureDirectories();
  const files = fs.readdirSync(NEWS_DIR);
  const newsList: NewsItem[] = [];
  const endTime = Date.now();
  const startTime = endTime - days * 24 * 60 * 60 * 1000;
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const content = fs.readFileSync(path.join(NEWS_DIR, file), 'utf-8');
      const news: NewsItem = JSON.parse(content);
      const newsTime = new Date(news.date).getTime();
      if (newsTime >= startTime && newsTime <= endTime) {
        newsList.push(news);
      }
    }
  }
  
  return newsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 存储分析结果
export async function saveAnalysis(analysis: InvestmentAnalysis): Promise<void> {
  ensureDirectories();
  const filePath = path.join(ANALYSIS_DIR, `${analysis.newsId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(analysis, null, 2), 'utf-8');
}

// 批量存储分析结果
export async function saveMultipleAnalyses(analyses: InvestmentAnalysis[]): Promise<void> {
  for (const analysis of analyses) {
    await saveAnalysis(analysis);
  }
}

// 获取指定日期的分析结果
export async function getAnalysisByDate(date: string): Promise<InvestmentAnalysis[]> {
  ensureDirectories();
  const files = fs.readdirSync(ANALYSIS_DIR);
  const analyses: InvestmentAnalysis[] = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const content = fs.readFileSync(path.join(ANALYSIS_DIR, file), 'utf-8');
      const analysis: InvestmentAnalysis = JSON.parse(content);
      if (analysis.newsDate === date) {
        analyses.push(analysis);
      }
    }
  }
  
  return analyses.sort((a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime());
}

// 获取最近N天的分析结果
export async function getRecentAnalyses(days: number = 7): Promise<InvestmentAnalysis[]> {
  ensureDirectories();
  const files = fs.readdirSync(ANALYSIS_DIR);
  const analyses: InvestmentAnalysis[] = [];
  const endTime = Date.now();
  const startTime = endTime - days * 24 * 60 * 60 * 1000;
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const content = fs.readFileSync(path.join(ANALYSIS_DIR, file), 'utf-8');
      const analysis: InvestmentAnalysis = JSON.parse(content);
      const analysisTime = new Date(analysis.newsDate).getTime();
      if (analysisTime >= startTime && analysisTime <= endTime) {
        analyses.push(analysis);
      }
    }
  }
  
  return analyses.sort((a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime());
}

// 生成每日分析摘要
export async function generateDailySummary(date: string) {
  const analyses = await getAnalysisByDate(date);
  
  const allIndustries = analyses.flatMap(a => a.industryImpacts);
  const allCompanies = analyses.flatMap(a => a.companyImpacts);
  const allFutures = analyses.flatMap(a => a.futuresImpacts);
  const allBonds = analyses.flatMap(a => a.bondImpacts);
  
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
  
  const sentimentCounts = {
    bullish: analyses.filter(a => a.overallSentiment === 'bullish').length,
    bearish: analyses.filter(a => a.overallSentiment === 'bearish').length,
    neutral: analyses.filter(a => a.overallSentiment === 'neutral').length,
  };
  
  const overallMarketSentiment = 
    sentimentCounts.bullish > sentimentCounts.bearish ? 'bullish' as const :
    sentimentCounts.bearish > sentimentCounts.bullish ? 'bearish' as const : 'neutral' as const;
  
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
