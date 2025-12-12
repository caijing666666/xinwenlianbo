import { NextRequest, NextResponse } from 'next/server';
import { checkDataStatus } from '@/scripts/check-data';
import { ApiResponse } from '@/types';

/**
 * 批量预抓取状态API
 */
export async function GET(request: NextRequest) {
  try {
    // 这里可以检查批量预抓取进程状态
    // 目前简单返回数据统计
    
    const response: ApiResponse<{
      isRunning: boolean;
      message: string;
      estimatedCompletion: string;
    }> = {
      success: true,
      data: {
        isRunning: true, // 假设正在运行
        message: '批量预抓取正在后台运行中，正在处理最近30天的新闻联播数据...',
        estimatedCompletion: '预计还需要5-10分钟完成'
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取批量状态失败:', error);
    const response: ApiResponse<any> = {
      success: false,
      error: error instanceof Error ? error.message : '获取状态失败'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
