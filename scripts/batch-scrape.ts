#!/usr/bin/env tsx

/**
 * 批量预抓取脚本
 * 抓取最近30天的新闻联播数据并进行AI分析
 */

import { scrapeNewsData } from '../lib/scraper';
import { analyzeMultipleNews } from '../lib/analyzer';
import { saveMultipleNews, saveMultipleAnalyses } from '../lib/storage-adapter';

// Load environment variables
require('dotenv').config();

// 获取最近N天的日期列表
function getRecentDates(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function batchScrapeAndAnalyze() {
  console.log('🚀 开始批量预抓取最近30天的新闻联播数据...\n');
  
  const dates = getRecentDates(30);
  let totalNews = 0;
  let totalAnalyses = 0;
  let successCount = 0;
  let failCount = 0;

  for (let index = 0; index < dates.length; index++) {
    const date = dates[index];
    try {
      console.log(`📅 [${index + 1}/30] 处理日期: ${date}`);
      
      // 1. 抓取新闻
      console.log('  📰 抓取新闻数据...');
      const news = await scrapeNewsData(date);
      
      if (news.length === 0) {
        console.log(`  ⚠️  ${date} 没有找到新闻数据，跳过`);
        failCount++;
        continue;
      }
      
      console.log(`  ✅ 抓取到 ${news.length} 条新闻`);
      
      // 2. 保存新闻
      await saveMultipleNews(news);
      totalNews += news.length;
      
      // 3. AI分析
      console.log('  🧠 开始AI分析...');
      const analyses = await analyzeMultipleNews(news);
      
      if (analyses.length > 0) {
        // 4. 保存分析结果
        await saveMultipleAnalyses(analyses);
        totalAnalyses += analyses.length;
        console.log(`  ✅ 完成 ${analyses.length} 条分析`);
      } else {
        console.log(`  ⚠️  AI分析失败`);
      }
      
      successCount++;
      console.log(`  🎉 ${date} 处理完成\n`);
      
      // 避免请求过快，延迟3秒
      if (index < dates.length - 1) {
        console.log('  ⏳ 等待3秒...\n');
        await delay(3000);
      }
      
    } catch (error) {
      console.error(`  ❌ ${date} 处理失败:`, error);
      failCount++;
    }
  }

  // 输出总结
  console.log('\n🎊 批量预抓取完成！');
  console.log('=' .repeat(50));
  console.log(`📊 处理统计:`);
  console.log(`  • 成功处理: ${successCount} 天`);
  console.log(`  • 失败处理: ${failCount} 天`);
  console.log(`  • 总新闻数: ${totalNews} 条`);
  console.log(`  • 总分析数: ${totalAnalyses} 条`);
  console.log('=' .repeat(50));
}

// 如果直接运行此脚本
if (require.main === module) {
  batchScrapeAndAnalyze()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export { batchScrapeAndAnalyze };
