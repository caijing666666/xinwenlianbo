import { NextRequest, NextResponse } from 'next/server';
import { getNewsByDate, hasAnalysisForDate, saveAnalysisForDate } from '@/lib/analysis-store';
import { analyzeMultipleNews } from '@/lib/analyzer';
import { ApiResponse } from '@/types';

/**
 * 批量分析多个日期的新闻
 * POST /api/batch-analyze
 * Body: { dates: string[], maxConcurrent?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dates, maxConcurrent = 1 } = body;

    if (!dates || !Array.isArray(dates)) {
      return NextResponse.json({
        success: false,
        error: '请提供日期数组'
      }, { status: 400 });
    }

    console.log(`🚀 开始批量分析 ${dates.length} 个日期...`);

    const results = [];
    let processed = 0;

    // 逐个处理（避免并发导致API限制）
    for (const date of dates) {
      try {
        console.log(`\n📅 处理日期: ${date} (${processed + 1}/${dates.length})`);

        // 检查缓存
        const hasAnalysis = await hasAnalysisForDate(date);
        if (hasAnalysis) {
          console.log(`✅ ${date} 已有分析结果，跳过`);
          results.push({
            date,
            status: 'cached',
            message: '已有分析结果'
          });
          processed++;
          continue;
        }

        // 获取新闻
        const newsList = await getNewsByDate(date);
        if (newsList.length === 0) {
          console.log(`⚠️ ${date} 没有新闻数据`);
          results.push({
            date,
            status: 'no-news',
            message: '没有新闻数据'
          });
          processed++;
          continue;
        }

        console.log(`📊 ${date} 找到 ${newsList.length} 条新闻，开始分析...`);

        // AI分析
        const analyses = await analyzeMultipleNews(newsList);

        if (analyses.length === 0) {
          results.push({
            date,
            status: 'failed',
            message: 'AI分析失败'
          });
        } else {
          // 保存结果
          await saveAnalysisForDate(date, analyses);
          console.log(`✅ ${date} 分析完成，保存 ${analyses.length} 条结果`);
          
          results.push({
            date,
            status: 'analyzed',
            count: analyses.length,
            message: `成功分析 ${analyses.length} 条新闻`
          });
        }

        processed++;

        // 进度反馈
        console.log(`📈 进度: ${processed}/${dates.length} (${Math.round(processed/dates.length*100)}%)`);

      } catch (error) {
        console.error(`❌ ${date} 处理失败:`, error);
        results.push({
          date,
          status: 'failed',
          message: error instanceof Error ? error.message : '处理失败'
        });
        processed++;
      }
    }

    // 统计结果
    const stats = {
      total: dates.length,
      cached: results.filter(r => r.status === 'cached').length,
      analyzed: results.filter(r => r.status === 'analyzed').length,
      noNews: results.filter(r => r.status === 'no-news').length,
      failed: results.filter(r => r.status === 'failed').length,
    };

    console.log('\n🎉 批量分析完成！');
    console.log('📊 统计:', stats);

    const response: ApiResponse<{
      results: any[];
      statistics: typeof stats;
    }> = {
      success: true,
      data: {
        results,
        statistics: stats
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 批量分析失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '批量分析失败'
    }, { status: 500 });
  }
}

/**
 * 获取最近N天的日期列表
 * GET /api/batch-analyze?days=30
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return NextResponse.json({
      success: true,
      data: { dates, count: dates.length }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取日期列表失败'
    }, { status: 500 });
  }
}
