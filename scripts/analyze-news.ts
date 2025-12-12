// Load environment variables from .env file
require('dotenv').config();

// 自动适配存储后端（开发=本地文件，生产=Vercel KV）
import { getRecentNews, getNewsByDate, saveMultipleAnalyses } from '../lib/storage-adapter';
import { analyzeMultipleNews } from '../lib/analyzer';

async function main() {
  console.log('🤖 开始 AI 分析新闻数据...\n');

  const args = process.argv.slice(2);
  const date = args[0]; // 可选：指定日期 YYYY-MM-DD
  const days = args[1] ? parseInt(args[1]) : 1; // 可选：分析天数

  try {
    let newsList;

    if (date) {
      console.log(`📅 分析日期：${date}`);
      newsList = await getNewsByDate(date);
    } else if (days > 1) {
      console.log(`📅 分析最近 ${days} 天的数据`);
      newsList = await getRecentNews(days);
    } else {
      console.log(`📅 分析今日数据`);
      const today = new Date().toISOString().split('T')[0];
      newsList = await getNewsByDate(today);
    }

    if (newsList.length === 0) {
      console.log('⚠️  未找到新闻数据，请先运行 npm run scrape');
      return;
    }

    console.log(`\n📊 找到 ${newsList.length} 条新闻待分析`);
    console.log('🔍 开始 AI 分析（这可能需要几分钟）...\n');

    const analyses = await analyzeMultipleNews(newsList);

    if (analyses.length === 0) {
      console.log('⚠️  分析失败');
      return;
    }

    console.log(`\n✅ 成功分析 ${analyses.length} 条新闻`);
    console.log('💾 正在保存分析结果...');

    await saveMultipleAnalyses(analyses);

    console.log('✅ 分析结果保存完成！\n');

    // 显示统计信息
    const totalIndustries = analyses.reduce((sum, a) => sum + a.industryImpacts.length, 0);
    const totalCompanies = analyses.reduce((sum, a) => sum + a.companyImpacts.length, 0);
    const totalFutures = analyses.reduce((sum, a) => sum + a.futuresImpacts.length, 0);
    const totalBonds = analyses.reduce((sum, a) => sum + a.bondImpacts.length, 0);

    console.log('📈 分析统计：');
    console.log(`   - 识别行业影响：${totalIndustries} 个`);
    console.log(`   - 识别公司影响：${totalCompanies} 个`);
    console.log(`   - 识别期货影响：${totalFutures} 个`);
    console.log(`   - 识别债券影响：${totalBonds} 个`);

    const bullishCount = analyses.filter(a => a.overallSentiment === 'bullish').length;
    const bearishCount = analyses.filter(a => a.overallSentiment === 'bearish').length;
    const neutralCount = analyses.filter(a => a.overallSentiment === 'neutral').length;

    console.log('\n📊 市场情绪分布：');
    console.log(`   - 看涨：${bullishCount}`);
    console.log(`   - 看跌：${bearishCount}`);
    console.log(`   - 中性：${neutralCount}`);

    console.log('\n🎉 分析任务完成！');
    console.log('💡 访问网站查看详细分析结果');

  } catch (error) {
    console.error('❌ 分析失败:', error);
    process.exit(1);
  }
}

main();
