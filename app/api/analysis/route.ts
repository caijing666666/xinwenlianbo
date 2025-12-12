import { NextRequest, NextResponse } from 'next/server';
import { getRecentAnalyses, getAnalysisByDate } from '@/lib/storage-adapter';
import { ApiResponse, InvestmentAnalysis } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const days = searchParams.get('days');

    console.log('API called with date:', date, 'days:', days);
    console.log('Current working directory:', process.cwd());
    console.log('NODE_ENV:', process.env.NODE_ENV);

    let analyses: InvestmentAnalysis[];

    if (date) {
      console.log('Fetching analyses for date:', date);
      analyses = await getAnalysisByDate(date);
      console.log('Found analyses:', analyses.length);
    } else {
      const daysCount = days ? parseInt(days) : 7;
      console.log('Fetching recent analyses for', daysCount, 'days');
      analyses = await getRecentAnalyses(daysCount);
      console.log('Found analyses:', analyses.length);
    }

    // 按照投资机会评分从高到低排序
    const sortedAnalyses = analyses.sort((a, b) => 
      (b.investmentOpportunityScore || 0) - (a.investmentOpportunityScore || 0)
    );

    const response: ApiResponse<InvestmentAnalysis[]> = {
      success: true,
      data: sortedAnalyses,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<InvestmentAnalysis[]> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
