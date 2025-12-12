import { scrapeNewsData } from '../../lib/scraper';
import { analyzeMultipleNews } from '../../lib/analyzer';
import { saveMultipleNews, saveMultipleAnalyses } from '../../lib/storage-adapter';

export const handler = async (event: any, context: any) => {
  try {
    console.log('🤖 Netlify定时任务: 开始每日自动更新...');
    
    // 获取今天的日期
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 处理日期: ${today}`);
    
    // 1. 抓取今日新闻
    console.log('📰 抓取今日新闻...');
    const news = await scrapeNewsData(today);
    
    if (news.length === 0) {
      console.log('⚠️ 今日暂无新闻数据');
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: '今日暂无新闻数据',
          date: today,
          timestamp: new Date().toISOString()
        })
      };
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
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: 'AI 分析失败',
          date: today,
          newsCount: news.length,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    console.log(`✅ 成功分析 ${analyses.length} 条新闻`);
    
    // 4. 保存分析结果
    console.log('💾 保存分析结果...');
    await saveMultipleAnalyses(analyses);
    console.log('✅ 分析结果保存完成');
    
    console.log('🎉 Netlify定时任务完成！');
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: '每日更新任务完成',
        date: today,
        newsCount: news.length,
        analysisCount: analyses.length,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Netlify定时任务失败:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    };
  }
};
