import { NextRequest, NextResponse } from 'next/server';
import { getRecentNews, getRecentAnalyses } from '@/lib/storage-adapter';
import { NewsItem, InvestmentAnalysis } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    // 获取过去N天的新闻和分析数据
    const [newsList, analysesList] = await Promise.all([
      getRecentNews(days),
      getRecentAnalyses(days)
    ]);

    // 按日期分组数据
    const dailyData = groupDataByDate(newsList, analysesList);
    
    // 生成统计数据
    const statistics = generateMonthlyStatistics(analysesList);

    return NextResponse.json({
      success: true,
      data: {
        dailyData,
        statistics,
        totalDays: days,
        newsCount: newsList.length,
        analysisCount: analysesList.length
      }
    });
  } catch (error) {
    console.error('获取月度数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取数据失败'
      },
      { status: 500 }
    );
  }
}

// 按日期分组数据
function groupDataByDate(newsList: NewsItem[], analysesList: InvestmentAnalysis[]) {
  const dailyMap = new Map<string, {
    date: string;
    news: NewsItem[];
    analyses: InvestmentAnalysis[];
  }>();

  // 处理新闻数据
  newsList.forEach(news => {
    const dateKey = news.date.split('T')[0];
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        news: [],
        analyses: []
      });
    }
    dailyMap.get(dateKey)!.news.push(news);
  });

  // 处理分析数据
  analysesList.forEach(analysis => {
    const dateKey = analysis.newsDate.split('T')[0];
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        news: [],
        analyses: []
      });
    }
    dailyMap.get(dateKey)!.analyses.push(analysis);
  });

  // 转换为数组并按日期排序
  return Array.from(dailyMap.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 生成月度统计数据
function generateMonthlyStatistics(analysesList: InvestmentAnalysis[]) {
  const industries = new Map<string, { count: number; avgScore: number; totalScore: number }>();
  const companies = new Map<string, { count: number; avgScore: number; totalScore: number; stockCode: string }>();
  const futures = new Map<string, { count: number; avgScore: number; totalScore: number }>();
  const bonds = new Map<string, { count: number; avgScore: number; totalScore: number }>();
  
  let sentimentCounts = { bullish: 0, bearish: 0, neutral: 0 };

  analysesList.forEach(analysis => {
    // 统计情绪
    sentimentCounts[analysis.overallSentiment]++;

    // 统计行业影响
    analysis.industryImpacts.forEach(impact => {
      const key = impact.industryName;
      if (!industries.has(key)) {
        industries.set(key, { count: 0, avgScore: 0, totalScore: 0 });
      }
      const industry = industries.get(key)!;
      industry.count++;
      industry.totalScore += impact.impactScore;
      industry.avgScore = industry.totalScore / industry.count;
    });

    // 统计公司影响
    analysis.companyImpacts.forEach(impact => {
      const key = impact.companyName;
      if (!companies.has(key)) {
        companies.set(key, { 
          count: 0, 
          avgScore: 0, 
          totalScore: 0, 
          stockCode: impact.stockCode 
        });
      }
      const company = companies.get(key)!;
      company.count++;
      company.totalScore += impact.impactScore;
      company.avgScore = company.totalScore / company.count;
    });

    // 统计期货影响
    analysis.futuresImpacts.forEach(impact => {
      const key = impact.commodity;
      if (!futures.has(key)) {
        futures.set(key, { count: 0, avgScore: 0, totalScore: 0 });
      }
      const future = futures.get(key)!;
      future.count++;
      future.totalScore += impact.impactScore;
      future.avgScore = future.totalScore / future.count;
    });

    // 统计债券影响
    analysis.bondImpacts.forEach(impact => {
      const key = impact.bondType;
      if (!bonds.has(key)) {
        bonds.set(key, { count: 0, avgScore: 0, totalScore: 0 });
      }
      const bond = bonds.get(key)!;
      bond.count++;
      bond.totalScore += impact.impactScore;
      bond.avgScore = bond.totalScore / bond.count;
    });
  });

  // 转换为数组并排序
  const topIndustries = Array.from(industries.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 20);

  const topCompanies = Array.from(companies.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 20);

  const topFutures = Array.from(futures.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 20);

  const topBonds = Array.from(bonds.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);

  return {
    sentimentCounts,
    topIndustries,
    topCompanies,
    topFutures,
    topBonds,
    totalAnalyses: analysesList.length
  };
}
