import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisByDate } from '@/lib/storage-adapter';
import { generateDailyStockRanking, getRankingStats } from '@/lib/stock-ranking';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        { success: false, error: '请提供日期参数' },
        { status: 400 }
      );
    }
    
    // 获取该日期的所有分析数据
    const analyses = await getAnalysisByDate(date);
    
    if (!analyses || analyses.length === 0) {
      return NextResponse.json(
        { success: false, error: `${date} 暂无分析数据` },
        { status: 404 }
      );
    }
    
    // 生成股票排行榜
    const ranking = generateDailyStockRanking(date, analyses);
    const stats = getRankingStats(ranking);
    
    return NextResponse.json({
      success: true,
      data: {
        ranking,
        stats
      }
    });
  } catch (error) {
    console.error('获取股票排行榜失败:', error);
    return NextResponse.json(
      { success: false, error: '获取排行榜失败' },
      { status: 500 }
    );
  }
}
