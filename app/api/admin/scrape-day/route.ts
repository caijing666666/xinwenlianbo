import { NextRequest, NextResponse } from 'next/server';
import { scrapeNewsData } from '@/lib/scraper';
import { saveMultipleNews, getNewsByDate } from '@/lib/storage-adapter';

/**
 * 单日抓取 API（只抓取，不分析）
 * 分析由 analyze-day API 单独处理
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

    console.log(`📅 开始抓取日期: ${date}`);

    // 1. 检查是否已有新闻数据
    const existingNews = await getNewsByDate(date);
    if (existingNews.length > 0) {
      console.log(`✅ ${date} 已有 ${existingNews.length} 条新闻，跳过抓取`);
      return NextResponse.json({
        success: true,
        date,
        newsCount: existingNews.length,
        message: '已有新闻数据',
        skipped: true
      });
    }

    // 2. 抓取新闻
    console.log('📰 抓取新闻...');
    const news = await scrapeNewsData(date);

    if (news.length === 0) {
      return NextResponse.json({
        success: true,
        date,
        newsCount: 0,
        message: '该日期没有新闻数据'
      });
    }

    console.log(`✅ 抓取到 ${news.length} 条新闻`);

    // 3. 保存新闻
    await saveMultipleNews(news);

    console.log(`✅ ${date} 抓取完成: ${news.length} 条新闻`);

    return NextResponse.json({
      success: true,
      date,
      newsCount: news.length,
      message: `成功抓取 ${date}`
    });

  } catch (error) {
    console.error('❌ 抓取失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '抓取失败'
    }, { status: 500 });
  }
}
