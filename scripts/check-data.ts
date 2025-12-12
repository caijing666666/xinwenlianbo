#!/usr/bin/env tsx

/**
 * 快速检查数据状态脚本
 */

import { getRecentNews, getRecentAnalyses } from '../lib/storage-adapter';

async function checkDataStatus() {
  console.log('📊 检查数据状态...\n');

  try {
    // 获取最近30天的数据
    const [news, analyses] = await Promise.all([
      getRecentNews(30),
      getRecentAnalyses(30)
    ]);

    console.log(`📰 新闻数据: ${news.length} 条`);
    console.log(`🧠 分析数据: ${analyses.length} 条\n`);

    // 按日期分组
    const dateStats = new Map<string, { newsCount: number; analysisCount: number }>();
    
    news.forEach((item: any) => {
      const date = item.date;
      if (!dateStats.has(date)) {
        dateStats.set(date, { newsCount: 0, analysisCount: 0 });
      }
      dateStats.get(date)!.newsCount++;
    });

    analyses.forEach((item: any) => {
      const date = item.newsDate;
      if (!dateStats.has(date)) {
        dateStats.set(date, { newsCount: 0, analysisCount: 0 });
      }
      dateStats.get(date)!.analysisCount++;
    });

    // 按日期排序并显示
    const sortedDates = Array.from(dateStats.entries())
      .sort(([a], [b]) => b.localeCompare(a));

    console.log('📅 每日数据统计:');
    console.log('日期       | 新闻 | 分析 | 状态');
    console.log('-----------|------|------|------');
    
    let completeCount = 0;
    sortedDates.forEach(([date, stats]) => {
      const status = stats.analysisCount > 0 ? '✅ 完整' : 
                    stats.newsCount > 0 ? '⏳ 待分析' : '❌ 无数据';
      if (stats.analysisCount > 0) completeCount++;
      
      console.log(`${date} |  ${stats.newsCount.toString().padStart(2)}  |  ${stats.analysisCount.toString().padStart(2)}  | ${status}`);
    });

    console.log('\n📊 总体统计:');
    console.log(`• 有数据的天数: ${sortedDates.length}/30`);
    console.log(`• 完整数据天数: ${completeCount}/30`);
    console.log(`• 完成进度: ${Math.round((completeCount / 30) * 100)}%`);

  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  checkDataStatus()
    .then(() => {
      console.log('\n✅ 检查完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 检查失败:', error);
      process.exit(1);
    });
}

export { checkDataStatus };
