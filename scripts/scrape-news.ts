import { scrapeNewsData, scrapeRecentNews } from '../lib/scraper';
// 自动适配存储后端（开发=本地文件，生产=Vercel KV）
import { saveMultipleNews } from '../lib/storage-adapter';

async function main() {
  console.log('🚀 开始抓取新闻联播数据...\n');

  const args = process.argv.slice(2);
  const date = args[0]; // 可选：指定日期 YYYY-MM-DD
  const days = args[1] ? parseInt(args[1]) : 1; // 可选：抓取天数

  try {
    let newsList;

    if (date) {
      console.log(`📅 抓取日期：${date}`);
      newsList = await scrapeNewsData(date);
    } else if (days > 1) {
      console.log(`📅 抓取最近 ${days} 天的数据`);
      newsList = await scrapeRecentNews(days);
    } else {
      console.log(`📅 抓取今日数据`);
      newsList = await scrapeNewsData();
    }

    if (newsList.length === 0) {
      console.log('⚠️  未抓取到新闻数据');
      return;
    }

    console.log(`\n✅ 成功抓取 ${newsList.length} 条新闻`);
    console.log('💾 正在保存到数据库...');

    await saveMultipleNews(newsList);

    console.log('✅ 数据保存完成！\n');

    // 显示部分抓取结果
    console.log('📰 抓取的新闻预览：');
    newsList.slice(0, 3).forEach((news, index) => {
      console.log(`\n${index + 1}. ${news.title}`);
      console.log(`   ${news.content.substring(0, 100)}...`);
    });

    console.log('\n🎉 抓取任务完成！');
    console.log('💡 下一步：运行 npm run analyze 进行 AI 分析');

  } catch (error) {
    console.error('❌ 抓取失败:', error);
    process.exit(1);
  }
}

main();
