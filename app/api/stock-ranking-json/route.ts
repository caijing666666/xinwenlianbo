import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisByDate } from '@/lib/storage-adapter';
import { generateDailyStockRanking, getRankingStats } from '@/lib/stock-ranking';

/**
 * 股票排行榜纯 JSON API
 * GET /api/stock-ranking-json?date=YYYY-MM-DD
 * 
 * 返回指定日期的股票排行榜数据，格式与前端显示一致
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    
    // 如果没有提供日期，使用今天
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // 获取该日期的所有分析数据
    const analyses = await getAnalysisByDate(targetDate);
    
    if (!analyses || analyses.length === 0) {
      return NextResponse.json({
        success: false,
        error: `${targetDate} 暂无分析数据`,
        date: targetDate,
        data: null
      }, { status: 404 });
    }
    
    // 生成股票排行榜
    const ranking = generateDailyStockRanking(targetDate, analyses);
    const stats = getRankingStats(ranking);
    
    // 构建纯 JSON 响应
    return NextResponse.json({
      success: true,
      date: targetDate,
      updatedAt: ranking.updatedAt,
      stats: {
        totalStocks: stats.total,
        strongBuyCount: stats.strongBuyCount,
        buyCount: stats.buyCount,
        neutralCount: stats.neutralCount,
        notRecommendedCount: stats.notRecommendedCount,
        strongBuyPercent: stats.strongBuyPercent,
        buyPercent: stats.buyPercent
      },
      data: {
        strongBuy: ranking.strongBuy.map(stock => ({
          rank: stock.rank,
          companyName: stock.companyName,
          stockCode: stock.stockCode,
          exchange: stock.exchange,
          impactScore: stock.impactScore,
          impactType: stock.impactType,
          reasoning: stock.reasoning,
          relatedIndustries: stock.relatedIndustries,
          confidence: stock.confidence,
          estimatedPriceImpact: stock.estimatedPriceImpact,
          recommendationLevel: stock.recommendationLevel,
          recommendationLabel: stock.recommendationLabel
        })),
        buy: ranking.buy.map(stock => ({
          rank: stock.rank,
          companyName: stock.companyName,
          stockCode: stock.stockCode,
          exchange: stock.exchange,
          impactScore: stock.impactScore,
          impactType: stock.impactType,
          reasoning: stock.reasoning,
          relatedIndustries: stock.relatedIndustries,
          confidence: stock.confidence,
          estimatedPriceImpact: stock.estimatedPriceImpact,
          recommendationLevel: stock.recommendationLevel,
          recommendationLabel: stock.recommendationLabel
        })),
        neutral: ranking.neutral.map(stock => ({
          rank: stock.rank,
          companyName: stock.companyName,
          stockCode: stock.stockCode,
          exchange: stock.exchange,
          impactScore: stock.impactScore,
          impactType: stock.impactType,
          reasoning: stock.reasoning,
          relatedIndustries: stock.relatedIndustries,
          confidence: stock.confidence,
          estimatedPriceImpact: stock.estimatedPriceImpact,
          recommendationLevel: stock.recommendationLevel,
          recommendationLabel: stock.recommendationLabel
        })),
        notRecommended: ranking.notRecommended.map(stock => ({
          rank: stock.rank,
          companyName: stock.companyName,
          stockCode: stock.stockCode,
          exchange: stock.exchange,
          impactScore: stock.impactScore,
          impactType: stock.impactType,
          reasoning: stock.reasoning,
          relatedIndustries: stock.relatedIndustries,
          confidence: stock.confidence,
          estimatedPriceImpact: stock.estimatedPriceImpact,
          recommendationLevel: stock.recommendationLevel,
          recommendationLabel: stock.recommendationLabel
        }))
      }
    });
  } catch (error) {
    console.error('获取股票排行榜JSON失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取排行榜失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
