/**
 * 导出本地数据到内存存储
 * 用于生产环境部署
 */

import { getRecentNews, getRecentAnalyses } from '../lib/storage-local';
import fs from 'fs/promises';
import path from 'path';

async function exportData() {
  try {
    console.log('🔄 开始导出本地数据...');
    
    // 获取最近30天的所有数据
    const news = await getRecentNews(30);
    const analyses = await getRecentAnalyses(30);
    
    console.log(`📰 找到 ${news.length} 条新闻`);
    console.log(`📊 找到 ${analyses.length} 条分析`);
    
    // 生成内存存储文件内容
    const memoryStorageContent = `/**
 * 内存存储适配器 - 包含真实数据
 * 注意：这是临时存储，服务重启后数据会丢失
 */

import { NewsItem, InvestmentAnalysis } from '@/types';

// 内存存储
let newsStorage: NewsItem[] = [];
let analysisStorage: InvestmentAnalysis[] = [];

// 初始化真实数据
function initializeRealData() {
  if (newsStorage.length === 0) {
    // 真实新闻数据
    const realNews: NewsItem[] = ${JSON.stringify(news, null, 6)};

    // 真实分析数据
    const realAnalysis: InvestmentAnalysis[] = ${JSON.stringify(analyses, null, 6)};

    newsStorage = realNews;
    analysisStorage = realAnalysis;
    
    console.log(\`✅ 初始化完成: \${newsStorage.length} 条新闻, \${analysisStorage.length} 条分析\`);
  }
}

// 初始化真实数据
initializeRealData();

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
    summary: \`\${date} 共分析 \${analyses.length} 条新闻，整体情绪偏向积极\`
  };
}
`;

    // 写入新的内存存储文件
    const outputPath = path.join(process.cwd(), 'lib', 'storage-memory-real.ts');
    await fs.writeFile(outputPath, memoryStorageContent, 'utf8');
    
    console.log(`✅ 数据导出完成: ${outputPath}`);
    console.log(`📊 包含 ${news.length} 条新闻和 ${analyses.length} 条分析`);
    
    // 按日期统计
    const newsByDate = news.reduce((acc, item) => {
      acc[item.date] = (acc[item.date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📅 新闻按日期分布:');
    Object.entries(newsByDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 10)
      .forEach(([date, count]) => {
        console.log(`  ${date}: ${count} 条`);
      });
      
  } catch (error) {
    console.error('❌ 导出数据失败:', error);
  }
}

exportData();
