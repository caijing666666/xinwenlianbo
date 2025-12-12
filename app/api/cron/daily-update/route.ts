import { NextRequest, NextResponse } from 'next/server';
import { scrapeNewsData } from '@/lib/scraper';
import { analyzeMultipleNews } from '@/lib/analyzer';
import { saveMultipleNews, saveMultipleAnalyses } from '@/lib/storage-adapter';

export async function GET(request: NextRequest) {
  try {
    console.log('🤖 开始每日自动更新任务...');
    
    // 获取北京时间的昨天日期（UTC+8）
    // 因为新闻联播数据源在凌晨更新前一天的内容
    const now = new Date();
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    // 减去一天获取昨天的日期
    const yesterday = new Date(beijingTime.getTime() - 24 * 60 * 60 * 1000);
    const targetDate = yesterday.toISOString().split('T')[0];
    console.log(`📅 处理日期: ${targetDate} (昨天的新闻联播)`);
    
    // 1. 抓取昨日新闻
    console.log('📰 抓取昨日新闻...');
    const news = await scrapeNewsData(targetDate);
    
    if (news.length === 0) {
      console.log('⚠️ 今日暂无新闻数据');
      return NextResponse.json({
        success: false,
        message: '今日暂无新闻数据',
        date: targetDate,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ 成功抓取 ${news.length} 条新闻`);
    
    // 2. 保存新闻数据
    console.log('💾 保存新闻数据...');
    await saveMultipleNews(news);
    console.log('✅ 新闻数据保存完成');
    
    // 3. AI 分析
    console.log('🧠 开始 AI 分析...');
    const analyses = await analyzeMultipleNews(news);
    
    if (analyses.length === 0) {
      console.log('⚠️ AI 分析失败');
      return NextResponse.json({
        success: false,
        message: 'AI 分析失败',
        date: targetDate,
        newsCount: news.length,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ 成功分析 ${analyses.length} 条新闻`);
    
    // 4. 保存分析结果
    console.log('💾 保存分析结果...');
    await saveMultipleAnalyses(analyses);
    console.log('✅ 分析结果保存完成');
    
    // 5. 统计信息
    const statistics = {
      industries: analyses.reduce((acc, a) => acc + a.industryImpacts.length, 0),
      companies: analyses.reduce((acc, a) => acc + a.companyImpacts.length, 0),
      futures: analyses.reduce((acc, a) => acc + a.futuresImpacts.length, 0),
      bonds: analyses.reduce((acc, a) => acc + a.bondImpacts.length, 0),
      sentiment: {
        bullish: analyses.filter(a => a.overallSentiment === 'bullish').length,
        bearish: analyses.filter(a => a.overallSentiment === 'bearish').length,
        neutral: analyses.filter(a => a.overallSentiment === 'neutral').length
      }
    };
    
    console.log('🎉 每日更新任务完成！');
    
    return NextResponse.json({
      success: true,
      message: '每日更新任务完成',
      date: targetDate,
      newsCount: news.length,
      analysisCount: analyses.length,
      statistics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 每日更新任务失败:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// 支持 POST 请求（用于手动触发）
export async function POST(request: NextRequest) {
  return GET(request);
}
