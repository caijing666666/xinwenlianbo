import { NextRequest, NextResponse } from 'next/server';
import { batchScrapeAndAnalyze } from '@/scripts/batch-scrape';
import { getRecentNews, getRecentAnalyses } from '@/lib/storage-adapter';
import { ApiResponse } from '@/types';

/**
 * 数据管理API
 * GET: 获取数据统计
 * POST: 触发批量预抓取
 */

export async function GET(request: NextRequest) {
  try {
    // 获取最近30天的数据统计
    const [recentNews, recentAnalyses] = await Promise.all([
      getRecentNews(30),
      getRecentAnalyses(30)
    ]);

    // 按日期分组统计
    const dateStats = new Map<string, { newsCount: number; analysisCount: number }>();
    
    // 统计新闻
    recentNews.forEach((news: any) => {
      const date = news.date;
      if (!dateStats.has(date)) {
        dateStats.set(date, { newsCount: 0, analysisCount: 0 });
      }
      dateStats.get(date)!.newsCount++;
    });

    // 统计分析
    recentAnalyses.forEach((analysis: any) => {
      const date = analysis.newsDate;
      if (!dateStats.has(date)) {
        dateStats.set(date, { newsCount: 0, analysisCount: 0 });
      }
      dateStats.get(date)!.analysisCount++;
    });

    // 转换为数组并排序
    const dateList = Array.from(dateStats.entries())
      .map(([date, stats]) => ({
        date,
        ...stats,
        hasData: stats.newsCount > 0,
        hasAnalysis: stats.analysisCount > 0
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const response: ApiResponse<{
      totalDays: number;
      totalNews: number;
      totalAnalyses: number;
      daysWithData: number;
      daysWithAnalysis: number;
      dateList: typeof dateList;
    }> = {
      success: true,
      data: {
        totalDays: dateList.length,
        totalNews: recentNews.length,
        totalAnalyses: recentAnalyses.length,
        daysWithData: dateList.filter(d => d.hasData).length,
        daysWithAnalysis: dateList.filter(d => d.hasAnalysis).length,
        dateList
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取数据统计失败:', error);
    const response: ApiResponse<any> = {
      success: false,
      error: error instanceof Error ? error.message : '获取数据失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'batch-scrape') {
      console.log('🚀 开始批量预抓取...');
      
      // 在后台执行批量抓取（不阻塞响应）
      batchScrapeAndAnalyze()
        .then(() => {
          console.log('✅ 批量预抓取完成');
        })
        .catch((error) => {
          console.error('❌ 批量预抓取失败:', error);
        });

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: '批量预抓取任务已启动，请查看控制台日志了解进度'
        }
      };

      return NextResponse.json(response);
    } else {
      const response: ApiResponse<any> = {
        success: false,
        error: '不支持的操作'
      };
      return NextResponse.json(response, { status: 400 });
    }
  } catch (error) {
    console.error('数据管理操作失败:', error);
    const response: ApiResponse<any> = {
      success: false,
      error: error instanceof Error ? error.message : '操作失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
