#!/usr/bin/env tsx

/**
 * 每日更新脚本 - 抓取新闻并进行AI分析
 * 用于GitHub Actions自动化或手动执行
 */

import { scrapeNewsData } from '../lib/scraper';
import { analyzeMultipleNews } from '../lib/analyzer';
import { saveMultipleNews, saveMultipleAnalyses } from '../lib/storage-adapter';

async function dailyUpdate() {
  try {
    console.log('🤖 开始每日更新任务...');
    
    // 获取今天的日期
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 处理日期: ${today}`);
    
    // 1. 抓取今日新闻
    console.log('📰 抓取今日新闻...');
    const news = await scrapeNewsData(today);
    
    if (news.length === 0) {
      console.log('⚠️ 今日暂无新闻数据');
      process.exit(0);
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
      process.exit(1);
    }
    
    console.log(`✅ 成功分析 ${analyses.length} 条新闻`);
    
    // 4. 保存分析结果
    console.log('💾 保存分析结果...');
    await saveMultipleAnalyses(analyses);
    console.log('✅ 分析结果保存完成');
    
    // 5. 统计信息
    const statistics = {
      date: today,
      newsCount: news.length,
      analysisCount: analyses.length,
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
    
    console.log('\n📊 更新统计:');
    console.log(`日期: ${statistics.date}`);
    console.log(`新闻数量: ${statistics.newsCount}`);
    console.log(`分析数量: ${statistics.analysisCount}`);
    console.log(`行业影响: ${statistics.industries}`);
    console.log(`公司影响: ${statistics.companies}`);
    console.log(`期货影响: ${statistics.futures}`);
    console.log(`债券影响: ${statistics.bonds}`);
    console.log(`市场情绪: 看涨${statistics.sentiment.bullish} 看跌${statistics.sentiment.bearish} 中性${statistics.sentiment.neutral}`);
    
    console.log('\n🎉 每日更新任务完成！');
    
  } catch (error) {
    console.error('❌ 每日更新任务失败:', error);
    process.exit(1);
  }
}

// 执行更新
if (require.main === module) {
  dailyUpdate();
}

export { dailyUpdate };
