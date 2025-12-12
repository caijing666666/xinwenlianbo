#!/usr/bin/env tsx

/**
 * 批量分析最近30天的新闻数据
 * 用于预分析历史数据，避免用户等待
 */

import { getNewsByDate, getAnalysisByDate, hasAnalysisForDate, saveAnalysisForDate } from '../lib/analysis-store';
import { analyzeMultipleNews } from '../lib/analyzer';

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

// 分析单个日期
async function analyzeDate(date: string): Promise<{
  date: string;
  status: 'cached' | 'analyzed' | 'no-news' | 'failed';
  count: number;
  message: string;
}> {
  try {
    console.log(`\n📅 处理日期: ${date}`);
    
    // 1. 检查是否已有分析结果
    const hasAnalysis = await hasAnalysisForDate(date);
    if (hasAnalysis) {
      console.log(`✅ ${date} 已有分析结果，跳过`);
      const existingAnalyses = await getAnalysisByDate(date);
      return {
        date,
        status: 'cached',
        count: existingAnalyses.length,
        message: `已有 ${existingAnalyses.length} 条分析结果`
      };
    }
    
    // 2. 获取新闻数据
    const newsList = await getNewsByDate(date);
    if (newsList.length === 0) {
      console.log(`⚠️  ${date} 没有新闻数据`);
      return {
        date,
        status: 'no-news',
        count: 0,
        message: '没有新闻数据'
      };
    }
    
    console.log(`📊 找到 ${newsList.length} 条新闻，开始AI分析...`);
    
    // 3. AI分析（这里会很慢）
    const analyses = await analyzeMultipleNews(newsList);
    
    if (analyses.length === 0) {
      console.log(`❌ ${date} AI分析失败`);
      return {
        date,
        status: 'failed',
        count: 0,
        message: 'AI分析失败'
      };
    }
    
    // 4. 保存结果
    await saveAnalysisForDate(date, analyses);
    console.log(`✅ ${date} 分析完成，保存 ${analyses.length} 条结果`);
    
    return {
      date,
      status: 'analyzed',
      count: analyses.length,
      message: `新分析 ${analyses.length} 条新闻`
    };
    
  } catch (error) {
    console.error(`❌ ${date} 分析失败:`, error);
    return {
      date,
      status: 'failed',
      count: 0,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
}

async function main() {
  console.log('🚀 开始批量分析最近30天的新闻数据...\n');
  
  const dates = getRecentDates(30);
  const results: Array<{
    date: string;
    status: 'cached' | 'analyzed' | 'no-news' | 'failed';
    count: number;
    message: string;
  }> = [];
  
  let processed = 0;
  let cached = 0;
  let analyzed = 0;
  let noNews = 0;
  let failed = 0;
  
  for (const date of dates) {
    const result = await analyzeDate(date);
    results.push(result);
    
    processed++;
    switch (result.status) {
      case 'cached': cached++; break;
      case 'analyzed': analyzed++; break;
      case 'no-news': noNews++; break;
      case 'failed': failed++; break;
    }
    
    console.log(`\n📈 进度: ${processed}/${dates.length} (${Math.round(processed/dates.length*100)}%)`);
    console.log(`   缓存: ${cached}, 新分析: ${analyzed}, 无数据: ${noNews}, 失败: ${failed}`);
    
    // 避免API请求过快，每个日期间隔5秒
    if (processed < dates.length) {
      console.log('⏳ 等待5秒...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // 最终统计
  console.log('\n🎉 批量分析完成！');
  console.log('📊 最终统计:');
  console.log(`   总处理: ${processed} 天`);
  console.log(`   ✅ 缓存命中: ${cached} 天`);
  console.log(`   🆕 新分析: ${analyzed} 天`);
  console.log(`   ⚠️  无新闻数据: ${noNews} 天`);
  console.log(`   ❌ 分析失败: ${failed} 天`);
  
  // 显示详细结果
  console.log('\n📋 详细结果:');
  results.forEach(result => {
    const statusIcon = {
      'cached': '✅',
      'analyzed': '🆕',
      'no-news': '⚠️',
      'failed': '❌'
    }[result.status];
    
    console.log(`   ${statusIcon} ${result.date}: ${result.message}`);
  });
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

export { main as batchAnalyze30Days };
