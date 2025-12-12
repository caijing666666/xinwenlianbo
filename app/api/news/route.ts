import { NextRequest, NextResponse } from 'next/server';
// 自动适配存储后端（开发=本地文件，生产=Vercel KV）
import { getRecentNews, getNewsByDate } from '@/lib/storage-adapter';
import { ApiResponse, NewsItem } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const days = searchParams.get('days');

    let news: NewsItem[];

    if (date) {
      news = await getNewsByDate(date);
    } else {
      const daysCount = days ? parseInt(days) : 7;
      news = await getRecentNews(daysCount);
    }

    const response: ApiResponse<NewsItem[]> = {
      success: true,
      data: news,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<NewsItem[]> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
