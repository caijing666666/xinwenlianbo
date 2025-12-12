import { NextRequest, NextResponse } from 'next/server';
import { scrapeNewsData, scrapeRecentNews } from '@/lib/scraper';
import { saveMultipleNews } from '@/lib/storage-adapter';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, days } = body;

    let newsList;

    if (date) {
      console.log(`📅 抓取日期：${date}`);
      newsList = await scrapeNewsData(date);
    } else if (days && days > 1) {
      console.log(`📅 抓取最近 ${days} 天的数据`);
      newsList = await scrapeRecentNews(days);
    } else {
      console.log(`📅 抓取今日数据`);
      newsList = await scrapeNewsData();
    }

    if (newsList.length === 0) {
      const response: ApiResponse<{ count: number; message: string }> = {
        success: false,
        error: '未抓取到新闻数据',
      };
      return NextResponse.json(response, { status: 404 });
    }

    console.log(`✅ 成功抓取 ${newsList.length} 条新闻`);
    console.log('💾 正在保存到数据库...');

    await saveMultipleNews(newsList);

    console.log('✅ 数据保存完成！');

    const response: ApiResponse<{ count: number; message: string; preview: any[] }> = {
      success: true,
      data: {
        count: newsList.length,
        message: `成功抓取并保存 ${newsList.length} 条新闻`,
        preview: newsList.slice(0, 3).map(news => ({
          title: news.title,
          date: news.date,
        })),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ 抓取失败:', error);
    const response: ApiResponse<any> = {
      success: false,
      error: error instanceof Error ? error.message : '抓取失败',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
