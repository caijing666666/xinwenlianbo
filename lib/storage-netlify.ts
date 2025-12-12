import { NewsItem, InvestmentAnalysis } from '@/types';

// Netlify环境存储适配器 - 使用构建时的数据目录
// 注意：Netlify无法在运行时写入文件，只能读取构建时包含的文件

// 内存缓存
let newsCache: Map<string, NewsItem[]> | null = null;
let analysisCache: Map<string, InvestmentAnalysis[]> | null = null;

// 从data目录加载数据到内存
async function loadDataToCache() {
  if (newsCache && analysisCache) return;
  
  try {
    // 尝试从构建时的data目录读取数据
    const fs = await import('fs');
    const path = await import('path');
    
    const DATA_DIR = path.join(process.cwd(), 'data');
    const NEWS_DIR = path.join(DATA_DIR, 'news');
    const ANALYSIS_DIR = path.join(DATA_DIR, 'analysis');
    
    newsCache = new Map();
    analysisCache = new Map();
    
    // 加载新闻数据
    if (fs.existsSync(NEWS_DIR)) {
      const newsFiles = fs.readdirSync(NEWS_DIR);
      for (const file of newsFiles) {
        if (file.endsWith('.json')) {
          try {
            const content = fs.readFileSync(path.join(NEWS_DIR, file), 'utf-8');
            const news: NewsItem = JSON.parse(content);
            const dateKey = news.date;
            if (!newsCache.has(dateKey)) {
              newsCache.set(dateKey, []);
            }
            newsCache.get(dateKey)!.push(news);
          } catch (error) {
            console.warn(`跳过无效新闻文件: ${file}`, error);
          }
        }
      }
    }
    
    // 加载分析数据
    if (fs.existsSync(ANALYSIS_DIR)) {
      const analysisFiles = fs.readdirSync(ANALYSIS_DIR);
      for (const file of analysisFiles) {
        if (file.endsWith('.json')) {
          try {
            const content = fs.readFileSync(path.join(ANALYSIS_DIR, file), 'utf-8');
            const analysis: InvestmentAnalysis = JSON.parse(content);
            const dateKey = analysis.newsDate;
            if (!analysisCache.has(dateKey)) {
              analysisCache.set(dateKey, []);
            }
            analysisCache.get(dateKey)!.push(analysis);
          } catch (error) {
            console.warn(`跳过无效分析文件: ${file}`, error);
          }
        }
      }
    }
    
    console.log(`📚 Netlify存储: 加载了 ${Array.from(newsCache.values()).flat().length} 条新闻, ${Array.from(analysisCache.values()).flat().length} 条分析`);
    
  } catch (error) {
    console.warn('⚠️ Netlify存储: 无法加载数据目录，使用空缓存', error);
    newsCache = new Map();
    analysisCache = new Map();
  }
}

// 存储新闻数据 (Netlify环境下只能缓存到内存)
export async function saveNews(news: NewsItem): Promise<void> {
  await loadDataToCache();
  const dateKey = news.date;
  if (!newsCache!.has(dateKey)) {
    newsCache!.set(dateKey, []);
  }
  // 检查是否已存在
  const existing = newsCache!.get(dateKey)!.find(n => n.id === news.id);
  if (!existing) {
    newsCache!.get(dateKey)!.push(news);
    console.log(`💾 Netlify存储: 缓存新闻 ${news.id}`);
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
  await loadDataToCache();
  return newsCache!.get(date) || [];
}

// 获取最近N天的新闻
export async function getRecentNews(days: number = 7): Promise<NewsItem[]> {
  await loadDataToCache();
  const allNews: NewsItem[] = [];
  const endTime = Date.now();
  const startTime = endTime - days * 24 * 60 * 60 * 1000;
  
  newsCache!.forEach((newsList, date) => {
    const dateTime = new Date(date).getTime();
    if (dateTime >= startTime && dateTime <= endTime) {
      allNews.push(...newsList);
    }
  });
  
  return allNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 存储分析结果 (Netlify环境下只能缓存到内存)
export async function saveAnalysis(analysis: InvestmentAnalysis): Promise<void> {
  await loadDataToCache();
  const dateKey = analysis.newsDate;
  if (!analysisCache!.has(dateKey)) {
    analysisCache!.set(dateKey, []);
  }
  // 检查是否已存在
  const existing = analysisCache!.get(dateKey)!.find(a => a.newsId === analysis.newsId);
  if (!existing) {
    analysisCache!.get(dateKey)!.push(analysis);
    console.log(`💾 Netlify存储: 缓存分析 ${analysis.newsId}`);
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
  await loadDataToCache();
  return analysisCache!.get(date) || [];
}

// 获取最近N天的分析结果
export async function getRecentAnalyses(days: number = 7): Promise<InvestmentAnalysis[]> {
  await loadDataToCache();
  const allAnalyses: InvestmentAnalysis[] = [];
  const endTime = Date.now();
  const startTime = endTime - days * 24 * 60 * 60 * 1000;
  
  analysisCache!.forEach((analysesList, date) => {
    const dateTime = new Date(date).getTime();
    if (dateTime >= startTime && dateTime <= endTime) {
      allAnalyses.push(...analysesList);
    }
  });
  
  return allAnalyses.sort((a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime());
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
