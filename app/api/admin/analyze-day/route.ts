import { NextRequest, NextResponse } from 'next/server';
import { analyzeMultipleNews } from '@/lib/analyzer';
import { getNewsByDate, saveMultipleAnalyses, getAnalysisByDate } from '@/lib/storage-adapter';

/**
 * 单日分析 API（不抓取，只分析已有新闻）
 * 用于补充缺失的分析
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json({
        success: false,
        error: '缺少日期参数'
      }, { status: 400 });
    }

    console.log(`📅 开始分析日期: ${date}`);

    // 1. 检查是否已有分析
    const existingAnalyses = await getAnalysisByDate(date);
    if (existingAnalyses.length > 0) {
      console.log(`✅ ${date} 已有 ${existingAnalyses.length} 条分析，跳过`);
      return NextResponse.json({
        success: true,
        date,
        analysisCount: existingAnalyses.length,
        message: '已有分析结果',
        skipped: true
      });
    }

    // 2. 获取该日期的新闻
    const news = await getNewsByDate(date);

    if (news.length === 0) {
      console.log(`⚠️ ${date} 没有新闻数据`);
      return NextResponse.json({
        success: false,
        date,
        error: '没有新闻数据'
      });
    }

    console.log(`📰 找到 ${news.length} 条新闻，开始 AI 分析...`);

    // 3. AI 分析
    const analyses = await analyzeMultipleNews(news);

    if (analyses.length === 0) {
      console.log(`❌ ${date} AI 分析失败`);
      return NextResponse.json({
        success: false,
        date,
        error: 'AI 分析失败'
      });
    }

    // 4. 保存分析结果
    await saveMultipleAnalyses(analyses);

    console.log(`✅ ${date} 分析完成: ${analyses.length} 条分析`);

    return NextResponse.json({
      success: true,
      date,
      newsCount: news.length,
      analysisCount: analyses.length,
      message: `成功分析 ${date}`
    });

  } catch (error) {
    console.error('❌ 分析失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '分析失败'
    }, { status: 500 });
  }
}
