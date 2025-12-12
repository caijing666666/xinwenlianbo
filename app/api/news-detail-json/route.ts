import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisByDate } from '@/lib/storage-adapter';
import { InvestmentAnalysis, IndustryImpact, CompanyImpact, FuturesImpact, BondImpact } from '@/types';

/**
 * 新闻详情纯 JSON API
 * GET /api/news-detail-json?date=YYYY-MM-DD
 * 
 * 返回指定日期的新闻详情数据，格式与前端显示一致
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    
    // 如果没有提供日期，使用今天
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // 获取该日期的所有分析数据
    const analyses = await getAnalysisByDate(targetDate);
    
    if (!analyses || analyses.length === 0) {
      return NextResponse.json({
        success: false,
        error: `${targetDate} 暂无分析数据`,
        date: targetDate,
        data: null
      }, { status: 404 });
    }
    
    // 按照投资机会评分从高到低排序
    const sortedAnalyses = analyses.sort((a: InvestmentAnalysis, b: InvestmentAnalysis) => 
      (b.investmentOpportunityScore || 0) - (a.investmentOpportunityScore || 0)
    );
    
    // 构建纯 JSON 响应，与前端新闻详情视图一致
    const newsDetails = sortedAnalyses.map((analysis: InvestmentAnalysis, index: number) => ({
      // 基本信息
      newsId: analysis.newsId,
      newsTitle: analysis.newsTitle,
      newsContent: analysis.newsContent,
      newsDate: analysis.newsDate,
      
      // 评分和情绪
      investmentOpportunityScore: analysis.investmentOpportunityScore,
      overallSentiment: analysis.overallSentiment,
      sentimentLabel: analysis.overallSentiment === 'bullish' ? '看涨' : 
                      analysis.overallSentiment === 'bearish' ? '看跌' : '中性',
      
      // 价值标签
      valueTag: analysis.investmentOpportunityScore >= 80 ? '高价值' :
                analysis.investmentOpportunityScore >= 70 ? '重点关注' : null,
      
      // 行业影响
      industryImpacts: analysis.industryImpacts.map((impact: IndustryImpact) => ({
        industryName: impact.industryName,
        industryCode: impact.industryCode,
        impactScore: impact.impactScore,
        impactType: impact.impactType,
        reasoning: impact.reasoning,
        keywords: impact.keywords,
        confidence: impact.confidence
      })),
      
      // 公司影响
      companyImpacts: analysis.companyImpacts.map((impact: CompanyImpact) => ({
        companyName: impact.companyName,
        stockCode: impact.stockCode,
        exchange: impact.exchange,
        impactScore: impact.impactScore,
        impactType: impact.impactType,
        reasoning: impact.reasoning,
        relatedIndustries: impact.relatedIndustries,
        confidence: impact.confidence,
        estimatedPriceImpact: impact.estimatedPriceImpact
      })),
      
      // 期货影响
      futuresImpacts: analysis.futuresImpacts.map((impact: FuturesImpact) => ({
        commodity: impact.commodity,
        commodityCode: impact.commodityCode,
        exchange: impact.exchange,
        impactScore: impact.impactScore,
        impactType: impact.impactType,
        reasoning: impact.reasoning,
        priceDirection: impact.priceDirection,
        confidence: impact.confidence
      })),
      
      // 债券影响
      bondImpacts: analysis.bondImpacts.map((impact: BondImpact) => ({
        bondType: impact.bondType,
        impactScore: impact.impactScore,
        impactType: impact.impactType,
        reasoning: impact.reasoning,
        yieldDirection: impact.yieldDirection,
        riskLevel: impact.riskLevel,
        confidence: impact.confidence
      })),
      
      // 分析总结
      summary: analysis.summary,
      
      // 元数据
      analyzedAt: analysis.analyzedAt,
      modelVersion: analysis.modelVersion
    }));
    
    return NextResponse.json({
      success: true,
      date: targetDate,
      totalNews: newsDetails.length,
      data: newsDetails
    });
  } catch (error) {
    console.error('获取新闻详情JSON失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取新闻详情失败',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
