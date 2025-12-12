#!/usr/bin/env tsx

/**
 * 手动触发每日更新
 * 用于测试或紧急情况下的手动数据更新
 */

async function triggerManualUpdate() {
  console.log('🚀 手动触发每日更新任务...\n');
  
  try {
    // 本地开发环境
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://xinwenlianbo.netlify.app'
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/cron/daily-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 更新任务成功完成！');
      console.log(`📅 日期: ${result.date}`);
      console.log(`📰 新闻数量: ${result.newsCount}`);
      console.log(`🧠 分析数量: ${result.analysisCount}`);
      
      if (result.statistics) {
        console.log('\n📊 统计信息:');
        console.log(`  • 行业影响: ${result.statistics.industries} 条`);
        console.log(`  • 公司影响: ${result.statistics.companies} 条`);
        console.log(`  • 期货影响: ${result.statistics.futures} 条`);
        console.log(`  • 债券影响: ${result.statistics.bonds} 条`);
        console.log(`  • 市场情绪:`);
        console.log(`    - 看涨: ${result.statistics.sentiment.bullish} 条`);
        console.log(`    - 看跌: ${result.statistics.sentiment.bearish} 条`);
        console.log(`    - 中性: ${result.statistics.sentiment.neutral} 条`);
      }
    } else {
      console.log('❌ 更新任务失败:');
      console.log(result.message || result.error);
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  triggerManualUpdate()
    .then(() => {
      console.log('\n🎉 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export { triggerManualUpdate };
