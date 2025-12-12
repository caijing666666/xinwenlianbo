import { NextRequest, NextResponse } from 'next/server';
import { getRecentNews } from '@/lib/storage-adapter';
import { analyzeMultipleNews } from '@/lib/analyzer';
import { 
  getNewsByDate, 
  getAnalysisByDate, 
  hasAnalysisForDate, 
  hasNewsForDate,
  saveAnalysisForDate,
  getAnalysisStatus
} from '@/lib/analysis-store';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, days } = body;

    // 处理单日期分析（增强版逻辑）
    if (date) {
      console.log(`📅 分析日期：${date}`);
      
      // 1. 检查是否已有分析结果
      const hasExistingAnalysis = await hasAnalysisForDate(date);
      if (hasExistingAnalysis) {
        console.log(`✅ ${date} 已有分析结果，直接返回缓存`);
        const existingAnalyses = await getAnalysisByDate(date);
        
        // 返回统计信息
        const totalIndustries = existingAnalyses.reduce((sum, a) => sum + a.industryImpacts.length, 0);
        const totalCompanies = existingAnalyses.reduce((sum, a) => sum + a.companyImpacts.length, 0);
        const totalFutures = existingAnalyses.reduce((sum, a) => sum + a.futuresImpacts.length, 0);
        const totalBonds = existingAnalyses.reduce((sum, a) => sum + a.bondImpacts.length, 0);

        const bullishCount = existingAnalyses.filter(a => a.overallSentiment === 'bullish').length;
        const bearishCount = existingAnalyses.filter(a => a.overallSentiment === 'bearish').length;
        const neutralCount = existingAnalyses.filter(a => a.overallSentiment === 'neutral').length;

        const response: ApiResponse<any> = {
          success: true,
          data: {
            count: existingAnalyses.length,
            message: `返回 ${date} 的缓存分析结果（${existingAnalyses.length} 条）`,
            cached: true,
            statistics: {
              industries: totalIndustries,
              companies: totalCompanies,
              futures: totalFutures,
              bonds: totalBonds,
              sentiment: {
                bullish: bullishCount,
                bearish: bearishCount,
                neutral: neutralCount,
              },
            },
          },
        };
        return NextResponse.json(response);
      }

      // 2. 检查是否有新闻数据
      const hasNews = await hasNewsForDate(date);
      if (!hasNews) {
        const response: ApiResponse<any> = {
          success: false,
          error: `${date} 没有新闻数据，请先运行抓取任务`,
        };
        return NextResponse.json(response, { status: 404 });
      }

      // 3. 获取新闻数据并进行AI分析
      const newsList = await getNewsByDate(date);
      console.log(`📊 找到 ${newsList.length} 条新闻待分析`);
      console.log('🔍 开始 AI 分析（这可能需要几分钟）...');

      const analyses = await analyzeMultipleNews(newsList);

      if (analyses.length === 0) {
        const response: ApiResponse<any> = {
          success: false,
          error: 'AI 分析失败',
        };
        return NextResponse.json(response, { status: 500 });
      }

      // 4. 保存分析结果
      console.log(`✅ 成功分析 ${analyses.length} 条新闻`);
      console.log('💾 正在保存分析结果...');

      await saveAnalysisForDate(date, analyses);

      console.log('✅ 分析结果保存完成！');

      // 返回新分析的统计信息
      const totalIndustries = analyses.reduce((sum, a) => sum + a.industryImpacts.length, 0);
      const totalCompanies = analyses.reduce((sum, a) => sum + a.companyImpacts.length, 0);
      const totalFutures = analyses.reduce((sum, a) => sum + a.futuresImpacts.length, 0);
      const totalBonds = analyses.reduce((sum, a) => sum + a.bondImpacts.length, 0);

      const bullishCount = analyses.filter(a => a.overallSentiment === 'bullish').length;
      const bearishCount = analyses.filter(a => a.overallSentiment === 'bearish').length;
      const neutralCount = analyses.filter(a => a.overallSentiment === 'neutral').length;

      const response: ApiResponse<any> = {
        success: true,
        data: {
          count: analyses.length,
          message: `成功分析 ${date} 的 ${analyses.length} 条新闻`,
          cached: false,
          statistics: {
            industries: totalIndustries,
            companies: totalCompanies,
            futures: totalFutures,
            bonds: totalBonds,
            sentiment: {
              bullish: bullishCount,
              bearish: bearishCount,
              neutral: neutralCount,
            },
          },
        },
      };
      return NextResponse.json(response);
    }

    // 处理多日期分析（保持原有逻辑）
    let newsList;
    if (days && days > 1) {
      console.log(`📅 分析最近 ${days} 天的数据`);
      newsList = await getRecentNews(days);
    } else {
      console.log(`📅 分析今日数据`);
      const today = new Date().toISOString().split('T')[0];
      newsList = await getNewsByDate(today);
    }

    if (newsList.length === 0) {
      const response: ApiResponse<any> = {
        success: false,
        error: '未找到新闻数据，请先运行抓取任务',
      };
      return NextResponse.json(response, { status: 404 });
    }

    console.log(`📊 找到 ${newsList.length} 条新闻待分析`);
    console.log('🔍 开始 AI 分析（这可能需要几分钟）...');

    const analyses = await analyzeMultipleNews(newsList);

    if (analyses.length === 0) {
      const response: ApiResponse<any> = {
        success: false,
        error: '分析失败',
      };
      return NextResponse.json(response, { status: 500 });
    }

    console.log(`✅ 成功分析 ${analyses.length} 条新闻`);
    console.log('💾 正在保存分析结果...');

    // 对于多日期，仍使用原有的保存方式
    const { saveMultipleAnalyses } = await import('@/lib/storage-adapter');
    await saveMultipleAnalyses(analyses);

    console.log('✅ 分析结果保存完成！');

    // 统计信息
    const totalIndustries = analyses.reduce((sum, a) => sum + a.industryImpacts.length, 0);
    const totalCompanies = analyses.reduce((sum, a) => sum + a.companyImpacts.length, 0);
    const totalFutures = analyses.reduce((sum, a) => sum + a.futuresImpacts.length, 0);
    const totalBonds = analyses.reduce((sum, a) => sum + a.bondImpacts.length, 0);

    const bullishCount = analyses.filter(a => a.overallSentiment === 'bullish').length;
    const bearishCount = analyses.filter(a => a.overallSentiment === 'bearish').length;
    const neutralCount = analyses.filter(a => a.overallSentiment === 'neutral').length;

    const response: ApiResponse<any> = {
      success: true,
      data: {
        count: analyses.length,
        message: `成功分析 ${analyses.length} 条新闻`,
        statistics: {
          industries: totalIndustries,
          companies: totalCompanies,
          futures: totalFutures,
          bonds: totalBonds,
          sentiment: {
            bullish: bullishCount,
            bearish: bearishCount,
            neutral: neutralCount,
          },
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ 分析失败:', error);
    const response: ApiResponse<any> = {
      success: false,
      error: error instanceof Error ? error.message : '分析失败',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
