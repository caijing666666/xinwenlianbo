import { NewsItem, InvestmentAnalysis } from '@/types';
import { 
  getNewsByDate as getNewsFromStorage,
  getAnalysisByDate as getAnalysisFromStorage,
  saveMultipleAnalyses
} from './storage-adapter';

/**
 * 统一的分析数据存储访问层
 * 提供按日期读写新闻和分析结果的函数
 */

/**
 * 获取指定日期的新闻数据
 */
export async function getNewsByDate(date: string): Promise<NewsItem[]> {
  try {
    return await getNewsFromStorage(date);
  } catch (error) {
    console.error(`获取 ${date} 的新闻数据失败:`, error);
    return [];
  }
}

/**
 * 获取指定日期的分析结果
 */
export async function getAnalysisByDate(date: string): Promise<InvestmentAnalysis[]> {
  try {
    return await getAnalysisFromStorage(date);
  } catch (error) {
    console.error(`获取 ${date} 的分析结果失败:`, error);
    return [];
  }
}

/**
 * 检查指定日期是否已有分析结果
 */
export async function hasAnalysisForDate(date: string): Promise<boolean> {
  try {
    const analyses = await getAnalysisByDate(date);
    return analyses.length > 0;
  } catch (error) {
    console.error(`检查 ${date} 分析结果失败:`, error);
    return false;
  }
}

/**
 * 保存指定日期的分析结果
 */
export async function saveAnalysisForDate(
  date: string, 
  analyses: InvestmentAnalysis[]
): Promise<void> {
  try {
    await saveMultipleAnalyses(analyses);
    console.log(`✅ 成功保存 ${date} 的 ${analyses.length} 条分析结果`);
  } catch (error) {
    console.error(`保存 ${date} 的分析结果失败:`, error);
    throw error;
  }
}

/**
 * 检查指定日期是否有新闻数据
 */
export async function hasNewsForDate(date: string): Promise<boolean> {
  try {
    const news = await getNewsByDate(date);
    return news.length > 0;
  } catch (error) {
    console.error(`检查 ${date} 新闻数据失败:`, error);
    return false;
  }
}

/**
 * 获取分析状态信息
 */
export async function getAnalysisStatus(date: string): Promise<{
  hasNews: boolean;
  hasAnalysis: boolean;
  newsCount: number;
  analysisCount: number;
}> {
  try {
    const [news, analyses] = await Promise.all([
      getNewsByDate(date),
      getAnalysisByDate(date)
    ]);

    return {
      hasNews: news.length > 0,
      hasAnalysis: analyses.length > 0,
      newsCount: news.length,
      analysisCount: analyses.length
    };
  } catch (error) {
    console.error(`获取 ${date} 分析状态失败:`, error);
    return {
      hasNews: false,
      hasAnalysis: false,
      newsCount: 0,
      analysisCount: 0
    };
  }
}
