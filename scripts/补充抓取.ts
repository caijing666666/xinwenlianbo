#!/usr/bin/env tsx

/**
 * 补充抓取缺失日期的脚本
 */

import { scrapeNewsData } from '../lib/scraper';
import { analyzeMultipleNews } from '../lib/analyzer';
import { saveMultipleNews, saveMultipleAnalyses, getNewsByDate, getAnalysisByDate } from '../lib/storage-adapter';

// 缺失的日期列表
const missingDates = [
  '2025-11-07',
  '2025-11-06', 
  '2025-11-05',
  '2025-11-04',
  '2025-11-03',
  '2025-11-02',
  '2025-11-01',
  '2025-10-31'
];

// 需要补充分析的日期
const needAnalysisDates = [
  '2025-11-08'
];

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function supplementScraping() {
  console.log('🔄 开始补充抓取缺失的日期数据...\n');
  
  let totalNews = 0;
  let totalAnalyses = 0;
  let successCount = 0;
  let failCount = 0;

  // 1. 处理完全缺失的日期
  console.log('📅 处理完全缺失的日期:');
  for (let index = 0; index < missingDates.length; index++) {
    const date = missingDates[index];
    try {
      console.log(`\n[${index + 1}/${missingDates.length}] 处理日期: ${date}`);
      
      // 抓取新闻
      console.log('  📰 抓取新闻数据...');
      const news = await scrapeNewsData(date);
      
      if (news.length === 0) {
        console.log(`  ⚠️  ${date} 没有找到新闻数据，可能是数据源问题`);
        failCount++;
        continue;
      }
      
      console.log(`  ✅ 抓取到 ${news.length} 条新闻`);
      
      // 保存新闻
      await saveMultipleNews(news);
      totalNews += news.length;
      
      // AI分析
      console.log('  🧠 开始AI分析...');
      const analyses = await analyzeMultipleNews(news);
      
      if (analyses.length > 0) {
        // 保存分析结果
        await saveMultipleAnalyses(analyses);
        totalAnalyses += analyses.length;
        console.log(`  ✅ 完成 ${analyses.length} 条分析`);
      } else {
        console.log(`  ⚠️  AI分析失败`);
      }
      
      successCount++;
      console.log(`  🎉 ${date} 处理完成`);
      
      // 避免请求过快，延迟3秒
      if (index < missingDates.length - 1) {
        console.log('  ⏳ 等待3秒...');
        await delay(3000);
      }
      
    } catch (error) {
      console.error(`  ❌ ${date} 处理失败:`, error);
      failCount++;
    }
  }

  // 2. 处理需要补充分析的日期
  console.log('\n📊 处理需要补充分析的日期:');
  for (const date of needAnalysisDates) {
    try {
      console.log(`\n处理日期: ${date}`);
      
      // 获取已有的新闻数据
      const existingNews = await getNewsByDate(date);
      
      if (existingNews.length === 0) {
        console.log(`  ⚠️  ${date} 没有新闻数据，跳过分析`);
        continue;
      }
      
      console.log(`  📰 找到 ${existingNews.length} 条新闻`);
      
      // 检查是否已有分析
      const existingAnalyses = await getAnalysisByDate(date);
      if (existingAnalyses.length > 0) {
        console.log(`  ✅ ${date} 已有 ${existingAnalyses.length} 条分析，跳过`);
        continue;
      }
      
      // AI分析
      console.log('  🧠 开始AI分析...');
      const analyses = await analyzeMultipleNews(existingNews);
      
      if (analyses.length > 0) {
        // 保存分析结果
        await saveMultipleAnalyses(analyses);
        totalAnalyses += analyses.length;
        console.log(`  ✅ 完成 ${analyses.length} 条分析`);
        successCount++;
      } else {
        console.log(`  ⚠️  AI分析失败`);
        failCount++;
      }
      
    } catch (error) {
      console.error(`  ❌ ${date} 分析失败:`, error);
      failCount++;
    }
  }

  // 输出总结
  console.log('\n🎊 补充抓取完成！');
  console.log('=' .repeat(50));
  console.log(`📊 处理统计:`);
  console.log(`  • 成功处理: ${successCount} 天`);
  console.log(`  • 失败处理: ${failCount} 天`);
  console.log(`  • 新增新闻: ${totalNews} 条`);
  console.log(`  • 新增分析: ${totalAnalyses} 条`);
  console.log('=' .repeat(50));
}

// 如果直接运行此脚本
if (require.main === module) {
  supplementScraping()
    .then(() => {
      console.log('✅ 补充抓取脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 补充抓取脚本执行失败:', error);
      process.exit(1);
    });
}

export { supplementScraping };
