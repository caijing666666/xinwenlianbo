#!/usr/bin/env tsx

/**
 * 检查缺失日期的脚本
 */

import { getRecentNews, getRecentAnalyses } from '../lib/storage-adapter';

async function checkMissingDates() {
  console.log('📅 检查最近30天缺失的日期...\n');

  try {
    // 获取最近30天的数据
    const [news, analyses] = await Promise.all([
      getRecentNews(30),
      getRecentAnalyses(30)
    ]);

    // 生成最近30天的日期列表
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // 按日期分组现有数据
    const newsMap = new Map<string, number>();
    const analysisMap = new Map<string, number>();
    
    news.forEach(item => {
      const date = item.date;
      newsMap.set(date, (newsMap.get(date) || 0) + 1);
    });

    analyses.forEach(item => {
      const date = item.newsDate;
      analysisMap.set(date, (analysisMap.get(date) || 0) + 1);
    });

    console.log('📊 最近30天数据状态:');
    console.log('日期       | 新闻 | 分析 | 状态');
    console.log('-----------|------|------|------');
    
    const missingDates: string[] = [];
    const incompleteAnalysis: string[] = [];
    
    dates.forEach(date => {
      const newsCount = newsMap.get(date) || 0;
      const analysisCount = analysisMap.get(date) || 0;
      
      let status = '';
      if (newsCount === 0) {
        status = '❌ 无数据';
        missingDates.push(date);
      } else if (analysisCount === 0) {
        status = '⏳ 待分析';
        incompleteAnalysis.push(date);
      } else {
        status = '✅ 完整';
      }
      
      console.log(`${date} |  ${newsCount.toString().padStart(2)}  |  ${analysisCount.toString().padStart(2)}  | ${status}`);
    });

    console.log('\n📋 缺失数据汇总:');
    console.log(`• 完全缺失的日期 (${missingDates.length}个):`);
    if (missingDates.length > 0) {
      missingDates.forEach(date => console.log(`  - ${date}`));
    } else {
      console.log('  无');
    }
    
    console.log(`• 缺少分析的日期 (${incompleteAnalysis.length}个):`);
    if (incompleteAnalysis.length > 0) {
      incompleteAnalysis.forEach(date => console.log(`  - ${date}`));
    } else {
      console.log('  无');
    }

    console.log('\n🎯 建议操作:');
    if (missingDates.length > 0) {
      console.log('• 对缺失日期重新运行抓取脚本');
      console.log('• 检查数据源在这些日期是否可用');
    }
    if (incompleteAnalysis.length > 0) {
      console.log('• 对待分析日期运行AI分析');
    }
    if (missingDates.length === 0 && incompleteAnalysis.length === 0) {
      console.log('• 数据完整，无需额外操作');
    }

  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  checkMissingDates()
    .then(() => {
      console.log('\n✅ 检查完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 检查失败:', error);
      process.exit(1);
    });
}

export { checkMissingDates };
