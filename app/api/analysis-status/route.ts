import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisStatus } from '@/lib/analysis-store';
import { ApiResponse } from '@/types';

/**
 * 获取指定日期的分析状态
 * GET /api/analysis-status?date=YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      const response: ApiResponse<any> = {
        success: false,
        error: '请提供日期参数 (date)',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const status = await getAnalysisStatus(date);

    const response: ApiResponse<typeof status> = {
      success: true,
      data: status,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取分析状态失败:', error);
    const response: ApiResponse<any> = {
      success: false,
      error: error instanceof Error ? error.message : '获取状态失败',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
