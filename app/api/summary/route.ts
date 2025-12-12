import { NextRequest, NextResponse } from 'next/server';
// 自动适配存储后端（开发=本地文件，生产=Vercel KV）
import { generateDailySummary } from '@/lib/storage-adapter';
import { ApiResponse, AnalysisSummary } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const summary = await generateDailySummary(date);

    const response: ApiResponse<AnalysisSummary> = {
      success: true,
      data: summary,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<AnalysisSummary> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
