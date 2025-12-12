#!/usr/bin/env tsx

/**
 * 实时进度监控脚本
 */

import { checkDataStatus } from './check-data';

async function monitorProgress() {
  console.log('🔄 开始实时监控批量预抓取进度...\n');
  console.log('按 Ctrl+C 停止监控\n');

  let lastCompleteCount = 0;

  const monitor = async () => {
    try {
      console.clear();
      console.log('📊 新闻联播投资分析系统 - 实时进度监控');
      console.log('=' .repeat(60));
      console.log(`⏰ 监控时间: ${new Date().toLocaleString('zh-CN')}\n`);

      // 这里直接调用检查逻辑，但不退出进程
      const { getRecentNews, getRecentAnalyses } = await import('../lib/storage-adapter');
      
      const [news, analyses] = await Promise.all([
        getRecentNews(30),
        getRecentAnalyses(30)
      ]);

      // 按日期分组
      const dateStats = new Map<string, { newsCount: number; analysisCount: number }>();
      
      news.forEach(item => {
        const date = item.date;
        if (!dateStats.has(date)) {
          dateStats.set(date, { newsCount: 0, analysisCount: 0 });
        }
        dateStats.get(date)!.newsCount++;
      });

      analyses.forEach(item => {
        const date = item.newsDate;
        if (!dateStats.has(date)) {
          dateStats.set(date, { newsCount: 0, analysisCount: 0 });
        }
        dateStats.get(date)!.analysisCount++;
      });

      const sortedDates = Array.from(dateStats.entries())
        .sort(([a], [b]) => b.localeCompare(a));

      let completeCount = 0;
      sortedDates.forEach(([, stats]) => {
        if (stats.analysisCount > 0) completeCount++;
      });

      // 进度条
      const progress = Math.round((completeCount / 30) * 100);
      const progressBar = '█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2));
      
      console.log(`📈 总体进度: ${progress}% (${completeCount}/30天)`);
      console.log(`[${progressBar}] ${completeCount}/30\n`);

      console.log(`📰 总新闻数: ${news.length} 条`);
      console.log(`🧠 总分析数: ${analyses.length} 条`);
      
      if (completeCount > lastCompleteCount) {
        console.log(`🎉 新完成 ${completeCount - lastCompleteCount} 天数据！`);
        lastCompleteCount = completeCount;
      }

      // 预计完成时间
      const remainingDays = 30 - completeCount;
      if (remainingDays > 0) {
        const estimatedMinutes = remainingDays * 3; // 每天约3分钟
        console.log(`⏱️  预计还需: ${estimatedMinutes} 分钟`);
        console.log(`🎯 预计完成: ${new Date(Date.now() + estimatedMinutes * 60000).toLocaleTimeString('zh-CN')}`);
      } else {
        console.log('🎊 所有数据处理完成！');
      }

      console.log('\n📅 最近完成的日期:');
      sortedDates.slice(0, 5).forEach(([date, stats]) => {
        const status = stats.analysisCount > 0 ? '✅' : stats.newsCount > 0 ? '⏳' : '❌';
        console.log(`  ${status} ${date}: ${stats.newsCount}条新闻 / ${stats.analysisCount}条分析`);
      });

      console.log('\n🔄 每30秒自动刷新...');

    } catch (error) {
      console.error('❌ 监控失败:', error);
    }
  };

  // 立即执行一次
  await monitor();

  // 每30秒刷新一次
  const interval = setInterval(monitor, 30000);

  // 处理退出信号
  process.on('SIGINT', () => {
    console.log('\n\n👋 停止监控');
    clearInterval(interval);
    process.exit(0);
  });
}

// 如果直接运行此脚本
if (require.main === module) {
  monitorProgress().catch(console.error);
}

export { monitorProgress };
